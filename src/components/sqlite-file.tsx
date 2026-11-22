import { ReactNode, useEffect, useId, useMemo, useState } from "react";

const INK = "#171717";
const MUTED = "#70747d";
const FAINT = "#d4d6da";

const PAGE = 4096;
const SMALL_PAGE = 512;
const PER_ROW = 16;
const MAX_ROWS = 40;

const TABLE_SQL = "CREATE TABLE notes(id INTEGER PRIMARY KEY, body TEXT)";
const INDEX_SQL = "CREATE INDEX idx_body ON notes(body)";

const enc = new TextEncoder();

type Kind = "file" | "pageHdr" | "ptr" | "key" | "recHdr" | "data" | "root";
type Field = { bytes: number[]; kind: Kind; label: string; desc: string; jump?: number };
// group: start of the cell a region belongs to. target: for a cell pointer, the start of the cell it points to.
type Region = { start: number; end: number; kind: Kind; label: string; desc: string; group?: number; target?: number; jump?: number };
type Row = { id: number; body: string };

const KINDS: Record<Kind, { name: string; bg: string; fg: string }> = {
    file: { name: "File header", bg: "#e3e5e8", fg: INK },
    pageHdr: { name: "Page header", bg: "#cddcf2", fg: INK },
    ptr: { name: "Cell pointers", bg: "#f6dfa6", fg: INK },
    key: { name: "Cell size and rowid", bg: "#d3ebd5", fg: INK },
    recHdr: { name: "Record header", bg: "#a9d6af", fg: INK },
    data: { name: "Column values", bg: INK, fg: "#ffffff" },
    root: { name: "Page number (click to jump)", bg: "#f4b98a", fg: INK },
};

const hex = (n: number, width = 2) => n.toString(16).padStart(width, "0");
const u16 = (n: number) => [(n >> 8) & 255, n & 255];
const u32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
const sum = (fields: Field[]) => fields.reduce((a, f) => a + f.bytes.length, 0);

// SQLite varint: 7 bits per byte, big-endian, top bit set on every byte except the last
const varint = (n: number): number[] => {
    const out = [n & 0x7f];
    n = Math.floor(n / 128);
    while (n > 0) {
        out.unshift((n & 0x7f) | 0x80);
        n = Math.floor(n / 128);
    }
    return out;
};

const intType = (v: number) => (v === 0 ? 8 : v === 1 ? 9 : v <= 127 ? 1 : 2);
const intBytes = (v: number) => (v <= 1 ? [] : v <= 127 ? [v] : u16(v));

const typeDesc = (t: number) => {
    if (t === 0) return "NULL";
    if (t === 1) return "8-bit integer, 1 byte";
    if (t === 2) return "16-bit integer, 2 bytes";
    if (t === 8) return "the integer 0, with no data bytes";
    if (t === 9) return "the integer 1, with no data bytes";
    if (t >= 13 && t % 2 === 1) return `text, ${(t - 13) / 2} bytes`;
    return "unknown";
};

type Col = { type: number; data: number[]; name: string; shown: string; note?: string; kind?: Kind; jump?: number };

const textCol = (s: string, name: string, shown?: string): Col => {
    const data = Array.from(enc.encode(s));
    return { type: 13 + 2 * data.length, data, name, shown: shown ?? `TEXT "${s}", ${data.length} bytes of UTF-8` };
};

const intCol = (v: number, name: string, shown: string): Col => ({ type: intType(v), data: intBytes(v), name, shown });

// A record is a header (its own size, then one serial type per column) followed by the column values
const record = (cols: Col[], who: string): Field[] => {
    const types = cols.map((c) => varint(c.type));
    const hdrLen = 1 + types.reduce((a, t) => a + t.length, 0);
    const out: Field[] = [
        {
            bytes: [hdrLen],
            kind: "recHdr",
            label: `${who}: record header size`,
            desc: `The record header is ${hdrLen} bytes long, and this byte counts. The column values start after it.`,
        },
    ];
    cols.forEach((c, i) =>
        out.push({
            bytes: types[i],
            kind: "recHdr",
            label: `${who}: type of ${c.name}`,
            desc: c.note ?? `Serial type ${c.type} means ${typeDesc(c.type)}.`,
        }),
    );
    cols.forEach((c) => {
        if (c.data.length) out.push({ bytes: c.data, kind: c.kind ?? "data", label: `${who}: ${c.name}`, desc: c.shown, jump: c.jump });
    });
    return out;
};

