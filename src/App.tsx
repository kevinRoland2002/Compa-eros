import { useState, useEffect, createContext, useContext } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const ThemeCtx = createContext<{ dark: boolean; toggle: () => void }>({ dark: true, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

const T = {
  dark: {
    bg: "#0f0f11",
    surface: "#18181c",
    surface2: "#222228",
    border: "#2e2e36",
    text: "#f0f0f4",
    muted: "#8888a0",
    accent: "#6c63ff",
    green: "#4ade80",
    red: "#f87171",
  },
  light: {
    bg: "#f4f4f8",
    surface: "#ffffff",
    surface2: "#f0f0f5",
    border: "#dddde8",
    text: "#111118",
    muted: "#7777a0",
    accent: "#6c63ff",
    green: "#16a34a",
    red: "#dc2626",
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────
type User = { id: string; name: string; phone: string };
type Member = { id: string; name: string; phone: string };
type Task = { id: string; text: string; done: boolean; createdBy: string };
type ShopItem = { id: string; text: string; done: boolean; createdBy: string };
type Tab = "tasks" | "shop" | "group";

// ─── Persistence ─────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch { return fallback; }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
const uid = () => Math.random().toString(36).slice(2, 9);

const DEMO_TASKS: Task[] = [
  { id: "t1", text: "Revisar informe mensual", done: false, createdBy: "Carlos" },
  { id: "t2", text: "Actualizar documentación", done: true, createdBy: "Ana" },
];
const DEMO_SHOP: ShopItem[] = [
  { id: "s1", text: "Papel para impresora A4", done: false, createdBy: "Ana" },
  { id: "s2", text: "Café molido", done: false, createdBy: "Carlos" },
];
const DEMO_MEMBERS: Member[] = [
  { id: "m1", name: "Carlos López", phone: "+34 612 345 678" },
  { id: "m2", name: "Ana Martínez", phone: "+34 698 765 432" },
];

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  const { dark } = useTheme();
  const c = dark ? T.dark : T.light;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6" onClick={onCancel}>
      <div className="rounded-2xl border w-full max-w-xs p-6" style={{ background: c.surface, borderColor: c.border }} onClick={(e) => e.stopPropagation()}>
        <p className="text-sm font-500 text-center mb-6" style={{ color: c.text }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border font-500 py-3 rounded-xl text-sm" style={{ background: c.surface2, borderColor: c.border, color: c.text }}>Cancelar</button>
          <button onClick={onConfirm} className="flex-1 font-600 py-3 rounded-xl text-sm active:scale-95 transition-all" style={{ background: c.red, color: "#fff" }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function TopBar() {
  const { dark, toggle } = useTheme();
  const c = dark ? T.dark : T.light;
  return (
    <div className="safe-top flex-shrink-0" style={{ background: c.surface, borderBottom: `1px solid ${c.border}` }}>
      <div className="flex items-center justify-between px-5 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: c.accent }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-base font-700" style={{ color: c.text }}>Compañeros</span>
        </div>
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
          style={{ background: c.surface2, borderColor: c.border, color: c.muted }}
        >
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Onboarding: Nombre ───────────────────────────────────────────────────────
function NameScreen({ onDone }: { onDone: (name: string) => void }) {
  const { dark } = useTheme();
  const c = dark ? T.dark : T.light;
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (!name.trim()) return setErr("Escribe tu nombre para continuar");
    onDone(name.trim());
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: c.accent }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-700" style={{ color: c.text }}>¿Cómo te llamas?</h1>
          <p className="mt-1 text-sm" style={{ color: c.muted }}>Este nombre lo verán tus compañeros.</p>
        </div>
        <input
          className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3 border"
          style={{ background: c.surface, borderColor: c.border, color: c.text }}
          placeholder="Tu nombre"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {err && <p className="text-xs mb-3" style={{ color: c.red }}>{err}</p>}
        <button onClick={submit} className="w-full font-600 py-3.5 rounded-xl text-sm active:scale-95 transition-all" style={{ background: c.accent, color: "#fff" }}>
          Continuar
        </button>
      </div>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ userName, onAuth }: { userName: string; onAuth: (phone: string, mode: "create" | "join", code?: string) => void }) {
  const { dark } = useTheme();
  const c = dark ? T.dark : T.light;
  const [mode, setMode] = useState<"create" | "join">("create");
  const [phone, setPhone] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    if (!phone.trim()) return setErr("Escribe tu teléfono");
    if (mode === "join" && !teamCode.trim()) return setErr("Escribe el código del equipo");
    setErr("");
    onAuth(phone.trim(), mode, teamCode.trim() || undefined);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: c.accent }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-700" style={{ color: c.text }}>Hola, {userName}</h1>
          <p className="mt-1 text-sm" style={{ color: c.muted }}>¿Qué quieres hacer?</p>
        </div>

        <div className="flex rounded-xl overflow-hidden border mb-6" style={{ borderColor: c.border }}>
          {(["create", "join"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }}
              className="flex-1 py-2.5 text-sm font-500 transition-colors"
              style={{ background: mode === m ? c.accent : c.surface, color: mode === m ? "#fff" : c.muted }}>
              {m === "create" ? "Crear equipo" : "Unirse"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input className="w-full rounded-xl px-4 py-3 text-sm outline-none border" style={{ background: c.surface, borderColor: c.border, color: c.text }} placeholder="Tu teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {mode === "join" && (
            <input className="w-full rounded-xl px-4 py-3 text-sm outline-none border" style={{ background: c.surface, borderColor: c.border, color: c.text }} placeholder="Código del equipo" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          )}
        </div>

        {err && <p className="text-xs mt-3" style={{ color: c.red }}>{err}</p>}
        <p className="text-xs mt-3" style={{ color: c.muted }}>
          {mode === "create" ? "Se generará un código para invitar a tus compañeros." : "Pide el código al administrador del equipo."}
        </p>

        <button onClick={submit} className="w-full mt-5 font-600 py-3.5 rounded-xl text-sm active:scale-95 transition-all" style={{ background: c.accent, color: "#fff" }}>
          {mode === "create" ? "Crear equipo" : "Unirse al equipo"}
        </button>
      </div>
    </div>
  );
}

// ─── QR visual ───────────────────────────────────────────────────────────────
function FakeQR({ value }: { value: string }) {
  const size = 160; const cells = 21; const cell = size / cells;
  const bits = Array.from({ length: cells * cells }, (_, i) => {
    const ch = value.charCodeAt(i % value.length);
    return ((ch * (i + 7) * 31) % 13) < 6 ? 1 : 0;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {bits.map((b, i) => {
        const row = Math.floor(i / cells); const col = i % cells;
        const inCorner = (row < 7 && col < 7) || (row < 7 && col >= cells - 7) || (row >= cells - 7 && col < 7);
        let fill = "white";
        if (inCorner) {
          const lr = row < 7 ? row : row - (cells - 7); const lc = col < 7 ? col : col - (cells - 7);
          fill = lr === 0 || lr === 6 || lc === 0 || lc === 6 ? "#000" : (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) ? "#000" : "white";
        } else { fill = b ? "#000" : "white"; }
        return <rect key={i} x={col * cell} y={row * cell} width={cell} height={cell} fill={fill} />;
      })}
    </svg>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────
function TasksTab({ user }: { user: User }) {
  const { dark } = useTheme();
  const c = dark ? T.dark : T.light;
  const [tasks, setTasks] = useState<Task[]>(() => load("tasks", DEMO_TASKS));
  const [input, setInput] = useState("");

  useEffect(() => { save("tasks", tasks); }, [tasks]);

  function addTask() {
    if (!input.trim()) return;
    setTasks([{ id: uid(), text: input.trim(), done: false, createdBy: user.name }, ...tasks]);
    setInput("");
  }
  function toggle(id: string) { setTasks(tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t)); }
  function remove(id: string) { setTasks(tasks.filter((t) => t.id !== id)); }

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-xl font-700" style={{ color: c.text }}>Pendientes</h2>
        <p className="text-xs mt-0.5" style={{ color: c.muted }}>{pending.length} por completar</p>
      </div>
      <div className="px-5 pb-3 flex gap-2">
        <input className="flex-1 rounded-xl px-4 py-3 text-sm outline-none border" style={{ background: c.surface, borderColor: c.border, color: c.text }} placeholder="Nueva tarea..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} />
        <button onClick={addTask} className="px-4 rounded-xl font-600 text-lg active:scale-95 transition-all" style={{ background: c.accent, color: "#fff" }}>+</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
        {pending.map((t) => <TaskItem key={t.id} task={t} onToggle={toggle} onRemove={remove} c={c} />)}
        {done.length > 0 && (
          <>
            <p className="text-xs font-500 pt-3 pb-1 uppercase tracking-wider" style={{ color: c.muted }}>Completados</p>
            {done.map((t) => <TaskItem key={t.id} task={t} onToggle={toggle} onRemove={remove} c={c} />)}
          </>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle, onRemove, c }: { task: Task; onToggle: (id: string) => void; onRemove: (id: string) => void; c: typeof T.dark }) {
  return (
    <div className={`flex items-center gap-3 border rounded-xl px-4 py-3.5 ${task.done ? "opacity-50" : ""}`} style={{ background: c.surface, borderColor: c.border }}>
      <button onClick={() => onToggle(task.id)} className="w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all" style={{ background: task.done ? c.green : "transparent", borderColor: task.done ? c.green : c.muted }}>
        {task.done && <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: task.done ? c.muted : c.text, textDecoration: task.done ? "line-through" : "none" }}>{task.text}</p>
        <p className="text-xs" style={{ color: c.muted }}>{task.createdBy}</p>
      </div>
      <button onClick={() => onRemove(task.id)} className="p-1 transition-colors" style={{ color: c.muted }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}

// ─── Shop Tab ─────────────────────────────────────────────────────────────────
function ShopTab({ user }: { user: User }) {
  const { dark } = useTheme();
  const c = dark ? T.dark : T.light;
  const [items, setItems] = useState<ShopItem[]>(() => load("shop", DEMO_SHOP));
  const [input, setInput] = useState("");

  useEffect(() => { save("shop", items); }, [items]);

  function addItem() {
    if (!input.trim()) return;
    setItems([{ id: uid(), text: input.trim(), done: false, createdBy: user.name }, ...items]);
    setInput("");
  }
  function toggle(id: string) { setItems(items.map((i) => i.id === id ? { ...i, done: !i.done } : i)); }
  function remove(id: string) { setItems(items.filter((i) => i.id !== id)); }

  const needed = items.filter((i) => !i.done);
  const bought = items.filter((i) => i.done);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-xl font-700" style={{ color: c.text }}>Lista de compra</h2>
        <p className="text-xs mt-0.5" style={{ color: c.muted }}>{needed.length} artículos pendientes</p>
      </div>
      <div className="px-5 pb-3 flex gap-2">
        <input className="flex-1 rounded-xl px-4 py-3 text-sm outline-none border" style={{ background: c.surface, borderColor: c.border, color: c.text }} placeholder="¿Qué se está acabando?" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
        <button onClick={addItem} className="px-4 rounded-xl font-600 text-lg active:scale-95 transition-all" style={{ background: c.accent, color: "#fff" }}>+</button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
        {needed.map((item) => <ShopItemRow key={item.id} item={item} onToggle={toggle} onRemove={remove} c={c} />)}
        {bought.length > 0 && (
          <>
            <p className="text-xs font-500 pt-3 pb-1 uppercase tracking-wider" style={{ color: c.muted }}>Ya comprado</p>
            {bought.map((item) => <ShopItemRow key={item.id} item={item} onToggle={toggle} onRemove={remove} c={c} />)}
          </>
        )}
      </div>
    </div>
  );
}

function ShopItemRow({ item, onToggle, onRemove, c }: { item: ShopItem; onToggle: (id: string) => void; onRemove: (id: string) => void; c: typeof T.dark }) {
  return (
    <div className={`flex items-center gap-3 border rounded-xl px-4 py-3.5 ${item.done ? "opacity-50" : ""}`} style={{ background: c.surface, borderColor: c.border }}>
      <button onClick={() => onToggle(item.id)} className="w-5 h-5 rounded-md border-2 flex-shrink-0 transition-all" style={{ background: item.done ? c.green : "transparent", borderColor: item.done ? c.green : c.muted }}>
        {item.done && <svg viewBox="0 0 12 12" fill="none" className="w-full h-full p-0.5"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate" style={{ color: item.done ? c.muted : c.text, textDecoration: item.done ? "line-through" : "none" }}>{item.text}</p>
        <p className="text-xs" style={{ color: c.muted }}>{item.createdBy}</p>
      </div>
      <button onClick={() => onRemove(item.id)} className="p-1 transition-colors" style={{ color: c.muted }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
    </div>
  );
}

// ─── Group Tab ────────────────────────────────────────────────────────────────
function GroupTab({ user, teamCode }: { user: User; teamCode: string }) {
  const { dark } = useTheme();
  const c = dark ? T.dark : T.light;
  const [members, setMembers] = useState<Member[]>(() => load("members", DEMO_MEMBERS));
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [addMode, setAddMode] = useState<"phone" | "qr">("phone");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [err, setErr] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => { save("members", members); }, [members]);

  function addMember() {
    if (!newName.trim()) return setErr("Escribe el nombre");
    if (!newPhone.trim()) return setErr("Escribe el teléfono");
    setMembers([...members, { id: uid(), name: newName.trim(), phone: newPhone.trim() }]);
    setNewName(""); setNewPhone(""); setErr(""); setShowAdd(false);
  }

  function doRemove() {
    if (confirmId) setMembers(members.filter((m) => m.id !== confirmId));
    setConfirmId(null);
  }

  const confirmMember = members.find((m) => m.id === confirmId);

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-700" style={{ color: c.text }}>Grupo</h2>
          <p className="text-xs mt-0.5" style={{ color: c.muted }}>{members.length + 1} miembros · código: <span className="font-600" style={{ color: c.accent }}>{teamCode}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowQR(true)} className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors" style={{ background: c.surface, borderColor: c.border, color: c.muted }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><path d="M14 14h2v2h-2zM18 14h3M14 18h3M20 18v3M20 14v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => setShowAdd(true)} className="w-9 h-9 rounded-xl flex items-center justify-center font-600 text-lg active:scale-95 transition-all" style={{ background: c.accent, color: "#fff" }}>+</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-2">
        <div className="flex items-center gap-3 border rounded-xl px-4 py-3.5" style={{ background: c.surface, borderColor: c.accent + "55" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-600 text-sm flex-shrink-0" style={{ background: c.accent }}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-500 truncate" style={{ color: c.text }}>{user.name} <span className="text-xs font-400" style={{ color: c.accent }}>(tú)</span></p>
            <p className="text-xs" style={{ color: c.muted }}>{user.phone}</p>
          </div>
        </div>

        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 border rounded-xl px-4 py-3.5" style={{ background: c.surface, borderColor: c.border }}>
            <div className="w-9 h-9 rounded-full border flex items-center justify-center font-600 text-sm flex-shrink-0" style={{ background: c.surface2, borderColor: c.border, color: c.muted }}>
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-500 truncate" style={{ color: c.text }}>{m.name}</p>
              <p className="text-xs" style={{ color: c.muted }}>{m.phone}</p>
            </div>
            <button onClick={() => setConfirmId(m.id)} className="p-1 transition-colors" style={{ color: c.muted }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
        ))}
      </div>

      {confirmId && confirmMember && (
        <ConfirmDialog message={`¿Eliminar a ${confirmMember.name} del equipo?`} onConfirm={doRemove} onCancel={() => setConfirmId(null)} />
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="border rounded-t-2xl w-full max-w-sm p-6 pb-8" style={{ background: c.surface, borderColor: c.border }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-700 mb-4" style={{ color: c.text }}>Añadir miembro</h3>
            <div className="flex rounded-xl overflow-hidden border mb-4" style={{ borderColor: c.border }}>
              {(["phone", "qr"] as const).map((m) => (
                <button key={m} onClick={() => setAddMode(m)} className="flex-1 py-2.5 text-sm font-500 transition-colors" style={{ background: addMode === m ? c.accent : c.surface2, color: addMode === m ? "#fff" : c.muted }}>
                  {m === "phone" ? "Por teléfono" : "Por QR"}
                </button>
              ))}
            </div>
            {addMode === "phone" ? (
              <div className="space-y-3">
                <input className="w-full rounded-xl px-4 py-3 text-sm outline-none border" style={{ background: c.surface2, borderColor: c.border, color: c.text }} placeholder="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <input className="w-full rounded-xl px-4 py-3 text-sm outline-none border" style={{ background: c.surface2, borderColor: c.border, color: c.text }} placeholder="Teléfono" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMember()} />
                {err && <p className="text-xs" style={{ color: c.red }}>{err}</p>}
                <button onClick={addMember} className="w-full font-600 py-3 rounded-xl text-sm active:scale-95 transition-all" style={{ background: c.accent, color: "#fff" }}>Añadir</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-sm text-center" style={{ color: c.muted }}>Comparte el código del equipo con tu compañero</p>
                <div className="rounded-xl overflow-hidden p-3 bg-white"><FakeQR value={`companeros://join/${teamCode}`} /></div>
                <div className="border rounded-xl px-4 py-3 text-center w-full" style={{ background: c.surface2, borderColor: c.border }}>
                  <p className="text-xs mb-1" style={{ color: c.muted }}>Código del equipo</p>
                  <p className="text-2xl font-700 tracking-widest" style={{ color: c.accent }}>{teamCode}</p>
                </div>
                <button onClick={() => setShowAdd(false)} className="w-full border font-500 py-3 rounded-xl text-sm" style={{ background: c.surface2, borderColor: c.border, color: c.text }}>Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6" onClick={() => setShowQR(false)}>
          <div className="border rounded-2xl w-full max-w-xs p-6" style={{ background: c.surface, borderColor: c.border }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-700 mb-1 text-center" style={{ color: c.text }}>Código del equipo</h3>
            <p className="text-xs text-center mb-5" style={{ color: c.muted }}>Comparte este QR para que se unan</p>
            <div className="flex justify-center rounded-xl overflow-hidden p-4 bg-white mb-4"><FakeQR value={`companeros://join/${teamCode}`} /></div>
            <div className="border rounded-xl px-4 py-3 text-center mb-4" style={{ background: c.surface2, borderColor: c.border }}>
              <p className="text-xs mb-1" style={{ color: c.muted }}>Código</p>
              <p className="text-2xl font-700 tracking-widest" style={{ color: c.accent }}>{teamCode}</p>
            </div>
            <button onClick={() => setShowQR(false)} className="w-full border font-500 py-3 rounded-xl text-sm" style={{ background: c.surface2, borderColor: c.border, color: c.text }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { dark } = useTheme();
  const c = dark ? T.dark : T.light;
  const items: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "tasks", label: "Tareas", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: "shop", label: "Compra", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { id: "group", label: "Grupo", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> },
  ];
  return (
    <div className="safe-bottom flex-shrink-0 border-t flex" style={{ background: c.surface + "ee", borderColor: c.border, backdropFilter: "blur(12px)" }}>
      {items.map((item) => (
        <button key={item.id} onClick={() => setTab(item.id)} className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors" style={{ color: tab === item.id ? c.accent : c.muted }}>
          {item.icon}
          <span className="text-[10px] font-500">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState<boolean>(() => load("darkMode", true));
  const [step, setStep] = useState<"name" | "auth" | "app">(() => load<User | null>("user", null) ? "app" : "name");
  const [user, setUser] = useState<User | null>(() => load<User | null>("user", null));
  const [teamCode, setTeamCode] = useState<string>(() => load("teamCode", ""));
  const [tab, setTab] = useState<Tab>("tasks");

  const c = dark ? T.dark : T.light;

  function toggleDark() {
    setDark((d) => { save("darkMode", !d); return !d; });
  }

  function handleName(name: string) {
    save("userName", name);
    setUser({ id: uid(), name, phone: "" });
    setStep("auth");
  }

  function handleAuth(phone: string, mode: "create" | "join", code?: string) {
    const name = load<string>("userName", "Usuario");
    const u: User = { id: load<string>("userId", uid()), name, phone };
    const tc = mode === "create" ? uid().toUpperCase().slice(0, 6) : (code ?? uid().toUpperCase().slice(0, 6));
    save("user", u); save("userId", u.id); save("teamCode", tc);
    setUser(u); setTeamCode(tc); setStep("app");
  }

  return (
    <ThemeCtx.Provider value={{ dark, toggle: toggleDark }}>
      <div className="h-full flex items-start justify-center" style={{ background: c.bg }}>
        <div className="w-full max-w-sm h-full flex flex-col overflow-hidden" style={{ background: c.bg }}>
          <TopBar />
          {step === "name" && <NameScreen onDone={handleName} />}
          {step === "auth" && user && <AuthScreen userName={user.name} onAuth={handleAuth} />}
          {step === "app" && user && (
            <>
              <div className="flex-1 overflow-hidden flex flex-col">
                {tab === "tasks" && <TasksTab user={user} />}
                {tab === "shop" && <ShopTab user={user} />}
                {tab === "group" && <GroupTab user={user} teamCode={teamCode} />}
              </div>
              <BottomNav tab={tab} setTab={setTab} />
            </>
          )}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
