import React, { useRef, useState, useEffect } from "react";

const OVERLAYS: { key: string; label: string; src: string }[] = [
  { key: "b2bphilosopher", label: "B2BPhilosopher", src: "/badges/b2bphilosopher.png" },
  { key: "burnedout", label: "Burned Out", src: "/badges/burnedout.png" },
  { key: "impostersyndrome", label: "Imposter Syndrome", src: "/badges/impostersyndrome.png" },
  { key: "linkedinfluencer", label: "LinkedInfluencer", src: "/badges/linkedinfluencer.png" },
  { key: "nepobaby", label: "Nepo Baby", src: "/badges/nepobaby.png" },
  { key: "opentoretirement", label: "Open To Retirement", src: "/badges/opentoretirement.png" },
  { key: "overqualified", label: "Over Qualified", src: "/badges/overqualified.png" },
  { key: "personalbrandceo", label: "Personal Brand CEO", src: "/badges/personalbrandceo.png" },
  { key: "quietquitting", label: "Quiet Quitting", src: "/badges/quietquitting.png" },
  { key: "teamofone", label: "Team of One", src: "/badges/teamofone.png" },
  { key: "underpaid", label: "Under Paid", src: "/badges/underpaid.png" },
  { key: "underresourced", label: "Under Resourced", src: "/badges/underresourced.png" },
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
  const dragState = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    ox: number;
    oy: number;
  } | null>(null);

  // Preload overlays
  useEffect(() => {
    OVERLAYS.forEach((o) => {
      const im = new Image();
      im.src = o.src;
    });
  }, []);

  // Load base image
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

  // Load selected overlay
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

  // Redraw when transforms or size change
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

    const ringWidth = 6;
    // Radius so that the outer ring sits at exactly S/2 (aligns with overlay art)
    const radius = S * 0.5 - ringWidth;

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

    // Outer subtle ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius + ringWidth, 0, Math.PI * 2);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    // Overlay ring PNG
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

  function onPointerLeave() {
    if (dragState.current?.dragging) {
      dragState.current = null;
    }
  }

  function resetTransforms() {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  }

  const current = OVERLAYS.find((o) => o.key === selectedKey);

  // ---------- STYLES ----------

  const appStyle: React.CSSProperties = {
    minHeight: "100vh",
    margin: 0,
    background: "#f3f4f6",
    color: "#0f172a",
    fontFamily:
      '"Source Sans 3", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: "flex",
    flexDirection: "column",
  };

  const heroStyle: React.CSSProperties = {
    backgroundImage:
      "url('/assets/blue_bg.png'), linear-gradient(180deg, #00A0DC 0%, #0077B5 100%)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#ffffff",
    padding: "40px 0 56px",
  };

  const heroInnerStyle: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    padding: "0 24px",
  };

  const heroTitleStyle: React.CSSProperties = {
    fontFamily: "AlecrimBlack, system-ui, sans-serif",
    fontWeight: 900,
    fontSize: "60px",
    lineHeight: 1,
    letterSpacing: "-0.03em",
  };

  const mainWrapperStyle: React.CSSProperties = {
    padding: "24px 24px 40px",
    flex: 1,
  };

  const mainGridStyle: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    display: "grid",
    gap: "16px",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
  };

  const uploadRowStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    alignItems: "center",
  };

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: "7px 14px",
    fontSize: 13,
    border: "1px solid transparent",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const btnSecondary: React.CSSProperties = {
    ...btnBase,
    background: "#e5e7eb",
    borderColor: "#e5e7eb",
  };

  const btnPrimary: React.CSSProperties = {
    ...btnBase,
    background: "#020617",
    color: "#ffffff",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.4)",
  };

  const canvasShellStyle: React.CSSProperties = {
    position: "relative",
    background: "#e5e7eb",
    borderRadius: 20,
    overflow: "hidden",
    aspectRatio: "1 / 1",
    display: "grid",
    placeItems: "center",
    width: "100%",
    maxWidth: 520,
    margin: "0 auto",
  };

  const canvasStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "block",
  };

  const badgeGridStyle: React.CSSProperties = {
    marginTop: 6,
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 6,
  };

  const badgeBtn: React.CSSProperties = {
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: 13,
    padding: "6px 10px",
    textAlign: "left",
    cursor: "pointer",
  };

  const badgeBtnActive: React.CSSProperties = {
    ...badgeBtn,
    background: "#020617",
    color: "#ffffff",
    borderColor: "#020617",
  };

  const sliderStyle: React.CSSProperties = {
    width: "100%",
  };

  const selectStyle: React.CSSProperties = {
    marginTop: 4,
    padding: "6px 8px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 13,
    background: "#ffffff",
  };

  return (
    <div style={appStyle}>
      {/* Load fonts & responsive grid CSS */}
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

        .main-grid {
          max-width: 1120px;
          margin: 0 auto;
          display: grid;
          gap: 16px;
        }

        @media (min-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr 1fr;
            align-items: stretch; /* ensures both cards are same height */
          }
        }
      `}</style>

      {/* HERO */}
      <section style={heroStyle}>
        <div style={heroInnerStyle}>
          <img
            src="/assets/innit_logo.png"
            alt="innit"
            style={{ height: 32, marginBottom: 20 }}
          />
          <h1 style={heroTitleStyle}>Linkedinnit</h1>
          <p
            style={{
              marginTop: 8,
              fontFamily: "AlecrimBlack, system-ui, sans-serif",
              fontSize: 26,
            }}
          >
            Corporate realness.
          </p>
          <p
            style={{
              marginTop: 4,
              fontSize: 14,
              opacity: 0.9,
            }}
          >
            LinkedIn badges, but honest
          </p>
          <p
            style={{
              marginTop: 12,
              fontSize: 11,
              opacity: 0.85,
            }}
          >
            Made by{" "}
            <a
              href="https://www.mikeyrobinson.co.uk"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#ffffff", textDecoration: "underline" }}
            >
              Mikey Robinson
            </a>
          </p>
        </div>
      </section>

      {/* MAIN */}
      <main style={mainWrapperStyle}>
        <div className="main-grid" style={mainGridStyle}>
          {/* Header row */}
          <header
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Generator
            </h2>
            <span style={{ fontSize: 12, opacity: 0.7 }}>v2.0</span>
          </header>

          {/* LEFT – Canvas card */}
          <section style={cardStyle}>
            <div style={uploadRowStyle}>
              <label style={btnSecondary}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFile}
                  style={{ display: "none" }}
                />
                Upload photo
              </label>
              <button
                style={{
                  ...btnPrimary,
                  opacity: imageSrc ? 1 : 0.4,
                  boxShadow: imageSrc ? (btnPrimary.boxShadow as string) : "none",
                  cursor: imageSrc ? "pointer" : "default",
                }}
                disabled={!imageSrc}
                onClick={download}
              >
                Download PNG
              </button>
              <button
                type="button"
                style={{
                  ...btnSecondary,
                  opacity: imageSrc ? 1 : 0.4,
                  cursor: imageSrc ? "pointer" : "default",
                }}
                disabled={!imageSrc}
                onClick={resetTransforms}
              >
                Reset view
              </button>
            </div>

            <div style={canvasShellStyle}>
              <canvas
                ref={canvasRef}
                style={canvasStyle}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerLeave}
              />
              {!imageSrc && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: 32,
                    color: "#6b7280",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>
                      Upload a profile picture to start
                    </p>
                    <p style={{ fontSize: 13 }}>
                      Square images work best. Drag to reposition; use Zoom to scale.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT – Controls */}
          <aside
            style={{
              ...cardStyle,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                Badge preset
              </div>
              <div style={badgeGridStyle}>
                {OVERLAYS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setSelectedKey(o.key)}
                    style={selectedKey === o.key ? badgeBtnActive : badgeBtn}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                Selected: <strong>{current?.label}</strong>
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Zoom</span>
                  <span style={{ color: "#6b7280" }}>{zoom.toFixed(2)}×</span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={2.2}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={sliderStyle}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Offset X</div>
                  <input
                    type="range"
                    min={-400}
                    max={400}
                    step={1}
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    style={sliderStyle}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Offset Y</div>
                  <input
                    type="range"
                    min={-400}
                    max={400}
                    step={1}
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    style={sliderStyle}
                  />
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Export size</div>
              <select
                style={selectStyle}
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

            <div
              style={{
                paddingTop: 8,
                marginTop: 4,
                borderTop: "1px solid #e5e7eb",
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              Resize your image to fit your ego.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
