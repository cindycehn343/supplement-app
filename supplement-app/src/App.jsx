import { useState, useEffect } from "react";

// ── Design tokens ──────────────────────────────────────────────
// Palette: soft sage + warm cream + deep forest — feels like a
// premium wellness clinic, not a generic fitness tracker.
const TOKEN = {
  sage:    "#6B9E8A",
  sageL:   "#A8C9BB",
  sagePale:"#EAF3EF",
  cream:   "#FAF7F2",
  forest:  "#1E3A2F",
  sand:    "#D9C9B0",
  amber:   "#E8935A",
  white:   "#FFFFFF",
  gray50:  "#F7F7F7",
  gray200: "#E5E5E5",
  gray400: "#9A9A9A",
  gray700: "#4A4A4A",
};

// ── Supplement icon map ────────────────────────────────────────
const TYPE_ICONS = {
  powder: "🥄",
  capsule: "💊",
  tablet: "⬜",
  liquid: "💧",
  jelly: "🟩",
  drop: "💧",
};

const TIME_SLOTS = ["起床後", "早餐前", "早餐後", "早餐中", "午餐前", "午餐後", "午餐中", "下午茶", "晚餐前", "晚餐後", "晚餐中", "睡前"];

const TIME_EMOJI = {
  "起床後": "🌅", "早餐前": "☀️", "早餐後": "☀️", "早餐中": "☀️",
  "午餐前": "🌤️", "午餐後": "🌤️", "午餐中": "🌤️",
  "下午茶": "🍵", "晚餐前": "🌙", "晚餐後": "🌙", "晚餐中": "🌙", "睡前": "😴"
};

// ── Client data ───────────────────────────────────────────────
// 每位客人的資料在這裡設定，網址用 #shaw / #xin 區分
const CLIENT_DATA = {
  shaw: {
    name: "Shaw",
    supplements: [
      {
        id: 1,
        name: "NAD+ 果凍",
        brand: "PRIME",
        type: "jelly",
        color: "#5B9BD5",
        schedule: [{ time: "起床後", dose: "1 包", water: "" }],
        note: "空腹效果最佳",
      },
      {
        id: 2,
        name: "消化酵素益生菌粉",
        brand: "Isotonix",
        type: "powder",
        color: "#6B9E8A",
        schedule: [
          { time: "午餐後", dose: "1 小白湯匙", water: "60cc 水" },
          { time: "晚餐後", dose: "1 小白湯匙", water: "60cc 水" },
        ],
        note: "搭配溫水，不超過 40°C",
      },
    ],
  },
  xin: {
    name: "Xin",
    supplements: [
      {
        id: 1,
        name: "鎂片",
        brand: "PRIME",
        type: "tablet",
        color: "#9B59B6",
        schedule: [{ time: "睡前", dose: "2 錠", water: "150cc 水" }],
        note: "助眠效果佳",
      },
      {
        id: 2,
        name: "OPC-3 粉",
        brand: "Isotonix",
        type: "powder",
        color: "#E8935A",
        schedule: [{ time: "早餐前", dose: "1 湯匙", water: "120cc 水" }],
        note: "空腹吸收效果較好",
      },
    ],
  },
};

// ── Utility ───────────────────────────────────────────────────
function groupByTime(supplements) {
  const map = {};
  supplements.forEach((sup) => {
    sup.schedule.forEach((s) => {
      if (!map[s.time]) map[s.time] = [];
      map[s.time].push({ ...sup, currentDose: s.dose, currentWater: s.water });
    });
  });
  return map;
}

function getCurrentTimeSlot() {
  const h = new Date().getHours();
  if (h < 7) return "起床後";
  if (h < 9) return "早餐後";
  if (h < 12) return "午餐前";
  if (h < 14) return "午餐後";
  if (h < 17) return "下午茶";
  if (h < 19) return "晚餐後";
  return "睡前";
}

// ── Components ────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <span style={{
      background: color + "20",
      color: color,
      border: `1px solid ${color}40`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.03em",
    }}>{children}</span>
  );
}

