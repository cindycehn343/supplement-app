import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────
const SUPABASE_URL = "https://mpbxmgwzjnykowxxmxup.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnhtZ3d6am55a293eHhteHVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NzQ0OTgsImV4cCI6MjA5NzI1MDQ5OH0.7vSBRB-mAqBQ4mh9pJ0pOuANR19TS7lFVBBokHKdlxk";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 管理員密碼（你可以改成自己想要的）
const ADMIN_PASSWORD = "cindy2024";

// ── Design tokens ─────────────────────────────────────────────
const T = {
  sage: "#6B9E8A", sageL: "#A8C9BB", sagePale: "#EAF3EF",
  cream: "#FAF7F2", forest: "#1E3A2F", white: "#FFFFFF",
  gray50: "#F7F7F7", gray200: "#E5E5E5", gray400: "#9A9A9A", gray700: "#4A4A4A",
};

const TYPE_ICONS = { powder:"🥄", capsule:"💊", tablet:"⬜", liquid:"💧", jelly:"🟩" };
const TIME_SLOTS = ["起床後","早餐前","早餐後","早餐中","午餐前","午餐後","午餐中","下午茶","晚餐前","晚餐後","晚餐中","睡前"];
const TIME_EMOJI = {
  "起床後":"🌅","早餐前":"☀️","早餐後":"☀️","早餐中":"☀️",
  "午餐前":"🌤️","午餐後":"🌤️","午餐中":"🌤️","下午茶":"🍵",
  "晚餐前":"🌙","晚餐後":"🌙","晚餐中":"🌙","睡前":"😴"
};
const COLORS = ["#6B9E8A","#5B9BD5","#E8935A","#9B59B6","#3D9970","#E74C3C","#F39C12"];

function groupByTime(supplements) {
  const map = {};
  (supplements || []).forEach(sup => {
    (sup.schedule || []).forEach(s => {
      if (!map[s.time]) map[s.time] = [];
      map[s.time].push({ ...sup, currentDose: s.dose, currentWater: s.water });
    });
  });
  return map;
}