const cell = (payload: Field[], rowid: number | null, who: string): Field[] => {
    const size = sum(payload);
    const out: Field[] = [
        {
            bytes: varint(size),
            kind: "key",
            label: `${who}: payload size`,
            desc: `${size} bytes of record follow${rowid !== null ? " the rowid" : ""}.`,
        },
    ];
    if (rowid !== null) {
        out.push({
            bytes: varint(rowid),
            kind: "key",
            label: `${who}: rowid`,
            desc: `rowid ${rowid}. A table b-tree finds its rows by this number.`,
        });
    }
    return [...out, ...payload];
};

const fileHeader = (changes: number, ps: number, pageCount: number): Field[] => {
    const f = (bytes: number[], label: string, desc: string): Field => ({ bytes, kind: "file", label, desc });
    return [
        f(Array.from(enc.encode("SQLite format 3\0")), "Magic string", 'Every SQLite file starts with this text, so tools can see the file type. The last byte is zero.'),
        f(u16(ps), "Page size", `${ps} bytes per page. All pages have the same size, so page N starts at byte (N − 1) × ${ps}.`),
        f([1], "Write version", "1 means the rollback journal is in use. 2 would mean WAL."),
        f([1], "Read version", "1 means readers use the rollback journal. 2 would mean WAL."),
        f([0], "Reserved bytes per page", "Unused bytes at the end of each page. 0 here."),
        f([64, 32, 32], "Payload fractions", "Three fixed values (64, 32, 32). SQLite requires exactly these."),
        f(u32(changes), "File change counter", "Goes up by one on each committed write. Type in a row and watch it change."),
        f(u32(pageCount), "Size in pages", `${pageCount} pages. ${pageCount} × ${ps} = ${pageCount * ps}, the Size that stat reports.`),
        f(u32(0), "First freelist page", "0 means no free pages. Pages with no more data are linked here for reuse."),
        f(u32(0), "Freelist page count", "0 free pages."),
        f(u32(2), "Schema cookie", "Goes up when the schema changes. Two objects were created: the table and the index."),
        f(u32(4), "Schema format", "4 is the current schema format number."),
        f(u32(0), "Default cache size", "0 means use the built-in default."),
        f(u32(0), "Largest root page", "0 unless auto-vacuum is on."),
        f(u32(1), "Text encoding", "1 means UTF-8. (2 is UTF-16le, 3 is UTF-16be.)"),
        f(u32(0), "User version", "Free for your app to use. Set it with PRAGMA user_version."),
        f(u32(0), "Incremental vacuum", "0 means off."),
        f(u32(0), "Application id", "Free for your app to use. Set it with PRAGMA application_id."),
        f(new Array(20).fill(0), "Reserved", "20 bytes kept for future use. Always zero."),
        f(u32(changes), "Version-valid-for", "A copy of the change counter. It tells SQLite that the version number below is up to date."),
        f(u32(3045000), "SQLite version", "3045000 means version 3.45.0. It is the version that last wrote the file."),
    ];
};

type Built = { file: Uint8Array; regions: Region[]; regionAt: Int16Array; ps: number; pageCount: number; roles: string[] };

const PAGE_TYPES: Record<number, string> = {
    0x0d: "0x0d means a leaf page of a table b-tree. It holds rows.",
    0x0a: "0x0a means a leaf page of an index b-tree. It holds index entries.",
    0x05: "0x05 means an interior page of a table b-tree. It holds keys and child page numbers, and no rows.",
    0x02: "0x02 means an interior page of an index b-tree. Each cell holds a child page number and one full index entry.",
};

