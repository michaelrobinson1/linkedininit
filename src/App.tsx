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

  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    ox: number;
    oy: number;
  } | null>(null);

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
    <div className="app-root">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <img src="/assets/innit_logo.png" alt="innit" className="hero-logo" />
          <h1 className="hero-title">Linkedinnit</h1>
          <p className="hero-tagline-main">Corporate realness.</p>
          <p className="hero-tagline-sub">LinkedIn badges, but honest</p>
          <p className="hero-footer">
            Made by{" "}
            <a
              href="https://www.mikeyrobinson.co.uk"
              target="_blank"
              rel="noreferrer"
            >
              Mikey Robinson
            </a>
          </p>
        </div>
      </section>

      {/* Main content */}
      <main className="main-wrapper">
        <div className="main-grid">
          <header className="main-header">
            <h2 className="main-heading">Generator</h2>
            <span className="version-pill">v2.0</span>
          </header>

          {/* Left card – canvas */}
          <section className="card card-left">
            <div className="upload-row">
              <label className="btn btn-secondary">
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={onFile}
                />
                Upload photo
              </label>
              <button
                disabled={!imageSrc}
                onClick={download}
                className="btn btn-primary"
              >
                Download PNG
              </button>
            </div>

            <div className="canvas-shell">
              <canvas
                ref={canvasRef}
                className="canvas"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
              {!imageSrc && (
                <div className="canvas-placeholder">
                  <p className="placeholder-title">
                    Upload a profile picture to start
                  </p>
                  <p className="placeholder-text">
                    Square images work best. Drag to reposition; use Zoom to
                    scale.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Right card – controls */}
          <aside className="card card-right">
            <div className="control-block">
              <label className="label">Badge preset</label>
              <div className="badge-grid">
                {OVERLAYS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setSelectedKey(o.key)}
                    className={
                      "badge-btn" +
                      (selectedKey === o.key ? " badge-btn--active" : "")
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="selected-label">
                Selected: <strong>{current?.label}</strong>
              </p>
            </div>

            <div className="control-grid">
              <div className="control-block">
                <div className="label-row">
                  <span className="label">Zoom</span>
                  <span className="value">{zoom.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={2.2}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="xy-grid">
                <div className="control-block">
                  <span className="label">Offset X</span>
                  <input
                    type="range"
                    min={-400}
                    max={400}
                    step={1}
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
                <div className="control-block">
                  <span className="label">Offset Y</span>
                  <input
                    type="range"
                    min={-400}
                    max={400}
                    step={1}
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
            </div>

            <div className="control-block">
              <span className="label">Export size</span>
              <select
                className="select"
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

            <div className="notice">
              These presets use your supplied ring PNGs with transparent
              backgrounds.
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap');
        @font-face {
          font-family: 'AlecrimBlack';
          src: url('/assets/fonts/Alecrim-Black.otf') format('opentype');
          font-weight: 900;
          font-style: normal;
          font-display: swap;
        }

        .app-root {
          min-height: 100vh;
          margin: 0;
          background: #f8fafc;
          color: #0f172a;
          font-family: 'Source Sans 3', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .hero {
          background-image: url('/assets/blue_bg.png'), linear-gradient(180deg, #00a0dc 0%, #0077b5 100%);
          background-size: cover;
          background-position: center;
          color: #fff;
        }

        .hero-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 2.75rem 1.5rem 0.75rem;
        }

        .hero-logo {
          height: 28px;
          margin-bottom: 1rem;
        }

        .hero-title {
          font-family: 'AlecrimBlack', system-ui, sans-serif;
          font-weight: 900;
          font-size: 2.75rem;
          line-height: 1;
          letter-spacing: -0.03em;
        }

        @media (min-width: 768px) {
          .hero-title {
            font-size: 4rem;
          }
        }

        .hero-tagline-main {
          margin-top: 0.75rem;
          font-family: 'AlecrimBlack', system-ui, sans-serif;
          font-size: 1.5rem;
        }

        .hero-tagline-sub {
          margin-top: 0.35rem;
          font-size: 0.9rem;
          text-transform: none;
          opacity: 0.9;
        }

        .hero-footer {
          margin-top: 1.5rem;
          font-size: 0.75rem;
          opacity: 0.85;
        }

        .hero-footer a {
          color: #ffffff;
          text-decoration: underline;
        }

        .main-wrapper {
          padding: 2.5rem 1.5rem 3rem;
        }

        .main-grid {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          gap: 1.5rem;
        }

        @media (min-width: 900px) {
          .main-grid {
            grid-template-columns: 1.1fr 1fr;
          }
        }

        .main-header {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .main-heading {
          font-size: 1.4rem;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .version-pill {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.12);
        }

        .card-left {
          min-height: 0;
        }

        .card-right {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .upload-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0.45rem 0.95rem;
          font-size: 0.85rem;
          border: 1px solid transparent;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-secondary {
          background: #e5e7eb;
          border-color: #e5e7eb;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-primary {
          background: #020617;
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.4;
          cursor: default;
          box-shadow: none;
        }

        .file-input {
          display: none;
        }

        .canvas-shell {
          position: relative;
          background: #e5e7eb;
          border-radius: 18px;
          overflow: hidden;
          aspect-ratio: 1/1;
          display: grid;
          place-items: center;
        }

        .canvas {
          width: 100%;
          height: 100%;
          max-width: 700px;
          display: block;
        }

        .canvas-placeholder {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .placeholder-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .placeholder-text {
          font-size: 0.85rem;
        }

        .control-block {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .label {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .value {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .badge-grid {
          margin-top: 0.35rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.4rem;
        }

        .badge-btn {
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          font-size: 0.8rem;
          padding: 0.4rem 0.7rem;
          text-align: left;
          cursor: pointer;
        }

        .badge-btn:hover {
          background: #f3f4f6;
        }

        .badge-btn--active {
          background: #020617;
          color: #ffffff;
          border-color: #020617;
        }

        .selected-label {
          margin-top: 0.35rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .control-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .xy-grid {
          display: grid;
          gap: 0.75rem;
        }

        @media (min-width: 600px) {
          .xy-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        .slider {
          width: 100%;
        }

        .select {
          margin-top: 0.25rem;
          padding: 0.4rem 0.6rem;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          font-size: 0.85rem;
          background: #ffffff;
        }

        .notice {
          padding-top: 0.6rem;
          margin-top: 0.25rem;
          border-top: 1px solid #e5e7eb;
          font-size: 0.75rem;
          color: #6b7280;
        }

        canvas { image-rendering: auto; }
      `}</style>
    </div>
  );
}
