"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Manifest = {
  grid_h: number;
  grid_w: number;
  dim: number;
  dtype: "float32" | "float16";
  image_width: number;
  image_height: number;
  files: { embeddings: string; image: string };
};

type PatchEmbeddingsProps = {
  /** directory (served from /public) containing manifest.json, embeddings.bin, image.png */
  src: string;
  /** rendered size (px) of each canvas */
  size?: number;
};

// Cheap perceptual "turbo"-ish colormap: x in [0,1] -> [r,g,b] in [0,255].
function turbo(x: number): [number, number, number] {
  const c = Math.min(1, Math.max(0, x));
  const r = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * c - 3)));
  const g = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * c - 2)));
  const b = Math.min(1, Math.max(0, 1.5 - Math.abs(4 * c - 1)));
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const PatchEmbeddings = ({ src, size = 360 }: PatchEmbeddingsProps) => {
  // When Next's pages router tries to prerender this file as a standalone
  // route there are no props, so bail out early.
  const base = (src ?? "").replace(/\/$/, "");

  const gridRef = useRef<HTMLCanvasElement>(null);
  const heatRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const embRef = useRef<Float32Array | null>(null);

  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load manifest, embeddings and image once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m: Manifest = await (
          await fetch(`${base}/manifest.json`)
        ).json();
        if (m.dtype !== "float32") {
          throw new Error("component expects float32 embeddings");
        }
        const buf = await (await fetch(`${base}/${m.files.embeddings}`)).arrayBuffer();
        const emb = new Float32Array(buf); // length grid_h * grid_w * dim

        const img = new Image();
        img.src = `${base}/${m.files.image}`;
        await img.decode();

        if (cancelled) return;
        embRef.current = emb;
        imgRef.current = img;
        setManifest(m);
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "failed to load embeddings");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [base]);

  // Draw the image + patch grid, optionally highlighting the selected patch.
  const drawGrid = useCallback(() => {
    const canvas = gridRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !manifest) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);

    const cellW = size / manifest.grid_w;
    const cellH = size / manifest.grid_h;

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= manifest.grid_w; c++) {
      const x = Math.round(c * cellW) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let r = 0; r <= manifest.grid_h; r++) {
      const y = Math.round(r * cellH) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    if (selected) {
      ctx.strokeStyle = "rgb(255,60,60)";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        selected.col * cellW,
        selected.row * cellH,
        cellW,
        cellH,
      );
    }
  }, [manifest, selected, size]);

  // Draw the cosine-similarity heatmap for the selected patch.
  const drawHeatmap = useCallback(() => {
    const canvas = heatRef.current;
    const img = imgRef.current;
    const emb = embRef.current;
    if (!canvas || !img || !emb || !manifest) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);

    if (!selected) return;

    const { grid_h, grid_w, dim } = manifest;
    const n = grid_h * grid_w;
    const q = (selected.row * grid_w + selected.col) * dim;

    // Cosine sim == dot product (embeddings are L2 normalised).
    const sims = new Float32Array(n);
    let lo = Infinity;
    let hi = -Infinity;
    for (let p = 0; p < n; p++) {
      let dot = 0;
      const off = p * dim;
      for (let d = 0; d < dim; d++) dot += emb[off + d] * emb[q + d];
      sims[p] = dot;
      if (dot < lo) lo = dot;
      if (dot > hi) hi = dot;
    }
    const range = hi - lo < 1e-8 ? 1 : hi - lo;

    // Render heatmap into a small offscreen grid, then scale up (blocky, crisp).
    const off = document.createElement("canvas");
    off.width = grid_w;
    off.height = grid_h;
    const offCtx = off.getContext("2d")!;
    const imgData = offCtx.createImageData(grid_w, grid_h);
    for (let p = 0; p < n; p++) {
      const [r, g, b] = turbo((sims[p] - lo) / range);
      imgData.data[p * 4] = r;
      imgData.data[p * 4 + 1] = g;
      imgData.data[p * 4 + 2] = b;
      imgData.data[p * 4 + 3] = 255;
    }
    offCtx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(off, 0, 0, size, size);
    ctx.globalAlpha = 1;

    // Outline the queried patch.
    const cellW = size / grid_w;
    const cellH = size / grid_h;
    ctx.strokeStyle = "rgb(255,255,255)";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      selected.col * cellW,
      selected.row * cellH,
      cellW,
      cellH,
    );
  }, [manifest, selected, size]);

  useEffect(() => {
    drawGrid();
    drawHeatmap();
  }, [drawGrid, drawHeatmap]);

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!manifest) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * size;
    const y = ((e.clientY - rect.top) / rect.height) * size;
    const col = Math.min(
      manifest.grid_w - 1,
      Math.max(0, Math.floor((x / size) * manifest.grid_w)),
    );
    const row = Math.min(
      manifest.grid_h - 1,
      Math.max(0, Math.floor((y / size) * manifest.grid_h)),
    );
    setSelected((prev) =>
      prev && prev.row === row && prev.col === col ? prev : { row, col },
    );
  };

  return (
    <div className="not-prose my-6 flex flex-col items-center gap-3">
      {loading && <p className="text-sm text-gray-400">loading embeddings…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex flex-wrap justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <canvas
            ref={gridRef}
            width={size}
            height={size}
            onMouseMove={handleMove}
            className="cursor-crosshair rounded border border-gray-200"
            style={{ width: size, height: size }}
          />
          <span className="text-xs text-gray-400">
            patch grid — hover a patch
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <canvas
            ref={heatRef}
            width={size}
            height={size}
            className="rounded border border-gray-200"
            style={{ width: size, height: size }}
          />
          <span className="text-xs text-gray-400">
            cosine-similarity heatmap
          </span>
        </div>
      </div>
      {manifest && (
        <span className="text-xs text-gray-400">
          {manifest.grid_h}×{manifest.grid_w} patches · dim {manifest.dim} ·
          DINOv3 ViT-S/16 final layer
        </span>
      )}
    </div>
  );
};

export default PatchEmbeddings;