// Write one b-tree page: page header, cell pointer array, and cells packed from the end of the page.
// `order` is the order of the pointer array, which is sorted by key. The cells themselves sit in insertion order.
// An interior page has a 12-byte header, because it also stores the right-most child page number.
const writePage = (
    file: Uint8Array,
    regions: Region[],
    ps: number,
    page: number,
    pageType: number,
    cells: Field[][],
    order: number[],
    headerAt: number,
    rightmost?: number,
) => {
    const base = page * ps;
    let top = ps;
    const starts: number[] = [];

    cells.forEach((c, i) => {
        top -= sum(c);
        starts[i] = top;
        let p = base + top;
        const group = p;
        c.forEach((fld) => {
            file.set(fld.bytes, p);
            regions.push({ start: p, end: p + fld.bytes.length, kind: fld.kind, label: fld.label, desc: fld.desc, group, jump: fld.jump });
            p += fld.bytes.length;
        });
    });

    const put = (at: number, bytes: number[], kind: Kind, label: string, desc: string, target?: number, jump?: number) => {
        file.set(bytes, base + at);
        regions.push({ start: base + at, end: base + at + bytes.length, kind, label, desc, target, jump });
    };

    const interior = rightmost !== undefined;
    const h = headerAt;
    put(h, [pageType], "pageHdr", "Page type", PAGE_TYPES[pageType]);
    put(h + 1, u16(0), "pageHdr", "First free block", "0 means no free blocks inside the cell area.");
    put(h + 3, u16(cells.length), "pageHdr", "Cell count", `${cells.length} cells on this page.`);
    put(h + 5, u16(top), "pageHdr", "Cell content start", `The cell area starts at byte ${top} of this page. New cells are added below it, so the area grows toward the pointers.`);
    put(h + 7, [0], "pageHdr", "Fragmented bytes", "0 bytes of small gaps between cells.");
    if (interior) {
        put(
            h + 8,
            u32(rightmost),
            "root",
            "Right-most child",
            `Page ${rightmost}. Keys bigger than every key in this page's cells live under it. Click to jump to that page.`,
            undefined,
            rightmost,
        );
    }
    const ptrAt = h + (interior ? 12 : 8);
    order.forEach((ci, k) =>
        put(
            ptrAt + 2 * k,
            u16(starts[ci]),
            "ptr",
            `Cell pointer ${k + 1}`,
            `Cell ${k + 1} starts at byte ${starts[ci]} (0x${hex(starts[ci], 3)}) of this page. The pointers are kept in key order, so the cells can stay where they are. Click to jump to the cell.`,
            base + starts[ci],
        ),
    );
};

const compareBytes = (a: Uint8Array, b: Uint8Array) => {
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
};

const childField = (child: number, why: string, who: string): Field => ({
    bytes: u32(child),
    kind: "root",
    label: `${who}: child page`,
    desc: `Child page ${child}. ${why} Click to jump to that page.`,
    jump: child,
});

