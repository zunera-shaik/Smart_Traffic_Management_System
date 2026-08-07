import { useState, useEffect, useRef, useCallback } from "react";

<<<<<<< HEAD
const API = "https://smart-traffic-management-system-5r2w.onrender.com/api";
=======
>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8

const API_URL = "https://smart-traffic-management-system-5r2w.onrender.com";
// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStateColor = (s) =>
  s === "HIGH" ? "#ef4444" : s === "MEDIUM" ? "#f59e0b" : "#22c55e";

const getStateGlow = (s) =>
  s === "HIGH"
    ? "0 0 20px #ef444466"
    : s === "MEDIUM"
    ? "0 0 20px #f59e0b66"
    : "0 0 20px #22c55e66";

// ─── Animated Road ────────────────────────────────────────────────────────────
function AnimatedRoad({ road, traffic, signal, prediction, emergency }) {
  const canvasRef = useRef(null);
  const vehiclesRef = useRef([]);
  const animRef = useRef(null);
  const countRef = useRef(traffic?.vehicles ?? 0);

  const vehicles = traffic?.vehicles ?? 0;
  const trafficState = traffic?.state ?? "LOW";
  const sig = signal?.signal ?? "RED";
  const greenTime = signal?.green_time ?? 0;
  const isEmerg = signal?.emergency ?? false;
  const predicted = prediction?.predicted ?? vehicles;
  const trend = prediction?.trend ?? "STABLE";

  // Keep ref updated for animation loop
  useEffect(() => { countRef.current = vehicles; }, [vehicles]);

  // Spawn vehicles based on count
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;

    // Add new vehicles up to count
    while (vehiclesRef.current.length < Math.min(vehicles, 18)) {
      vehiclesRef.current.push({
        x: Math.random() * W,
        y: 18 + Math.random() * (H - 36),
        speed: 0.4 + Math.random() * 0.8,
        width: 18 + Math.random() * 10,
        height: 9 + Math.random() * 5,
        color: ["#60a5fa","#34d399","#fbbf24","#f87171","#a78bfa","#fb923c"][
          Math.floor(Math.random() * 6)
        ],
        lane: Math.floor(Math.random() * 3),
      });
    }
    // Remove excess
    while (vehiclesRef.current.length > Math.min(vehicles, 18)) {
      vehiclesRef.current.pop();
    }
  }, [vehicles]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const laneY = [H * 0.25, H * 0.5, H * 0.75];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Road background
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, W, H);

      // Lane dividers
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 3);
      ctx.lineTo(W, H / 3);
      ctx.moveTo(0, (H * 2) / 3);
      ctx.lineTo(W, (H * 2) / 3);
      ctx.stroke();
      ctx.setLineDash([]);

      // Green = moving, Red = slow
      const isGreen = sig === "GREEN" || isEmerg;
      const speedMult = isGreen ? 1.0 : 0.15;

      // Move + draw vehicles
      vehiclesRef.current.forEach((v) => {
        const targetY = laneY[v.lane] + (Math.random() * 2 - 1) * 0.3;
        v.y += (targetY - v.y) * 0.05;
        v.x += v.speed * speedMult;
        if (v.x > W + v.width) v.x = -v.width;

        // Car body
        ctx.fillStyle = v.color;
        ctx.beginPath();
        ctx.roundRect(v.x, v.y - v.height / 2, v.width, v.height, 3);
        ctx.fill();

        // Windshield glint
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.roundRect(v.x + v.width * 0.55, v.y - v.height / 2 + 2, v.width * 0.25, v.height - 4, 2);
        ctx.fill();

        // Headlights
        ctx.fillStyle = isGreen ? "#fef9c3" : "#fca5a5";
        ctx.beginPath();
        ctx.arc(v.x + v.width - 2, v.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(v.x + v.width - 2, v.y + 2, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Traffic density bar at bottom
      const density = Math.min(countRef.current / 100, 1);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, H - 6, W, 6);
      const barColor =
        density > 0.5 ? "#ef4444" : density > 0.2 ? "#f59e0b" : "#22c55e";
      ctx.fillStyle = barColor;
      ctx.fillRect(0, H - 6, W * density, 6);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [sig, isEmerg]);

  const trendArrow =
    trend === "INCREASING" ? "↑" : trend === "DECREASING" ? "↓" : "→";
  const trendColor =
    trend === "INCREASING"
      ? "#ef4444"
      : trend === "DECREASING"
      ? "#22c55e"
      : "#94a3b8";

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        border: `1.5px solid ${isEmerg ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
        background: "#0f172a",
        boxShadow: isEmerg ? "0 0 30px #ef444444" : "none",
        transition: "box-shadow 0.4s, border-color 0.4s",
      }}
    >
      {/* Road header */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: getStateColor(trafficState),
              boxShadow: getStateGlow(trafficState),
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.04em" }}
          >
            {road}
          </span>
          {isEmerg && (
            <span
              style={{
                fontSize: 11,
                background: "#7f1d1d",
                color: "#fca5a5",
                padding: "2px 8px",
                borderRadius: 20,
                fontWeight: 600,
                animation: "blink 1s infinite",
              }}
            >
              🚑 EMERGENCY
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 20,
              fontWeight: 600,
              background: `${getStateColor(trafficState)}22`,
              color: getStateColor(trafficState),
              border: `1px solid ${getStateColor(trafficState)}44`,
            }}
          >
            {trafficState}
          </span>
          {/* Signal light */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              background: "#1e293b",
              padding: "4px 6px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {["GREEN", "YELLOW", "RED"].map((color) => {
              const active =
                color === "GREEN"
                  ? sig === "GREEN" || isEmerg
                  : color === "RED"
                  ? sig === "RED" && !isEmerg
                  : false;
              const bulbColor =
                color === "GREEN"
                  ? "#22c55e"
                  : color === "YELLOW"
                  ? "#f59e0b"
                  : "#ef4444";
              return (
                <div
                  key={color}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: active ? bulbColor : "#334155",
                    boxShadow: active ? `0 0 8px ${bulbColor}` : "none",
                    transition: "background 0.3s, box-shadow 0.3s",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Animated road canvas */}
      <canvas
        ref={canvasRef}
        width={420}
        height={110}
        style={{ display: "block", width: "100%", height: 110 }}
      />

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {[
          { label: "Vehicles", value: vehicles, sub: "now" },
          {
            label: "Green Time",
            value: greenTime === 999 ? "∞" : `${greenTime}s`,
            sub: isEmerg ? "emergency" : "signal",
          },
          {
            label: "Predicted",
            value: predicted,
            sub: (
              <span style={{ color: trendColor }}>
                {trendArrow} {trend.toLowerCase()}
              </span>
            ),
          },
          {
            label: "Density",
            value: `${Math.round((vehicles / 100) * 100)}%`,
            sub: "capacity",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: "10px 0",
              textAlign: "center",
              borderRight:
                i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 3 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Traffic Chart (mini sparkline) ──────────────────────────────────────────
function MiniChart({ history, color }) {
  if (!history || history.length < 2) return null;
  const max = Math.max(...history, 1);
  const W = 120, H = 36;
  const pts = history.map((v, i) => {
    const x = (i / (history.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

// ─── Emergency Panel ──────────────────────────────────────────────────────────
function EmergencyPanel({ emergency, onTrigger, onClear }) {
  const [road, setRoad] = useState("Road1");
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#f1f5f9",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>🚑</span> Emergency Control
        {emergency?.active && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: "#fca5a5",
              background: "#7f1d1d",
              padding: "2px 8px",
              borderRadius: 20,
              animation: "blink 1s infinite",
            }}
          >
            ACTIVE on {emergency.road}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <select
          value={road}
          onChange={(e) => setRoad(e.target.value)}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#f1f5f9",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          <option value="Road1">Road 1</option>
          <option value="Road2">Road 2</option>
          <option value="Road3">Road 3</option>
        </select>
        <button
          onClick={() => onTrigger(road)}
          style={{
            background: "#dc2626",
            border: "none",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
          }}
        >
          Trigger
        </button>
      </div>
      {emergency?.active && (
        <button
          onClick={onClear}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#94a3b8",
            padding: "8px 0",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "inherit",
          }}
        >
          ✓ Clear Emergency
        </button>
      )}
      <div style={{ fontSize: 11, color: "#334155", marginTop: 10 }}>
        Gives full green priority — all other roads turn red.
      </div>
    </div>
  );
}

// ─── Event Log ────────────────────────────────────────────────────────────────
function EventLog({ events }) {
  const icon = (t) =>
    t === "ambulance" ? "🚑" : t === "accident" ? "⚠️" : "📋";
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#f1f5f9",
          marginBottom: 14,
        }}
      >
        📋 Event Log
      </div>
      {events.length === 0 ? (
        <div
          style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: 16 }}
        >
          No events yet
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {events.slice(0, 8).map((ev, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                padding: "7px 10px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 7,
                fontSize: 12,
                alignItems: "center",
              }}
            >
              <span>{icon(ev.type)}</span>
              <span style={{ color: "#cbd5e1", fontWeight: 500 }}>
                {ev.type.toUpperCase()}
              </span>
              <span style={{ color: "#475569" }}>· {ev.road}</span>
              <span
                style={{
                  marginLeft: "auto",
                  color: "#1e293b",
                  fontSize: 10,
                  fontFamily: "monospace",
                }}
              >
                {ev.timestamp?.slice(11, 19)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Summary Stats ────────────────────────────────────────────────────────────
function SummaryStats({ traffic }) {
  const roads = Object.values(traffic);
  if (!roads.length) return null;
  const total = roads.reduce((s, r) => s + (r.vehicles || 0), 0);
  const avg = Math.round(total / roads.length);
  const busiest = Object.entries(traffic).sort(
    (a, b) => b[1].vehicles - a[1].vehicles
  )[0];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {[
        { label: "Total Vehicles", value: total, icon: "🚗" },
        { label: "Average Density", value: `${avg}`, icon: "📊" },
        {
          label: "Busiest Road",
          value: busiest ? busiest[0] : "—",
          icon: "🔴",
        },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>{s.icon}</span>
          <div>
            <div
              style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [traffic, setTraffic] = useState({});
  const [signals, setSignals] = useState({});
  const [emergency, setEmergency] = useState({});
  const [predictions, setPredictions] = useState({});
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const historyRef = useRef({ Road1: [], Road2: [], Road3: [] });

  const fetchAll = useCallback(async () => {
    try {
      const [t, s, p, e, ev] = await Promise.all([
        fetch(`${API}/traffic`).then((r) => r.json()),
        fetch(`${API}/signals`).then((r) => r.json()),
        fetch(`${API}/predictions`).then((r) => r.json()),
        fetch(`${API}/emergency/status`).then((r) => r.json()),
        fetch(`${API}/events`).then((r) => r.json()),
      ]);

      // Update sparkline history
      if (t.data) {
        Object.entries(t.data).forEach(([road, info]) => {
          historyRef.current[road] = [
            ...(historyRef.current[road] || []).slice(-19),
            info.vehicles,
          ];
        });
      }

      setTraffic(t.data || {});
      setSignals(s.signals || {});
      setEmergency(e);
      setPredictions(p.predictions || {});
      setEvents(Array.isArray(ev) ? ev : []);
      setConnected(true);
      setLastUpdated(t.last_updated);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 4000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const handleTrigger = async (road) => {
    await fetch(`${API}/emergency/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ road }),
    });
    fetchAll();
  };

  const handleClear = async () => {
    await fetch(`${API}/emergency/clear`, { method: "POST" });
    fetchAll();
  };

  const roads = ["Road1", "Road2", "Road3"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d1a",
        color: "#f1f5f9",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #060d1a; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        select option { background: #1e293b; color: #f1f5f9; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        canvas { image-rendering: pixelated; }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "14px 28px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🚦
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.02em" }}>
            Smart Traffic Management System
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>
            Live simulation · ML prediction · Emergency priority
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: connected ? "#22c55e" : "#ef4444",
            background: connected
              ? "rgba(34,197,94,0.1)"
              : "rgba(239,68,68,0.1)",
            border: `1px solid ${connected ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            padding: "4px 12px",
            borderRadius: 20,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "currentColor",
              display: "inline-block",
              animation: connected ? "pulse 2s infinite" : "none",
            }}
          />
          {connected ? "Backend Connected" : "Backend Offline"}
        </div>
      </div>

      <div style={{ padding: "24px 28px", maxWidth: 1300, margin: "0 auto" }}>
        {/* Emergency banner */}
        {emergency?.active && (
          <div
            style={{
              background:
                "linear-gradient(90deg, rgba(127,29,29,0.8), rgba(153,27,27,0.8))",
              border: "1px solid #ef4444",
              borderRadius: 12,
              padding: "12px 20px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 14,
              animation: "slideIn 0.3s ease",
            }}
          >
            <span style={{ fontSize: 24 }}>🚨</span>
            <div>
              <div style={{ color: "#fecaca", fontWeight: 600, fontSize: 14 }}>
                EMERGENCY ACTIVE — Ambulance Priority on {emergency.road}
              </div>
              <div style={{ color: "#f87171", fontSize: 12, marginTop: 2 }}>
                All other roads are RED · Detected: {emergency.detected_at}
              </div>
            </div>
            <button
              onClick={handleClear}
              style={{
                marginLeft: "auto",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: 7,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Summary */}
        <SummaryStats traffic={traffic} />

        {/* Road cards with animations */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {roads.map((road) => (
            <AnimatedRoad
              key={road}
              road={road}
              traffic={traffic[road]}
              signal={signals[road]}
              prediction={predictions[road]}
              emergency={emergency?.active && emergency?.road === road}
            />
          ))}
        </div>

        {/* Sparklines row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {roads.map((road) => (
            <div
              key={road}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                  {road} · traffic history
                </div>
                <MiniChart
                  history={historyRef.current[road]}
                  color={getStateColor(traffic[road]?.state ?? "LOW")}
                />
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: getStateColor(traffic[road]?.state ?? "LOW"),
                  }}
                >
                  {traffic[road]?.vehicles ?? 0}
                </div>
                <div style={{ fontSize: 10, color: "#475569" }}>vehicles</div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <EmergencyPanel
            emergency={emergency}
            onTrigger={handleTrigger}
            onClear={handleClear}
          />
          <EventLog events={events} />
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 11,
            color: "#1e293b",
            textAlign: "center",
          }}
        >
          Simulation mode · Updates every 4 seconds · Last: {lastUpdated || "—"}
        </div>
      </div>
    </div>
  );
}
