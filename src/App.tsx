import React, { useRef, useState, useEffect } from "react";

/**
 * LinkedIn-style Badge Overlay Generator — v2.0 (single format)
 * - One style only (official-style ring)
 * - Presets map to supplied PNG overlays (transparent rings)
 * - User uploads a photo, chooses a preset, exports PNG
 */

const OVERLAYS: { key: string; label: string; src: string }[] = [
  { key: "nepobaby", label: "Nepo Baby", src: "/badges/nepobaby.png" },
  { key: "underresourced", label: "Under Resourced", src: "/badges/underresourced.png" },
  { key: "overqualified", label: "Over Qualified", src: "/badges/overqualified.png" },
  { key: "underpaid", label: "Under Paid", src: "/badges/underpaid.png" },
  { key: "burnedout", label: "Burned Out", src: "/badges/burnedout.png" },
  { key: "quietquitting", label: "Quiet Quitting", src: "/badges/quietquitting.png" },
  { key: "opentoretirement", label: "Open To Retirement", src: "/badges/opentoretirement.png" },
  { key: "linkedinfluencer", label: "LinkedInfluencer", src: "/badges/linkedinfluencer.png" },
  { key: "b2bphilosopher", label: "B2BPhilosopher", src: "/badges/b2bphilosopher.png" },
];

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState(OVERLAYS[0].key);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [size, setSize] = useState(1024);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const overlayRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    OVERLAYS.forEach((o) => {
      const im = new Image();
      im.src = o.src;
    });
  }, []);

  useEffect(() => {
    if (!imageSrc) {
      draw();
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      draw();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    const src = OVERLAYS.find((o) => o.key === selectedKey)?.src;
    if (!src) {
      overlayRef.current = null;
      draw();
      return;
    }
    const img = new Image();
    img.onload = () => {
      overlayRef.current = img;
      draw();
    };
    img.src = src;
  }, [selectedKey]);

  useEffect(() => {
    draw();
  }, [zoom, offsetX, offsetY, size]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const S = size;
    canvas.width = S;
    canvas.height = S;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, S, S);

    const cx = S / 2;
    const cy = S / 2;
    const radius = S * 0.48;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    if (imgRef.current) {
      const img = imgRef.current;
      const iw = img.width;
      const ih = img.height;
      const box = radius * 2;
      const scale = Math.max(box / iw, box / ih) * zoom;
      const drawW = iw * scale;
      const drawH = ih * scale;
      const dx = cx - drawW / 2 + offsetX;
      const dy = cy - drawH / 2 + offsetY;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, dx, dy, drawW, drawH);
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 6;
    ctx.stroke();

    if (overlayRef.current) {
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(overlayRef.current, 0, 0, S, S);
    }
  }

  function download() {
    const label = OVERLAYS.find((o) => o.key === selectedKey)?.label || "badge";
    const link = document.createElement("a");
    link.download = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvasRef.current?.toDataURL("image/png") || "";
    link.click();
  }

  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; ox: number; oy: number } | null>(null);
  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!imageSrc) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragState.current = {
      dragging: true,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      ox: offsetX,
      oy: offsetY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const s = dragState.current;
    if (!s?.dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setOffsetX(s.ox + (x - s.startX));
    setOffsetY(s.oy + (y - s.startY));
  }
  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    dragState.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  const current = OVERLAYS.find((o) => o.key === selectedKey);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Full-width hero */}
      <section
        className="w-full"
        style={{
          backgroundImage:
            "url('/assets/blue_bg.png'), linear-gradient(180deg, #00A0DC 0%, #0077B5 100%)",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 pt-10 pb-2">
          <img src="/assets/innit_logo.png" alt="innit" className="h-7 mb-4" />
          <h1 className="text-white text-5xl md:text-7xl font-black tracking-tight leading-none">Linkedinnit</h1>
          <p className="text-white mt-2 text-2xl" style={{fontFamily: 'AlecrimBlack, system-ui, sans-serif'}}>Corporate realness.</p>
          <p className="text-white/80 text-sm md:text-base mt-2" style={{fontFamily: '"Source Sans 3", ui-sans-serif, system-ui'}}>LinkedIn badges, but honest</p>
          <p className="text-white/80 text-xs mt-6">Made by <a href="https://www.mikeyrobinson.co.uk" target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>Mikey Robinson</a></p>
        </div>
      </section>

      {/* Main content */}
      <div className="p-6 md:p-10">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-[1.1fr,1fr] items-start">
          <header className="md:col-span-2 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Generator</h2>
            <span className="text-sm opacity-70">v2.0</span>
          </header>

          <section className="bg-white rounded-2xl shadow p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="inline-flex items-center px-3 py-2 rounded-xl bg-slate-100 cursor-pointer hover:bg-slate-200">
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
                <span className="text-sm font-medium">Upload photo</span>
              </label>
              <button disabled={!imageSrc} onClick={download} className="px-4 py-2 rounded-xl shadow bg-slate-900 text-white disabled:opacity-40">
                Download PNG
              </button>
            </div>

            <div className="relative grid place-items-center bg-slate-100 rounded-2xl aspect-square overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                className="w-full h-full max-w-[700px]"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
              {!imageSrc && (
                <div className="absolute inset-0 grid place-items-center text-center p-8 text-slate-500">
                  <div>
                    <p className="font-medium">Upload a profile picture to start</p>
                    <p className="text-sm mt-1">Square images work best. Drag to reposition; use Zoom to scale.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="bg-white rounded-2xl shadow p-4 md:p-6 space-y-6">
            <div>
              <label className="text-sm font-medium">Badge preset</label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {OVERLAYS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setSelectedKey(o.key)}
                    className={`px-3 py-2 rounded-xl text-sm border text-left ${
                      selectedKey === o.key
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: <strong>{current?.label}</strong>
              </p>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium flex justify-between">
                  <span>Zoom</span>
                  <span className="text-slate-500">{zoom.toFixed(2)}×</span>
                </label>
                <input
                  type="range"
                  min={0.6}
                  max={2.2}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Offset X</label>
                  <input
                    type="range"
                    min={-400}
                    max={400}
                    step={1}
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm">Offset Y</label>
                  <input
                    type="range"
                    min={-400}
                    max={400}
                    step={1}
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm">Export size</label>
              <select
                className="w-full mt-1 border rounded-xl px-3 py-2"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
              >
                {[512, 768, 1024, 1536, 2048].map((n) => (
                  <option key={n} value={n}>
                    {n} × {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t text-xs text-slate-500 space-y-1">
              <p>These presets use your supplied ring PNGs with transparent backgrounds.</p>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap');
        @font-face {
          font-family: 'AlecrimBlack';
          src: url('/assets/fonts/Alecrim-Black.otf') format('opentype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }
        canvas { image-rendering: auto; }
      `}</style>
    </div>
  );
}