const build = (rows: Row[], changes: number, ps: number): Built => {
    // Cells do not depend on where they end up, so make them first
    const schemaRow = (n: number, type: string, name: string, root: number, sql: string) => {
        const who = `Schema row ${n}`;
        return cell(
            record(
                [
                    textCol(type, "type"),
                    textCol(name, "name"),
                    textCol("notes", "tbl_name"),
                    {
                        ...intCol(root, "rootpage", `Integer ${root}. The b-tree for "${name}" starts on page ${root}, at byte ${(root - 1) * ps}. Click to jump to that page.`),
                        kind: "root",
                        jump: root,
                    },
                    textCol(sql, "sql", `The SQL text that created it: ${sql}`),
                ],
                who,
            ),
            n,
            who,
        );
    };
    const schemaCells = [schemaRow(1, "table", "notes", 2, TABLE_SQL), schemaRow(2, "index", "idx_body", 3, INDEX_SQL)];

    const tableCells = rows.map((r) => {
        const who = `Row ${r.id}`;
        return cell(
            record(
                [
                    {
                        type: 0,
                        data: [],
                        name: "id",
                        shown: "",
                        note: "Serial type 0 means NULL. The column id is INTEGER PRIMARY KEY, so it is another name for the rowid. SQLite does not store it twice.",
                    },
                    textCol(r.body, "body"),
                ],
                who,
            ),
            r.id,
            who,
        );
    });

    const indexCells = rows.map((r) => {
        const who = `Index entry for row ${r.id}`;
        return cell(record([textCol(r.body, "body"), intCol(r.id, "rowid", `rowid ${r.id}. It points back to the row in the table.`)], who), null, who);
    });
    const encoded = rows.map((r) => enc.encode(r.body));
    const sorted = rows.map((_, i) => i).sort((a, b) => compareBytes(encoded[a], encoded[b]) || rows[a].id - rows[b].id);

    // Table: fill leaf pages in rowid order. More than one leaf means the root becomes an interior page.
    const tChunks: number[][] = [[]];
    let used = 8;
    tableCells.forEach((c, i) => {
        const need = sum(c) + 2;
        if (used + need > ps && tChunks[tChunks.length - 1].length) {
            tChunks.push([]);
            used = 8;
        }
        tChunks[tChunks.length - 1].push(i);
        used += need;
    });

    // Index: fill leaf pages in key order. The entry that does not fit becomes a separator in the parent, and is not kept in a leaf.
    const iLeaves: number[][] = [[]];
    const seps: number[] = [];
    used = 8;
    sorted.forEach((idx, n) => {
        const need = sum(indexCells[idx]) + 2;
        const leaf = iLeaves[iLeaves.length - 1];
        if (used + need > ps && leaf.length) {
            if (n === sorted.length - 1) {
                seps.push(leaf.pop() as number);
                iLeaves.push([idx]);
            } else {
                seps.push(idx);
                iLeaves.push([]);
            }
            used = 8;
            iLeaves[iLeaves.length - 1].forEach((k) => (used += sum(indexCells[k]) + 2));
        } else {
            leaf.push(idx);
            used += need;
        }
    });

    // The root pages stay on pages 2 and 3. Extra leaf pages are added after them.
    let next = 4;
    const tLeafPages = tChunks.length > 1 ? tChunks.map(() => next++) : [];
    const iLeafPages = iLeaves.length > 1 ? iLeaves.map(() => next++) : [];
    const pageCount = next - 1;

    const roles = ["schema", tChunks.length > 1 ? "notes root" : "table notes", iLeaves.length > 1 ? "idx_body root" : "index idx_body"];
    tLeafPages.forEach(() => roles.push("notes leaf"));
    iLeafPages.forEach(() => roles.push("idx_body leaf"));

    const file = new Uint8Array(ps * pageCount);
    const regions: Region[] = [];

    let p = 0;
    fileHeader(changes, ps, pageCount).forEach((fld) => {
        file.set(fld.bytes, p);
        regions.push({ start: p, end: p + fld.bytes.length, kind: fld.kind, label: fld.label, desc: fld.desc });
        p += fld.bytes.length;
    });

    writePage(file, regions, ps, 0, 0x0d, schemaCells, [0, 1], 100);

    // Table pages
    if (tChunks.length === 1) {
        writePage(file, regions, ps, 1, 0x0d, tableCells, rows.map((_, i) => i), 0);
    } else {
        tChunks.forEach((ch, k) => writePage(file, regions, ps, tLeafPages[k] - 1, 0x0d, ch.map((i) => tableCells[i]), ch.map((_, j) => j), 0));
        const inner = tChunks.slice(0, -1).map((ch, k) => {
            const who = `Interior cell ${k + 1}`;
            const maxId = rows[ch[ch.length - 1]].id;
            return [
                childField(tLeafPages[k], `Rows with rowid up to ${maxId} live below it.`, who),
                { bytes: varint(maxId), kind: "key" as Kind, label: `${who}: key`, desc: `The largest rowid under page ${tLeafPages[k]} is ${maxId}.` },
            ];
        });
        writePage(file, regions, ps, 1, 0x05, inner, inner.map((_, i) => i), 0, tLeafPages[tLeafPages.length - 1]);
    }

    // Index pages. Cells sit in insertion order, the pointers are in key order.
    const writeIndexLeaf = (page: number, leaf: number[]) => {
        const physical = [...leaf].sort((a, b) => a - b);
        writePage(file, regions, ps, page, 0x0a, physical.map((i) => indexCells[i]), leaf.map((i) => physical.indexOf(i)), 0);
    };
    if (iLeaves.length === 1) {
        writeIndexLeaf(2, iLeaves[0]);
    } else {
        iLeaves.forEach((leaf, k) => writeIndexLeaf(iLeafPages[k] - 1, leaf));
        const inner = seps.map((idx, k) => [
            childField(iLeafPages[k], `Entries smaller than the entry in this cell live below it.`, `Interior cell ${k + 1}`),
            ...indexCells[idx],
        ]);
        writePage(file, regions, ps, 2, 0x02, inner, inner.map((_, i) => i), 0, iLeafPages[iLeafPages.length - 1]);
    }

    const regionAt = new Int16Array(file.length).fill(-1);
    regions.forEach((r, i) => regionAt.fill(i, r.start, r.end));
    return { file, regions, regionAt, ps, pageCount, roles };
};

