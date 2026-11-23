import { useState } from "react";

const INK = "#171717";
const FAINT = "#d4d6da";

const PAGE = 4096;
const SECTOR = 512;
const PER_PAGE = PAGE / SECTOR;

type Id = "file" | "size" | "blocks" | "ioblock" | "type";

const info = (id: Id, pages: number): { title: string; body: string[] } => {
    const size = pages * PAGE;
    const blocks = pages * PER_PAGE;
    switch (id) {
        case "file":
            return {
                title: "File: mydb.db",
                body: [
                    "The file name. SQLite does not care what it is called. The .db extension is only a habit.",
                ],
            };
        case "size":
            return {
                title: `Size: ${size} bytes`,
                body: [
                    `The length of the file. ${pages} pages × ${PAGE} bytes = ${size}.`,
                    "A SQLite file is always a whole number of pages. The page size is stored at byte 16 of the file header (0x1000 = 4096).",
                    "Add a row that does not fit and the file grows by one whole page. Use the + button to see it.",
                ],
            };
        case "blocks":
            return {
                title: `Blocks: ${blocks}`,
                body: [
                    `The disk space the file uses. In stat, one block is always 512 bytes, whatever the file system uses inside.`,
                    `${blocks} × 512 = ${size}. This matches Size, because the file has no holes and no part-filled last block.`,
                    "This number is not the same as IO Block. They are two different units.",
                ],
            };
        case "ioblock":
            return {
                title: "IO Block: 4096",
                body: [
                    "The chunk size that the file system likes best for reads and writes.",
                    "Here it is the same as the SQLite page size. So one page is exactly one file system block. A page write does not cross a block edge.",
                ],
            };
        case "type":
            return {
                title: "regular file",
                body: ["An ordinary file. It is not a directory, a symlink or a device."],
            };
    }
};

export default function SqliteStat() {
    const [sel, setSel] = useState<Id>("size");
    const [pages, setPages] = useState(3);
    
    const size = pages * PAGE;
    const blocks = pages * PER_PAGE;
    const { title, body } = info(sel, pages);

    const hlPages = sel === "size" || sel === "ioblock";
    const hlSectors = sel === "blocks";

    const button = "border border-black px-3 py-1 text-sm cursor-none transition-colors bg-white hover:bg-neutral-100";

    // One hoverable piece of stat output
    const F = ({ id, label, value }: { id: Id; label?: string; value: string }) => (
        <button
            type="button"
            onMouseEnter={() => setSel(id)}
            onFocus={() => setSel(id)}
            onClick={() => setSel(id)}
            className={`cursor-none px-[0.5ch] -mx-[0.5ch] ${sel === id ? "bg-black text-white" : "hover:bg-neutral-100"}`}
        >
            {label && <span className={sel === id ? "" : "text-[#70747d]"}>{label} </span>}
            {value}
        </button>
    );

    return (
        <figure className="not-prose my-14 lg:-mx-12 xl:-mx-32">
            <div className="text-xs tracking-[0.2em] text-[#70747d] mb-2">POINT AT A FIELD</div>
            <div className="overflow-x-auto">
                <pre className="font-mono text-[13px] leading-8 border-t border-b border-black py-2 min-w-[560px]">
                    <span className="text-[#70747d]">$ stat mydb.db{"\n"}</span>
                    {"  "}
                    <F id="file" label="File:" value="mydb.db" />
                    {"\n  "}
                    <F id="size" label="Size:" value={String(size)} />
                    {"     "}
                    <F id="blocks" label="Blocks:" value={String(blocks)} />
                    {"     "}
                    <F id="ioblock" label="IO Block:" value="4096" />
                    {"   "}
                    <F id="type" value="regular file" />
                </pre>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start mt-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <button onClick={() => setPages((p) => Math.max(1, p - 1))} className={button} aria-label="remove a page">
                            −
                        </button>
                        <button onClick={() => setPages((p) => Math.min(8, p + 1))} className={button} aria-label="add a page">
                            +
                        </button>
                        <span className="font-mono text-[12px] text-[#70747d]">{pages} pages</span>
                    </div>

                    <div className="flex gap-2">
                        {Array.from({ length: pages }, (_, p) => (
                            <div key={p} className="flex-1 min-w-0 p-2 border" style={{ borderColor: hlPages ? INK : FAINT, borderWidth: hlPages ? 2 : 1 }}>
                                <div className="font-mono text-[10px] flex justify-between">
                                    <span>page {p + 1}</span>
                                    <span className="text-[#70747d]">@{p * PAGE}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-[2px] mt-2">
                                    {Array.from({ length: PER_PAGE }, (_, s) => (
                                        <div key={s} className="h-3" style={{ background: hlSectors ? INK : FAINT }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="font-mono text-[12px] mt-3 text-[#70747d]">
                        Large box = one {PAGE}-byte page = one IO block.
                        <br />
                        Small cell = one {SECTOR}-byte block (what Blocks counts).
                    </p>
                    <p className="font-mono text-[12px] mt-2">
                        {pages} × {PAGE} = {size} · {blocks} × {SECTOR} = {size}
                    </p>
                </div>

                <div>
                    <div className="font-medium">{title}</div>
                    <div className="mt-2 text-sm space-y-2 min-h-[8rem]">
                        {body.map((t, i) => (
                            <p key={i}>{t}</p>
                        ))}
                    </div>
                </div>
            </div>

        </figure>
    );
}