function SupplementCard({ sup, checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: checked ? TOKEN.sagePale : TOKEN.white,
        border: `1.5px solid ${checked ? TOKEN.sage : TOKEN.gray200}`,
        borderRadius: 14,
        padding: "14px 16px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.2s",
        opacity: checked ? 0.75 : 1,
      }}
    >
      {/* color dot + icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: sup.color + "18",
        border: `2px solid ${sup.color}50`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {TYPE_ICONS[sup.type] || "💊"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: TOKEN.forest }}>
            {sup.name}
          </span>
          <Badge color={sup.color}>{sup.brand}</Badge>
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: TOKEN.gray700 }}>
          <span style={{ fontWeight: 600 }}>{sup.currentDose}</span>
          {sup.currentWater && (
            <span style={{ color: TOKEN.gray400 }}> ＋ {sup.currentWater}</span>
          )}
        </div>
        {sup.note && (
          <div style={{ marginTop: 3, fontSize: 11, color: TOKEN.gray400 }}>
            💡 {sup.note}
          </div>
        )}
      </div>

      {/* checkbox */}
      <div style={{
        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
        background: checked ? TOKEN.sage : TOKEN.white,
        border: `2px solid ${checked ? TOKEN.sage : TOKEN.gray200}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
      </div>
    </div>
  );
}

function TimeSection({ time, items, checked, onToggle }) {
  const isCurrent = time === getCurrentTimeSlot();
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
      }}>
        <span style={{ fontSize: 18 }}>{TIME_EMOJI[time] || "⏰"}</span>
        <span style={{
          fontWeight: 700, fontSize: 14, color: isCurrent ? TOKEN.sage : TOKEN.forest,
          letterSpacing: "0.05em",
        }}>{time}</span>
        {isCurrent && (
          <span style={{
            background: TOKEN.sage, color: "#fff",
            borderRadius: 20, padding: "1px 9px", fontSize: 10, fontWeight: 700,
          }}>現在</span>
        )}
        <span style={{
          marginLeft: "auto", fontSize: 11, color: TOKEN.gray400,
        }}>
          {items.filter((_, i) => checked[`${time}-${i}`]).length}/{items.length} 完成
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((sup, i) => (
          <SupplementCard
            key={`${sup.id}-${i}`}
            sup={sup}
            checked={!!checked[`${time}-${i}`]}
            onToggle={() => onToggle(`${time}-${i}`)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Supplement Form ───────────────────────────────────────────
function SupplementForm({ onSave, onCancel, initial }) {
  const blank = {
    name: "", brand: "", type: "powder", color: "#6B9E8A", note: "",
    schedule: [{ time: "早餐後", dose: "", water: "" }],
  };
  const [form, setForm] = useState(initial || blank);

  const addSchedule = () =>
    setForm(f => ({ ...f, schedule: [...f.schedule, { time: "午餐後", dose: "", water: "" }] }));

  const removeSchedule = (i) =>
    setForm(f => ({ ...f, schedule: f.schedule.filter((_, j) => j !== i) }));

  const updateSchedule = (i, field, val) =>
    setForm(f => {
      const s = [...f.schedule];
      s[i] = { ...s[i], [field]: val };
      return { ...f, schedule: s };
    });

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1.5px solid ${TOKEN.gray200}`, fontSize: 14,
    background: TOKEN.white, color: TOKEN.forest,
    outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle = { fontSize: 12, fontWeight: 600, color: TOKEN.gray700, marginBottom: 4, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>品名 *</label>
          <input style={inputStyle} value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="如：NAD+ 果凍" />
        </div>
        <div>
          <label style={labelStyle}>品牌</label>
          <input style={inputStyle} value={form.brand}
            onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
            placeholder="如：PRIME" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>劑型</label>
          <select style={inputStyle} value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="powder">粉狀 🥄</option>
            <option value="capsule">膠囊 💊</option>
            <option value="tablet">錠劑 ⬜</option>
            <option value="jelly">果凍 🟩</option>
            <option value="liquid">液態 💧</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>顏色標記</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            {["#6B9E8A","#5B9BD5","#E8935A","#9B59B6","#3D9970","#E74C3C","#F39C12"].map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                style={{
                  width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer",
                  border: form.color === c ? `3px solid ${TOKEN.forest}` : "3px solid transparent",
                  transition: "border 0.15s",
                }} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>服用時間表</label>
          <button onClick={addSchedule}
            style={{
              background: TOKEN.sagePale, color: TOKEN.sage,
              border: `1px solid ${TOKEN.sageL}`, borderRadius: 8,
              padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>+ 新增時段</button>
        </div>
        {form.schedule.map((s, i) => (
          <div key={i} style={{
            background: TOKEN.gray50, borderRadius: 10, padding: 12, marginBottom: 8,
            border: `1px solid ${TOKEN.gray200}`,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, alignItems: "end" }}>
              <div>
                <label style={labelStyle}>時間</label>
                <select style={inputStyle} value={s.time}
                  onChange={e => updateSchedule(i, "time", e.target.value)}>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{TIME_EMOJI[t]} {t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>劑量</label>
                <input style={inputStyle} value={s.dose}
                  onChange={e => updateSchedule(i, "dose", e.target.value)}
                  placeholder="如：1 包" />
              </div>
              <div>
                <label style={labelStyle}>配水（選填）</label>
                <input style={inputStyle} value={s.water}
                  onChange={e => updateSchedule(i, "water", e.target.value)}
                  placeholder="如：60cc 水" />
              </div>
              {form.schedule.length > 1 && (
                <button onClick={() => removeSchedule(i)}
                  style={{
                    background: "none", border: "none", color: TOKEN.gray400,
                    cursor: "pointer", fontSize: 18, padding: "0 4px", alignSelf: "flex-end",
                    lineHeight: "38px",
                  }}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label style={labelStyle}>備註</label>
        <input style={inputStyle} value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          placeholder="如：空腹效果最佳、不超過 40°C" />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
        <button onClick={onCancel}
          style={{
            padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${TOKEN.gray200}`,
            background: TOKEN.white, color: TOKEN.gray700, cursor: "pointer", fontWeight: 600,
          }}>取消</button>
        <button onClick={() => form.name && onSave(form)}
          disabled={!form.name}
          style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: form.name ? TOKEN.sage : TOKEN.gray200,
            color: form.name ? TOKEN.white : TOKEN.gray400,
            cursor: form.name ? "pointer" : "not-allowed",
            fontWeight: 700, fontSize: 14, transition: "all 0.2s",
          }}>儲存</button>
      </div>
    </div>
  );
}

// ── Client Manager ────────────────────────────────────────────
function ClientManager({ clients, activeId, onSelect, onCreate, onDelete }) {
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {clients.map(c => (
          <div key={c.id} style={{
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <button onClick={() => onSelect(c.id)}
              style={{
                padding: "7px 16px", borderRadius: 20,
                border: `2px solid ${c.id === activeId ? TOKEN.sage : TOKEN.gray200}`,
                background: c.id === activeId ? TOKEN.sage : TOKEN.white,
                color: c.id === activeId ? "#fff" : TOKEN.gray700,
                cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              }}>{c.name}</button>
            {clients.length > 1 && (
              <button onClick={() => onDelete(c.id)}
                style={{
                  background: "none", border: "none", color: TOKEN.gray400,
                  cursor: "pointer", fontSize: 12, padding: "0 2px",
                }}>✕</button>
            )}
          </div>
        ))}
        {creating ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && newName.trim()) {
                  onCreate(newName.trim());
                  setNewName(""); setCreating(false);
                }
                if (e.key === "Escape") { setNewName(""); setCreating(false); }
              }}
              placeholder="客戶姓名"
              style={{
                padding: "6px 12px", borderRadius: 20,
                border: `2px solid ${TOKEN.sage}`, fontSize: 13, outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button onClick={() => {
              if (newName.trim()) { onCreate(newName.trim()); setNewName(""); setCreating(false); }
            }}
              style={{
                background: TOKEN.sage, color: "#fff", border: "none",
                borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13,
              }}>確定</button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)}
            style={{
              padding: "7px 14px", borderRadius: 20,
              border: `2px dashed ${TOKEN.sageL}`,
              background: "transparent", color: TOKEN.sage,
              cursor: "pointer", fontWeight: 600, fontSize: 13,
            }}>＋ 新客戶</button>
        )}
      </div>
    </div>
  );
}

// ── Progress Ring ─────────────────────────────────────────────
function ProgressRing({ total, done }) {
  const r = 26, circ = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : done / total;
  return (
    <svg width={64} height={64} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={32} cy={32} r={r} fill="none" stroke={TOKEN.gray200} strokeWidth={5} />
      <circle cx={32} cy={32} r={r} fill="none" stroke={TOKEN.sage} strokeWidth={5}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.4s" }} />
      <text x={32} y={37} textAnchor="middle" fill={TOKEN.forest}
        style={{ fontSize: 14, fontWeight: 700, transform: "rotate(90deg)", transformOrigin: "32px 32px" }}>
        {done}/{total}
      </text>
    </svg>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const [checked, setChecked] = useState({});
  const [date, setDate] = useState(new Date());

  // 從網址 hash 判斷是哪位客人，例如 #shaw 或 #xin
  const hash = window.location.hash.replace("#", "").toLowerCase();
  const clientData = CLIENT_DATA[hash];

  // Reset checkmarks at midnight
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== date.getDate()) { setChecked({}); setDate(now); }
    }, 60000);
    return () => clearInterval(t);
  }, [date]);

  const supplements = clientData?.supplements || [];
  const grouped = groupByTime(supplements);
  const allKeys = Object.entries(grouped).flatMap(([t, items]) => items.map((_, i) => `${t}-${i}`));
  const doneCount = allKeys.filter(k => checked[k]).length;

  const handleToggle = (key) => setChecked(c => ({ ...c, [key]: !c[key] }));

  const today = date.toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "long" });

  // 找不到客人時顯示提示
  if (!clientData) {
    return (
      <div style={{
        fontFamily: "'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
        background: TOKEN.cream, minHeight: "100vh",
        maxWidth: 540, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", padding: 40, color: TOKEN.gray400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: TOKEN.forest, marginBottom: 8 }}>
            請使用專屬連結開啟
          </div>
          <div style={{ fontSize: 13 }}>請聯繫芯蒂營養師取得你的專屬連結</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
      background: TOKEN.cream, minHeight: "100vh",
      maxWidth: 540, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        background: TOKEN.forest, padding: "20px 20px 0",
        borderBottom: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: TOKEN.sageL, letterSpacing: "0.1em", fontWeight: 600 }}>
              芯蒂營養師
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: TOKEN.white, letterSpacing: "-0.01em" }}>
              {clientData.name} 的每日補充排程
            </div>
          </div>
          <ProgressRing total={allKeys.length} done={doneCount} />
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0 }}>
          <div style={{
            flex: 1, padding: "10px 0", textAlign: "center",
            background: TOKEN.cream, color: TOKEN.forest,
            fontWeight: 700, fontSize: 13,
            borderRadius: "10px 10px 0 0",
          }}>📋 今日排程</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 40px" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20,
        }}>
          <span style={{ fontSize: 13, color: TOKEN.gray700, fontWeight: 500 }}>{today}</span>
          {doneCount === allKeys.length && allKeys.length > 0 && (
            <span style={{
              background: TOKEN.sage, color: "#fff",
              borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 700,
            }}>🎉 全部完成！</span>
          )}
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            color: TOKEN.gray400, fontSize: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 600 }}>尚未設定任何補充品</div>
          </div>
        ) : (
          TIME_SLOTS.filter(t => grouped[t]).map(t => (
            <TimeSection
              key={t} time={t} items={grouped[t]}
              checked={checked} onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