type State = { rows: Row[]; prev: Row[]; changes: number; prevChanges: number; ps: number; prevPs: number };

const START: Row[] = [
    { id: 1, body: "hello" },
    { id: 2, body: "sqlite" },
];

const filler = "abcdefghijklmnop";
const sample = (id: number) => `row ${id} ${filler}`;

export default function SqliteFile() {
    const [state, setState] = useState<State>({ rows: START, prev: START, changes: 4, prevChanges: 4, ps: PAGE, prevPs: PAGE });
    const [tab, setTab] = useState(1);
    const [hover, setHover] = useState<number | null>(null);
    const [pinned, setPinned] = useState<number | null>(null);
    const [pinnedPage, setPinnedPage] = useState<number | null>(null);
    const uid = useId();

    const { rows, prev, changes, prevChanges, ps, prevPs } = state;
    const built = useMemo(() => build(rows, changes, ps), [rows, changes, ps]);
    const before = useMemo(() => build(prev, prevChanges, prevPs), [prev, prevChanges, prevPs]);

    const commit = (next: Row[]) => (setPinned(null), setPinnedPage(null), setState((s) => ({ ...s, rows: next, prev: s.rows, changes: s.changes + 1, prevChanges: s.changes, prevPs: s.ps })));
    const edit = (id: number, body: string) => commit(rows.map((r) => (r.id === id ? { ...r, body } : r)));
    const add = (count = 1) => {
        const out = [...rows];
        for (let k = 0; k < count && out.length < MAX_ROWS; k++) {
            const id = Math.max(0, ...out.map((r) => r.id)) + 1;
            out.push({ id, body: sample(id) });
        }
        commit(out);
    };
    const setSize = (size: number) => {
        if (size === ps) return;
        setPinned(null);
        setPinnedPage(null);
        setHover(null);
        setState((s) => ({ ...s, prev: s.rows, prevChanges: s.changes, prevPs: s.ps, ps: size, changes: s.changes + 1 }));
    };
    const remove = (id: number) => commit(rows.filter((r) => r.id !== id));

    const t = Math.min(tab, built.pageCount - 1);
    const start = t * built.ps;
    const active = hover !== null ? built.regionAt[hover] : -1;
    const region = active >= 0 ? built.regions[active] : null;

    // A jumped-to cell stays lit until you click somewhere else
    const pinnedEnd = pinned === null ? 0 : Math.max(...built.regions.filter((g) => g.group === pinned).map((g) => g.end));
    const lit = (abs: number) => {
        const ri = built.regionAt[abs];
        if (pinned !== null) return ri >= 0 && built.regions[ri].group === pinned;
        if (pinnedPage !== null) {
            const g = built.regions[ri];
            return ri >= 0 && (g.kind === "pageHdr" || g.kind === "root") && g.start >= (pinnedPage - 1) * built.ps && g.start < pinnedPage * built.ps;
        }
        return active < 0 || ri === active;
    };

    const pick = (abs: number) => {
        const g = built.regions[built.regionAt[abs]];
        if (g?.jump !== undefined) {
            // A root page number: switch to that page and light its header
            setTab(g.jump - 1);
            setPinned(null);
            setPinnedPage(g.jump);
            setHover(null);
            return;
        }
        setPinnedPage(null);
        setPinned(g?.kind === "ptr" && g.target !== undefined ? g.target : null);
        setHover(abs);
    };

    useEffect(() => {
        const at = pinned ?? (pinnedPage !== null ? (pinnedPage - 1) * built.ps : null);
        if (at === null) return;
        document.getElementById(`${uid}-${at}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, [pinned, pinnedPage, uid]);

    const isBlank = (r: number) => {
        const s = start + r * PER_ROW;
        for (let k = 0; k < PER_ROW; k++) if (built.file[s + k] !== 0 || built.regionAt[s + k] !== -1) return false;
        return true;
    };

    const styleFor = (abs: number) => {
        const ri = built.regionAt[abs];
        const k = ri >= 0 ? KINDS[built.regions[ri].kind] : null;
        return {
            background: k?.bg,
            color: k?.fg ?? MUTED,
            opacity: lit(abs) ? 1 : 0.3,
            boxShadow: k && (built.regions[ri].kind === "ptr" || built.regions[ri].jump !== undefined) ? `inset 0 -2px 0 ${INK}` : undefined,
            outline: abs === hover ? `1px solid ${INK}` : undefined,
            outlineOffset: -1,
        };
    };

    const lines: ReactNode[] = [];
    const totalRows = built.ps / PER_ROW;
    for (let r = 0; r < totalRows; r++) {
        if (isBlank(r)) {
            let e = r;
            while (e < totalRows && isBlank(e)) e++;
            if (e - r >= 2) {
                lines.push(
                    <div key={`z${r}`} className="font-mono text-[12px] leading-6 text-[#70747d] flex gap-4">
                        <span className="w-[4ch]">⋯</span>
                        <span>
                            {(e - r) * PER_ROW} bytes of zeros (0x{hex(start + r * PER_ROW, 4)} to 0x{hex(start + e * PER_ROW - 1, 4)})
                        </span>
                    </div>,
                );
                r = e - 1;
                continue;
            }
        }
        const rowStart = start + r * PER_ROW;
        lines.push(
            <div key={r} className="font-mono text-[12px] leading-6 flex gap-4 whitespace-pre">
                <span className="w-[4ch] text-[#70747d]">{hex(rowStart, 4)}</span>
                <span className="flex-[3] min-w-0 grid" style={{ gridTemplateColumns: `repeat(${PER_ROW}, minmax(0, 1fr))` }}>
                    {Array.from({ length: PER_ROW }, (_, k) => {
                        const abs = rowStart + k;
                        const changed = built.file[abs] !== before.file[abs];
                        return (
                            <span
                                key={k}
                                id={`${uid}-${abs}`}
                                onMouseEnter={() => setHover(abs)}
                                onClick={() => pick(abs)}
                                style={styleFor(abs)}
                                className={`text-center ${changed ? "underline decoration-2 underline-offset-2" : ""}`}
                            >
                                {hex(built.file[abs])}
                            </span>
                        );
                    })}
                </span>
                <span className="flex-[2] min-w-0 grid border-l border-[#d4d6da] pl-4 text-[14px]" style={{ gridTemplateColumns: `repeat(${PER_ROW}, minmax(0, 1fr))` }}>
                    {Array.from({ length: PER_ROW }, (_, k) => {
                        const abs = rowStart + k;
                        const b = built.file[abs];
                        const printable = b >= 32 && b <= 126;
                        return (
                            <span
                                key={k}
                                onMouseEnter={() => setHover(abs)}
                                onClick={() => pick(abs)}
                                style={styleFor(abs)}
                                className="text-center"
                            >
                                {printable ? String.fromCharCode(b) : "."}
                            </span>
                        );
                    })}
                </span>
            </div>,
        );
    }

    const button = "border border-black px-3 py-1 text-sm cursor-none transition-colors";

    return (
        <figure className="not-prose my-12">
            <div className="mb-8">
                <div className="mb-8">
                    <div className="text-xs tracking-[0.2em] text-[#70747d] mb-2">YOUR TABLE</div>
                    <pre className="font-mono text-[11px] leading-relaxed text-[#70747d] whitespace-pre-wrap mb-3">{TABLE_SQL};{"\n"}{INDEX_SQL};</pre>
                    <div className="grid grid-cols-[2rem_minmax(0,1fr)_2rem] gap-2 text-[11px] tracking-[0.2em] text-[#70747d] pb-1 border-b border-black">
                        <span>id</span>
                        <span>body</span>
                        <span />
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                    {rows.map((r) => (
                        <div key={r.id} className="grid grid-cols-[2rem_minmax(0,1fr)_2rem] gap-2 items-center py-1 border-b border-[#d4d6da]">
                            <span className="font-mono text-[13px]">{r.id}</span>
                            <input
                                value={r.body}
                                maxLength={32}
                                spellCheck={false}
                                onChange={(e) => edit(r.id, e.target.value)}
                                aria-label={`body of row ${r.id}`}
                                className="border border-black px-2 py-1 font-mono text-[13px] w-full bg-white"
                            />
                            <button onClick={() => remove(r.id)} aria-label={`delete row ${r.id}`} className="cursor-none text-[#70747d] hover:text-black">
                                ×
                            </button>
                        </div>
                    ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <button onClick={() => add(1)} disabled={rows.length >= MAX_ROWS} className={`${button} bg-white hover:bg-neutral-100 disabled:opacity-40`}>
                            INSERT ROW
                        </button>
                        <button onClick={() => add(5)} disabled={rows.length >= MAX_ROWS} className={`${button} bg-white hover:bg-neutral-100 disabled:opacity-40`}>
                            INSERT 5 ROWS
                        </button>
                        <span className="text-xs text-[#70747d]">
                            {rows.length} of {MAX_ROWS} rows
                        </span>
                    </div>
                    <p className="text-xs text-[#70747d] mt-3">Type in a body. Try an accent (é) or an emoji, and see how many bytes it takes.</p>

                    <div className="mt-6 border-t border-black pt-3">
                        <div className="text-xs tracking-[0.2em] text-[#70747d] mb-2">PAGE SIZE</div>
                        <div className="flex flex-wrap items-center gap-2">
                            {[PAGE, SMALL_PAGE].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSize(size)}
                                    className={`${button} font-mono ${size === ps ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"}`}
                                >
                                    {size} bytes
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-[#70747d] mt-2">
                            {ps === PAGE
                                ? "Pages are big, so a few rows never fill one. Switch to 512 bytes, then insert rows to make the tree grow."
                                : "Pages are small. Keep inserting rows. When a leaf page is full, the table root becomes an interior page that points to leaf pages."}
                        </p>
                    </div>
                </div>

                <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {built.roles.map((role, i) => (
                            <button
                                key={`${i}-${role}`}
                                onClick={() => {
                                    setTab(i);
                                    setHover(null);
                                    setPinned(null);
                                    setPinnedPage(null);
                                }}
                                className={`${button} font-mono ${i === t ? "bg-black text-white" : "bg-white text-black hover:bg-neutral-100"}`}
                            >
                                Page {i + 1} · {role}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto" onMouseLeave={() => setHover(null)}>
                        <div className="min-w-[460px]">
                            <div className="font-mono text-[10px] tracking-[0.2em] text-[#70747d] flex gap-4 border-b border-black pb-1 mb-1 whitespace-pre">
                                <span className="w-[4ch]">AT</span>
                                <span className="flex-[3]">HEX</span>
                                <span className="flex-[2] pl-4">TEXT</span>
                            </div>
                            {lines}
                        </div>
                    </div>

                    <div className="mt-4 border-t border-black pt-3 min-h-[7.5rem] text-sm">
                        {region ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 border border-black" style={{ background: KINDS[region.kind].bg }} />
                                    <span className="font-medium">{region.label}</span>
                                </div>
                                <div className="font-mono text-[12px] text-[#70747d] mt-1">
                                    0x{hex(region.start, 4)}
                                    {region.end - region.start > 1 ? ` to 0x${hex(region.end - 1, 4)}` : ""} · {region.end - region.start} byte
                                    {region.end - region.start > 1 ? "s" : ""} ·{" "}
                                    {Array.from(built.file.slice(region.start, Math.min(region.end, region.start + 12)), (b) => hex(b)).join(" ")}
                                    {region.end - region.start > 12 ? " …" : ""}
                                </div>
                                <p className="mt-2">{region.desc}</p>
                            </>
                        ) : pinned !== null ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 border border-black bg-black" />
                                    <span className="font-medium">Cell at byte 0x{hex(pinned, 4)}</span>
                                </div>
                                <div className="font-mono text-[12px] text-[#70747d] mt-1">
                                    0x{hex(pinned, 4)} to 0x{hex(pinnedEnd - 1, 4)} · {pinnedEnd - pinned} bytes
                                </div>
                                <p className="mt-2">
                                    This is where the pointer led. The cell is lit, and everything else is dimmed. Point at its parts to read them.{" "}
                                    <button onClick={() => setPinned(null)} className="underline cursor-none">
                                        Clear
                                    </button>
                                </p>
                            </>
                        ) : pinnedPage !== null ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 border border-black" style={{ background: KINDS.root.bg }} />
                                    <span className="font-medium">Page {pinnedPage}</span>
                                </div>
                                <div className="font-mono text-[12px] text-[#70747d] mt-1">
                                    starts at byte {(pinnedPage - 1) * built.ps} (0x{hex((pinnedPage - 1) * built.ps, 4)}) = ({pinnedPage} − 1) × {built.ps}
                                </div>
                                <p className="mt-2">
                                    This is where the page number led. The page header of this page is lit. Point at it to read it.{" "}
                                    <button onClick={() => setPinnedPage(null)} className="underline cursor-none">
                                        Clear
                                    </button>
                                </p>
                            </>
                        ) : (
                            <p className="text-[#70747d]">
                                {hover === null ? "Point at a byte to see what it means." : "Unused space. These bytes are zero and hold nothing."}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-[#70747d]">
                        {(Object.keys(KINDS) as Kind[]).map((k) => (
                            <span key={k} className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 border border-black/30" style={{ background: KINDS[k].bg }} />
                                {KINDS[k].name}
                            </span>
                        ))}
                        <span className="flex items-center gap-1.5">
                            <span className="underline decoration-2 underline-offset-2 text-black">00</span> changed by your last edit
                        </span>
                    </div>
                </div>
            </div>

            <figcaption className="text-sm text-[#70747d]">
                The file is {built.pageCount} pages of {built.ps} bytes. Page 1 holds the 100-byte file header and the schema. Each page then has a small
                header, a list of 2-byte pointers, and the cells (the rows). The cells fill the page from the end, and the pointers grow from
                the front. Each cell starts with its size and rowid, then a record header, then the column values. Text is plain UTF-8, so you
                can read it in the right-hand column. With 512-byte pages, a table soon needs more than one leaf page. Then page 2 stays the root, but it becomes an interior page. Its cells hold child page numbers, and the rows move to new leaf pages. This viewer rebuilds each page from scratch on every edit. Real SQLite edits a page in
                place, and bytes of deleted rows can stay in the file until something overwrites them.
            </figcaption>
        </figure>
    );
}