// ── Shared UI ─────────────────────────────────────────────────
function Badge({ color, children }) {
  return (
    <span style={{
      background: color + "20", color, border: `1px solid ${color}40`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  );
}

function Btn({ onClick, children, color = T.sage, outline, small, danger }) {
  const bg = danger ? "#E53935" : outline ? "transparent" : color;
  const col = outline ? (danger ? "#E53935" : T.forest) : "#fff";
  const border = outline ? `1.5px solid ${danger ? "#E53935" : T.gray200}` : "none";
  return (
    <button onClick={onClick} style={{
      background: bg, color: col, border, borderRadius: 10,
      padding: small ? "6px 14px" : "10px 20px",
      cursor: "pointer", fontWeight: 700, fontSize: small ? 12 : 14,
      fontFamily: "inherit", transition: "opacity 0.15s",
    }}>{children}</button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.gray700 }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${T.gray200}`,
          fontSize: 14, background: T.white, color: T.forest, outline: "none",
          fontFamily: "inherit", boxSizing: "border-box", width: "100%",
        }}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: T.gray700 }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${T.gray200}`,
        fontSize: 14, background: T.white, color: T.forest, outline: "none",
        fontFamily: "inherit", boxSizing: "border-box", width: "100%",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Client View ───────────────────────────────────────────────
function ClientView({ slug }) {
  const [client, setClient] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from("clients").select("*").eq("slug", slug).single();
      if (!c) { setLoading(false); return; }
      setClient(c);
      const { data: s } = await supabase.from("supplements").select("*").eq("client_id", c.id).order("created_at");
      setSupplements(s || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  const grouped = groupByTime(supplements);
  const allKeys = Object.entries(grouped).flatMap(([t, items]) => items.map((_, i) => `${t}-${i}`));
  const doneCount = allKeys.filter(k => checked[k]).length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: T.cream }}>
      <div style={{ color: T.gray400, fontSize: 14 }}>載入中…</div>
    </div>
  );

  if (!client) return (
    <div style={{
      fontFamily: "'PingFang TC', sans-serif", background: T.cream,
      minHeight: "100vh", maxWidth: 540, margin: "0 auto",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ textAlign: "center", padding: 40, color: T.gray400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.forest, marginBottom: 8 }}>請使用專屬連結開啟</div>
        <div style={{ fontSize: 13 }}>請聯繫芯蒂營養師取得你的專屬連結</div>
      </div>
    </div>
  );

  const today = new Date().toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "long" });

  return (
    <div style={{ fontFamily: "'PingFang TC', sans-serif", background: T.cream, minHeight: "100vh", maxWidth: 540, margin: "0 auto" }}>
      <div style={{ background: T.forest, padding: "20px 20px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: T.sageL, letterSpacing: "0.1em", fontWeight: 600 }}>芯蒂營養師</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.white }}>{client.name} 的每日補充排程</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
              <circle cx="26" cy="26" r="22" fill="none" stroke={T.sageL} strokeWidth="4" opacity="0.3" />
              <circle cx="26" cy="26" r="22" fill="none" stroke={T.sageL} strokeWidth="4"
                strokeDasharray={`${allKeys.length ? (doneCount / allKeys.length) * 138 : 0} 138`}
                strokeLinecap="round" transform="rotate(-90 26 26)" />
              <text x="26" y="31" textAnchor="middle" fill={T.white} fontSize="13" fontWeight="800">
                {allKeys.length ? Math.round(doneCount / allKeys.length * 100) : 0}%
              </text>
            </svg>
          </div>
        </div>
        <div style={{ background: T.cream, borderRadius: "10px 10px 0 0", padding: "10px 16px", textAlign: "center", fontWeight: 700, fontSize: 13, color: T.forest }}>
          📋 今日排程
        </div>
      </div>

      <div style={{ padding: "20px 16px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: T.gray700 }}>{today}</span>
          {doneCount === allKeys.length && allKeys.length > 0 && (
            <span style={{ background: T.sage, color: "#fff", borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 700 }}>🎉 全部完成！</span>
          )}
        </div>

        {supplements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: T.gray400 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div style={{ fontWeight: 600 }}>尚未設定任何補充品</div>
          </div>
        ) : (
          TIME_SLOTS.filter(t => grouped[t]).map(t => (
            <div key={t} style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{TIME_EMOJI[t]}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: T.forest }}>{t}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: T.gray400 }}>
                  {grouped[t].filter((_, i) => checked[`${t}-${i}`]).length}/{grouped[t].length} 完成
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {grouped[t].map((sup, i) => {
                  const key = `${t}-${i}`;
                  const done = !!checked[key];
                  return (
                    <div key={key} onClick={() => setChecked(c => ({ ...c, [key]: !c[key] }))}
                      style={{
                        background: done ? T.sagePale : T.white,
                        border: `1.5px solid ${done ? T.sage : T.gray200}`,
                        borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 14, opacity: done ? 0.75 : 1,
                        transition: "all 0.2s",
                      }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: sup.color + "18", border: `2px solid ${sup.color}50`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                      }}>{TYPE_ICONS[sup.type] || "💊"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: T.forest }}>{sup.name}</span>
                          {sup.brand && <Badge color={sup.color}>{sup.brand}</Badge>}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 13, color: T.gray700 }}>
                          <span style={{ fontWeight: 600 }}>{sup.currentDose}</span>
                          {sup.currentWater && <span style={{ color: T.gray400 }}> ＋ {sup.currentWater}</span>}
                        </div>
                        {sup.note && <div style={{ marginTop: 3, fontSize: 11, color: T.gray400 }}>💡 {sup.note}</div>}
                      </div>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                        background: done ? T.sage : T.white, border: `2px solid ${done ? T.sage : T.gray200}`,
                        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                      }}>{done && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Admin: Supplement Form ─────────────────────────────────────
function SupplementForm({ initial, onSave, onCancel }) {
  const blank = { name: "", brand: "", type: "powder", color: "#6B9E8A", note: "", schedule: [{ time: "早餐後", dose: "", water: "" }] };
  const [form, setForm] = useState(initial ? { ...initial, schedule: initial.schedule || [] } : blank);
  const [saving, setSaving] = useState(false);

  const updateSchedule = (i, field, val) => setForm(f => {
    const s = [...f.schedule]; s[i] = { ...s[i], [field]: val }; return { ...f, schedule: s };
  });

  const handleSave = async () => {
    if (!form.name.trim()) return alert("請填寫品名");
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Input label="品名 *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="如：NAD+ 果凍" />
        <Input label="品牌" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} placeholder="如：PRIME" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Select label="劑型" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))}
          options={[{value:"powder",label:"粉狀 🥄"},{value:"capsule",label:"膠囊 💊"},{value:"tablet",label:"錠劑 ⬜"},{value:"jelly",label:"果凍 🟩"},{value:"liquid",label:"液態 💧"}]} />
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.gray700, display: "block", marginBottom: 4 }}>顏色標記</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer",
                border: form.color === c ? `3px solid ${T.forest}` : "3px solid transparent",
              }} />
            ))}
          </div>
        </div>
      </div>

      <Input label="備註" value={form.note} onChange={v => setForm(f => ({ ...f, note: v }))} placeholder="如：空腹效果最佳" />

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.gray700, marginBottom: 8 }}>服用時間</div>
        {form.schedule.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
            <Select value={s.time} onChange={v => updateSchedule(i, "time", v)}
              options={TIME_SLOTS.map(t => ({ value: t, label: t }))} />
            <Input value={s.dose} onChange={v => updateSchedule(i, "dose", v)} placeholder="劑量 如：1包" />
            <Input value={s.water} onChange={v => updateSchedule(i, "water", v)} placeholder="配水 如：120cc" />
            {form.schedule.length > 1 && (
              <button onClick={() => setForm(f => ({ ...f, schedule: f.schedule.filter((_, j) => j !== i) }))}
                style={{ background: "#FFF0F0", border: "1px solid #FFCDD2", borderRadius: 8, cursor: "pointer", color: "#E53935", padding: "0 10px", fontSize: 16 }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={() => setForm(f => ({ ...f, schedule: [...f.schedule, { time: "午餐後", dose: "", water: "" }] }))}
          style={{ background: T.sagePale, border: `1px dashed ${T.sage}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: T.sage, fontSize: 13, fontFamily: "inherit" }}>
          ＋ 新增時段
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
        <Btn outline onClick={onCancel}>取消</Btn>
        <Btn onClick={handleSave}>{saving ? "儲存中…" : "儲存"}</Btn>
      </div>
    </div>
  );
}

// ── Admin View ────────────────────────────────────────────────
function AdminView() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [supplements, setSupplements] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddSup, setShowAddSup] = useState(false);
  const [editSup, setEditSup] = useState(null);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    const { data } = await supabase.from("clients").select("*").order("created_at");
    setClients(data || []);
    setLoading(false);
  }

  async function loadSupplements(clientId) {
    const { data } = await supabase.from("supplements").select("*").eq("client_id", clientId).order("created_at");
    setSupplements(data || []);
  }

  async function handleSelectClient(c) {
    setSelectedClient(c);
    setShowAddSup(false);
    setEditSup(null);
    await loadSupplements(c.id);
  }

  async function handleAddClient() {
    if (!newName.trim() || !newSlug.trim()) return alert("請填寫姓名和連結名稱");
    const slug = newSlug.trim().toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("clients").insert({ name: newName.trim(), slug });
    if (error) return alert("連結名稱已被使用，請換一個");
    setNewName(""); setNewSlug(""); setShowAddClient(false);
    loadClients();
  }

  async function handleDeleteClient(c) {
    if (!confirm(`確定刪除「${c.name}」和他所有的補充品？`)) return;
    await supabase.from("clients").delete().eq("id", c.id);
    if (selectedClient?.id === c.id) { setSelectedClient(null); setSupplements([]); }
    loadClients();
  }

  async function handleSaveSup(form) {
    if (editSup) {
      await supabase.from("supplements").update({ ...form }).eq("id", editSup.id);
    } else {
      await supabase.from("supplements").insert({ ...form, client_id: selectedClient.id });
    }
    setShowAddSup(false); setEditSup(null);
    loadSupplements(selectedClient.id);
  }

  async function handleDeleteSup(sup) {
    if (!confirm(`確定刪除「${sup.name}」？`)) return;
    await supabase.from("supplements").delete().eq("id", sup.id);
    loadSupplements(selectedClient.id);
  }

  const appUrl = window.location.origin;

  return (
    <div style={{ fontFamily: "'PingFang TC', sans-serif", background: "#F0F4F8", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: T.forest, padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>🌿</span>
        <div>
          <div style={{ color: T.sageL, fontSize: 11, fontWeight: 600 }}>管理後台</div>
          <div style={{ color: T.white, fontSize: 18, fontWeight: 800 }}>芯蒂營養師</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {/* Left: client list */}
        <div style={{ width: 260, flexShrink: 0, marginRight: 24 }}>
          <div style={{ background: T.white, borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: T.forest }}>客人列表</span>
              <Btn small onClick={() => setShowAddClient(true)}>＋ 新增</Btn>
            </div>

            {showAddClient && (
              <div style={{ background: T.sagePale, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <Input label="客人姓名" value={newName} onChange={setNewName} placeholder="如：Shaw" />
                <div style={{ marginTop: 8 }}>
                  <Input label="連結名稱（英文）" value={newSlug} onChange={setNewSlug} placeholder="如：shaw" />
                  <div style={{ fontSize: 11, color: T.gray400, marginTop: 4 }}>客人網址：{appUrl}/#shaw</div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Btn small outline onClick={() => setShowAddClient(false)}>取消</Btn>
                  <Btn small onClick={handleAddClient}>確認新增</Btn>
                </div>
              </div>
            )}

            {loading ? <div style={{ color: T.gray400, fontSize: 13, textAlign: "center", padding: 20 }}>載入中…</div> : null}

            {clients.map(c => (
              <div key={c.id}
                onClick={() => handleSelectClient(c)}
                style={{
                  background: selectedClient?.id === c.id ? T.sagePale : "transparent",
                  border: `1.5px solid ${selectedClient?.id === c.id ? T.sage : "transparent"}`,
                  borderRadius: 10, padding: "10px 12px", cursor: "pointer", marginBottom: 6,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: T.forest }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: T.gray400 }}>#{c.slug}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); handleDeleteClient(c); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: T.gray400, fontSize: 16, padding: 4 }}>🗑</button>
              </div>
            ))}

            {!loading && clients.length === 0 && (
              <div style={{ color: T.gray400, fontSize: 13, textAlign: "center", padding: "20px 0" }}>還沒有客人，先新增一位！</div>
            )}
          </div>
        </div>

        {/* Right: supplements */}
        <div style={{ flex: 1 }}>
          {!selectedClient ? (
            <div style={{ background: T.white, borderRadius: 16, padding: 60, textAlign: "center", color: T.gray400, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👈</div>
              <div style={{ fontWeight: 600 }}>請先選擇左邊的客人</div>
            </div>
          ) : (
            <div style={{ background: T.white, borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: T.forest }}>{selectedClient.name} 的補充品</div>
                  <div style={{ fontSize: 12, color: T.gray400, marginTop: 4 }}>
                    客人連結：<a href={`${appUrl}/#${selectedClient.slug}`} target="_blank" rel="noreferrer"
                      style={{ color: T.sage }}>{appUrl}/#{ selectedClient.slug}</a>
                  </div>
                </div>
                <Btn onClick={() => { setShowAddSup(true); setEditSup(null); }}>＋ 新增補充品</Btn>
              </div>

              {(showAddSup || editSup) && (
                <div style={{ background: T.sagePale, borderRadius: 14, padding: 20, marginBottom: 20, border: `2px solid ${T.sage}` }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: T.forest, marginBottom: 14 }}>
                    {editSup ? "編輯補充品" : "新增補充品"}
                  </div>
                  <SupplementForm
                    initial={editSup}
                    onSave={handleSaveSup}
                    onCancel={() => { setShowAddSup(false); setEditSup(null); }}
                  />
                </div>
              )}

              {supplements.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: T.gray400 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                  <div>還沒有任何補充品，點上方按鈕新增</div>
                </div>
              ) : (
                supplements.map(sup => (
                  <div key={sup.id} style={{
                    border: `1.5px solid ${T.gray200}`, borderRadius: 14, padding: 14, marginBottom: 12,
                    display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: sup.color + "18", border: `2px solid ${sup.color}50`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                    }}>{TYPE_ICONS[sup.type] || "💊"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: T.forest }}>{sup.name}</span>
                        {sup.brand && <Badge color={sup.color}>{sup.brand}</Badge>}
                      </div>
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(sup.schedule || []).map((s, i) => (
                          <div key={i} style={{ background: T.sagePale, borderRadius: 8, padding: "4px 10px", fontSize: 12, color: T.forest }}>
                            {TIME_EMOJI[s.time]} {s.time}・{s.dose}{s.water && <span style={{ color: T.gray400 }}>・{s.water}</span>}
                          </div>
                        ))}
                      </div>
                      {sup.note && <div style={{ marginTop: 6, fontSize: 11, color: T.gray400 }}>💡 {sup.note}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <Btn small outline onClick={() => { setEditSup(sup); setShowAddSup(false); }}>編輯</Btn>
                      <Btn small danger outline onClick={() => handleDeleteSup(sup)}>刪除</Btn>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const handle = () => {
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div style={{
      fontFamily: "'PingFang TC', sans-serif", background: T.cream,
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ background: T.white, borderRadius: 20, padding: 40, width: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.10)", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🌿</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: T.forest, marginBottom: 4 }}>芯蒂營養師</div>
        <div style={{ fontSize: 13, color: T.gray400, marginBottom: 24 }}>管理後台登入</div>
        <input
          type="password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handle()}
          placeholder="請輸入密碼"
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12,
            border: `2px solid ${err ? "#E53935" : T.gray200}`, fontSize: 15,
            outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            marginBottom: 12, transition: "border 0.2s",
          }}
        />
        {err && <div style={{ color: "#E53935", fontSize: 13, marginBottom: 8 }}>密碼錯誤，請再試一次</div>}
        <button onClick={handle} style={{
          width: "100%", background: T.sage, color: "#fff", border: "none",
          borderRadius: 12, padding: "12px 0", fontSize: 15, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>登入</button>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────
export default function App() {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const hash = window.location.hash.replace("#", "").toLowerCase();

  if (hash === "admin") {
    if (!adminLoggedIn) return <Login onLogin={() => setAdminLoggedIn(true)} />;
    return <AdminView />;
  }

  return <ClientView slug={hash} />;
}
