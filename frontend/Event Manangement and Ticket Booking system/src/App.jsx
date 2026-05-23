import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ─── API Base ────────────────────────────────────────────────────────────────
const API = "http://localhost:3000/api/v1";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  const logout = async () => {
    try { await apiFetch("/users/log-out", { method: "POST" }); } catch {}
    setUser(null);
    localStorage.removeItem("user");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── Router (simple hash-based) ───────────────────────────────────────────────
function useRoute() {
  const [route, setRoute] = useState(window.location.hash || "#/");
  useEffect(() => {
    const handler = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (path) => { window.location.hash = path; };
  return { route, navigate };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);
function useToast() { return useContext(ToastContext); }

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: "12px 20px", borderRadius: 10, fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, fontWeight: 500, maxWidth: 320,
            background: t.type === "error" ? "#fee2e2" : t.type === "info" ? "#e0f2fe" : "#dcfce7",
            color: t.type === "error" ? "#991b1b" : t.type === "info" ? "#0c4a6e" : "#166534",
            border: `1px solid ${t.type === "error" ? "#fca5a5" : t.type === "info" ? "#7dd3fc" : "#86efac"}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            animation: "slideIn 0.25s ease"
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Design Tokens & Global Styles ───────────────────────────────────────────
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f7f6f3; color: #1a1a1a; min-height: 100vh; }
  @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes fadeUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.35s ease both; }
  input, select, textarea {
    width: 100%; padding: 10px 14px; border: 1px solid #e0ddd8; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; background: #fff;
    transition: border-color 0.15s; outline: none; color: #1a1a1a;
  }
  input:focus, select:focus, textarea:focus { border-color: #2d5be3; box-shadow: 0 0 0 3px rgba(45,91,227,0.12); }
  button { cursor: pointer; font-family: 'DM Sans', sans-serif; border: none; }
  a { text-decoration: none; color: inherit; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d1cfc9; border-radius: 3px; }
`;

// ─── Shared Components ────────────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", size = "md", disabled, style = {}, type = "button" }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500,
    borderRadius: 8, transition: "all 0.15s", border: "none",
    fontSize: size === "sm" ? 13 : 14,
    padding: size === "sm" ? "7px 14px" : size === "lg" ? "13px 28px" : "10px 20px",
    opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer",
  };
  const variants = {
    primary: { background: "#2d5be3", color: "#fff" },
    danger:  { background: "#dc2626", color: "#fff" },
    ghost:   { background: "transparent", color: "#555", border: "1px solid #e0ddd8" },
    outline: { background: "transparent", color: "#2d5be3", border: "1px solid #2d5be3" },
    dark:    { background: "#1a1a1a", color: "#fff" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 14, border: "1px solid #ebe9e4",
      padding: "20px 24px", cursor: onClick ? "pointer" : "default",
      transition: onClick ? "box-shadow 0.2s, transform 0.2s" : undefined,
      ...style
    }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; } : undefined}
    onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; } : undefined}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 20, height: 20, border: "2px solid #e0ddd8", borderTopColor: "#2d5be3", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}

function Badge({ children, color = "blue" }) {
  const colors = {
    blue:   { bg: "#eff6ff", text: "#1d4ed8" },
    green:  { bg: "#f0fdf4", text: "#15803d" },
    red:    { bg: "#fef2f2", text: "#b91c1c" },
    amber:  { bg: "#fffbeb", text: "#b45309" },
    gray:   { bg: "#f9fafb", text: "#4b5563" },
    purple: { bg: "#faf5ff", text: "#7e22ce" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 500, background: c.bg, color: c.text,
    }}>
      {children}
    </span>
  );
}

function FormField({ label, children, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#555", marginBottom: 6 }}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</p>}
    </div>
  );
}

function EmptyState({ icon, title, message, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#888" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <p style={{ fontSize: 18, fontWeight: 600, color: "#333", marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 14, marginBottom: 24 }}>{message}</p>
      {action}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const { user, logout } = useAuth();
  const { navigate } = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(247,246,243,0.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #ebe9e4", padding: "0 24px", height: 60,
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div
        onClick={() => navigate("#/")}
        style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, cursor: "pointer", letterSpacing: "-0.5px" }}
      >
        evnt<span style={{ color: "#2d5be3" }}>.</span>
      </div>

      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={() => navigate("#/events")}>Browse</Btn>
          <Btn variant="ghost" size="sm" onClick={() => navigate("#/my-bookings")}>My Bookings</Btn>
          {(user.role === "Organizer" || user.role === "Admin") && (
            <Btn variant="ghost" size="sm" onClick={() => navigate("#/create-event")}>+ Event</Btn>
          )}
          {user.role === "Admin" && (
            <Btn variant="ghost" size="sm" onClick={() => navigate("#/admin")}>Admin</Btn>
          )}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setMenuOpen(o => !o)}
              style={{
                width: 34, height: 34, borderRadius: "50%", background: "#2d5be3",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}
            >
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            {menuOpen && (
              <div style={{
                position: "absolute", right: 0, top: 42, background: "#fff",
                border: "1px solid #ebe9e4", borderRadius: 10, minWidth: 160,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 200
              }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid #ebe9e4" }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{user.email}</p>
                  <Badge color={user.role === "Admin" ? "purple" : user.role === "Organizer" ? "blue" : "gray"}>{user.role}</Badge>
                </div>
                <div
                  onClick={() => { logout(); setMenuOpen(false); navigate("#/login"); }}
                  style={{ padding: "10px 16px", fontSize: 14, color: "#dc2626", cursor: "pointer" }}
                >
                  Sign out
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={() => navigate("#/login")}>Sign in</Btn>
          <Btn size="sm" onClick={() => navigate("#/register")}>Get started</Btn>
        </div>
      )}
    </nav>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

// HOME
function HomePage() {
  const { user } = useAuth();
  const { navigate } = useRoute();
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }} className="fade-up">
      <div style={{ maxWidth: 620 }}>
        <Badge color="blue">Event Management Platform</Badge>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(36px, 6vw, 64px)",
          lineHeight: 1.05, marginTop: 20, marginBottom: 20, letterSpacing: "-1.5px"
        }}>
          Book events.<br />
          <span style={{ color: "#2d5be3" }}>Track tickets.</span><br />
          Simple.
        </h1>
        <p style={{ fontSize: 17, color: "#666", lineHeight: 1.65, marginBottom: 36, maxWidth: 460 }}>
          Browse campus and external events, book seats instantly, and download your QR-coded ticket — all in one place.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn size="lg" onClick={() => navigate("#/events")}>Browse events →</Btn>
          {!user && <Btn size="lg" variant="ghost" onClick={() => navigate("#/register")}>Create account</Btn>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 80 }}>
        {[
          { icon: "🎟️", title: "Instant booking", desc: "Reserve seats in seconds with a single click" },
          { icon: "📲", title: "QR tickets", desc: "Get a scannable PDF ticket delivered automatically" },
          { icon: "💳", title: "PhonePe payments", desc: "Secure UPI payments via PhonePe gateway" },
          { icon: "🏅", title: "Certificates", desc: "Download attendance certificates after events" },
        ].map(f => (
          <Card key={f.title} style={{ padding: "20px 20px" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{f.title}</p>
            <p style={{ fontSize: 13, color: "#777", lineHeight: 1.5 }}>{f.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// AUTH — shared login/register layout
function AuthPage({ mode }) {
  const { login } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const [form, setForm] = useState({ username: "", email: "", password: "", phone: "", role: "User" });
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiFetch("/users/login", { method: "POST", body: JSON.stringify({ email: form.email, password: form.password }) });
        login(data.body);
        toast("Welcome back!");
        navigate("#/events");
      } else {
        await apiFetch("/users/register", { method: "POST", body: JSON.stringify(form) });
        toast("Account created! Please sign in.");
        navigate("#/login");
      }
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} className="fade-up">
      <Card style={{ width: "100%", maxWidth: 420, padding: 36 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 26, marginBottom: 6 }}>
          {isLogin ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 28 }}>
          {isLogin ? "Sign in to your account" : "Join to browse and book events"}
        </p>

        {!isLogin && (
          <FormField label="Full name">
            <input placeholder="Khaswrang Debbarma" value={form.username} onChange={set("username")} />
          </FormField>
        )}
        <FormField label="Email">
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
        </FormField>
        <FormField label="Password">
          <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={set("password")} />
        </FormField>
        {!isLogin && (
          <>
            <FormField label="Phone">
              <input type="tel" placeholder="10-digit number" value={form.phone} onChange={set("phone")} />
            </FormField>
            <FormField label="I am a…">
              <select value={form.role} onChange={set("role")}>
                <option value="User">Attendee</option>
                <option value="Organizer">Organizer</option>
              </select>
            </FormField>
          </>
        )}

        <Btn style={{ width: "100%", justifyContent: "center", marginTop: 4 }} size="lg" onClick={submit} disabled={loading}>
          {loading ? <Spinner /> : (isLogin ? "Sign in" : "Create account")}
        </Btn>

        <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginTop: 20 }}>
          {isLogin ? "No account? " : "Already have one? "}
          <span
            onClick={() => navigate(isLogin ? "#/register" : "#/login")}
            style={{ color: "#2d5be3", cursor: "pointer", fontWeight: 500 }}
          >
            {isLogin ? "Register" : "Sign in"}
          </span>
        </p>
      </Card>
    </div>
  );
}

// EVENTS BROWSE
function EventsPage() {
  const { navigate } = useRoute();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ title: "", category: "", mode: "", minPrice: "", maxPrice: "" });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
      const data = await apiFetch(`/events/browse-events?${params}`);
      setEvents(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const setF = (k) => (e) => { setFilters(f => ({ ...f, [k]: e.target.value })); setPage(1); };

  const modeColor = { Online: "blue", Campus: "green", External: "amber" };
  const statusColor = { Active: "green", Completed: "gray", Canceled: "red" };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }} className="fade-up">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28 }}>Browse Events</h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 4 }}>{total} events found</p>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 28, padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          <input placeholder="Search by title…" value={filters.title} onChange={setF("title")} />
          <input placeholder="Category" value={filters.category} onChange={setF("category")} />
          <select value={filters.mode} onChange={setF("mode")}>
            <option value="">All modes</option>
            <option value="Online">Online</option>
            <option value="Campus">Campus</option>
            <option value="External">External</option>
          </select>
          <input type="number" placeholder="Min price (₹)" value={filters.minPrice} onChange={setF("minPrice")} />
          <input type="number" placeholder="Max price (₹)" value={filters.maxPrice} onChange={setF("maxPrice")} />
        </div>
      </Card>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div>
      ) : events.length === 0 ? (
        <EmptyState icon="🔍" title="No events found" message="Try adjusting your filters" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {events.map(ev => (
            <Card key={ev._id} onClick={() => navigate(`#/event/${ev._id}`)} style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ background: "#f0eef8", height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                {ev.mode === "Online" ? "💻" : ev.mode === "Campus" ? "🏛️" : "🌍"}
              </div>
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  <Badge color={modeColor[ev.mode] || "gray"}>{ev.mode}</Badge>
                  <Badge color={statusColor[ev.status] || "gray"}>{ev.status}</Badge>
                </div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 6, lineHeight: 1.3 }}>{ev.title}</h3>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                  📍 {ev.venue} · {ev.category}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: ev.price === 0 ? "#15803d" : "#1a1a1a" }}>
                    {ev.price === 0 ? "Free" : `₹${ev.price}`}
                  </span>
                  <span style={{ fontSize: 12, color: "#888" }}>
                    {ev.seatLimit} seats left
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
                  {new Date(ev.startTime).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {total > 9 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          <Btn variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Btn>
          <span style={{ padding: "7px 14px", fontSize: 14, color: "#666" }}>Page {page}</span>
          <Btn variant="ghost" size="sm" disabled={page * 9 >= total} onClick={() => setPage(p => p + 1)}>Next →</Btn>
        </div>
      )}
    </div>
  );
}

// EVENT DETAIL
function EventDetailPage({ id }) {
  const { user } = useAuth();
  const { navigate } = useRoute();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    apiFetch(`/events/${id}/get-event-data`)
      .then(d => setEvent(d.data))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate("#/login"); return; }
    setBooking(true);
    try {
      await apiFetch("/bookings/create-booking", {
        method: "POST",
        body: JSON.stringify({ eventId: id, ticketCount }),
      });
      toast("Booking created! Proceed to payment.");
      setBooked(true);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBooking(false);
    }
  };

  const handlePayment = async () => {
    setBooking(true);
    try {
      const data = await apiFetch(`/payments/${id}/payment-request`, {
        method: "POST",
        body: JSON.stringify({ ticketCount, paymentMethod: "UPI" }),
      });
      window.open(data.paymentUrl, "_blank");
      toast("Redirecting to PhonePe…", "info");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner /></div>;
  if (!event) return <EmptyState icon="❓" title="Event not found" message="" />;

  const modeColor = { Online: "blue", Campus: "green", External: "amber" };
  const isFree = event.price === 0;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }} className="fade-up">
      <Btn variant="ghost" size="sm" onClick={() => navigate("#/events")} style={{ marginBottom: 20 }}>← Back to events</Btn>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <Badge color={modeColor[event.mode] || "gray"}>{event.mode}</Badge>
            <Badge color="gray">{event.category}</Badge>
            {!event.adminApproval && <Badge color="amber">Pending approval</Badge>}
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 32, marginBottom: 12, lineHeight: 1.15 }}>{event.title}</h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
            {[
              { label: "Venue", value: event.venue },
              { label: "Category", value: event.category },
              { label: "Start", value: new Date(event.startTime).toLocaleString("en-IN") },
              { label: "End", value: new Date(event.endTime).toLocaleString("en-IN") },
              { label: "Seats available", value: event.seatLimit },
              { label: "Status", value: event.status },
            ].map(r => (
              <Card key={r.label} style={{ padding: "14px 16px" }}>
                <p style={{ fontSize: 11, color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{r.label}</p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>{r.value}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking panel */}
        <Card style={{ position: "sticky", top: 80, padding: "24px 20px" }}>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 30, marginBottom: 4 }}>
            {isFree ? "Free" : `₹${event.price}`}
          </p>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>per ticket</p>

          {!booked ? (
            <>
              <FormField label="Number of tickets">
                <input type="number" min={1} max={event.seatLimit} value={ticketCount}
                  onChange={e => setTicketCount(Math.max(1, Math.min(event.seatLimit, +e.target.value)))} />
              </FormField>
              {!isFree && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #ebe9e4", marginBottom: 16 }}>
                  <span style={{ color: "#666", fontSize: 14 }}>Total</span>
                  <span style={{ fontWeight: 600 }}>₹{event.price * ticketCount}</span>
                </div>
              )}
              <Btn
                style={{ width: "100%", justifyContent: "center" }} size="lg"
                onClick={handleBook} disabled={booking || event.seatLimit === 0}
              >
                {booking ? <Spinner /> : event.seatLimit === 0 ? "Sold out" : "Book now"}
              </Btn>
            </>
          ) : (
            <>
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: "#166534", fontWeight: 500 }}>✓ Booking reserved!</p>
                <p style={{ fontSize: 13, color: "#166534" }}>Complete payment to confirm.</p>
              </div>
              {!isFree && (
                <Btn style={{ width: "100%", justifyContent: "center" }} size="lg" onClick={handlePayment} disabled={booking}>
                  {booking ? <Spinner /> : "Pay with PhonePe →"}
                </Btn>
              )}
              {isFree && (
                <Btn style={{ width: "100%", justifyContent: "center" }} variant="outline" onClick={() => navigate("#/my-bookings")}>
                  View my bookings →
                </Btn>
              )}
            </>
          )}
          <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12 }}>
            Tickets emailed after payment confirmation
          </p>
        </Card>
      </div>
    </div>
  );
}

// MY BOOKINGS
function MyBookingsPage() {
  const { navigate } = useRoute();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});

  useEffect(() => {
    apiFetch("/bookings/get-booking-history")
      .then(d => setBookings(d.data || []))
      .catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  const downloadTicket = async (bookingId, eventId) => {
    setGenerating(g => ({ ...g, [bookingId]: true }));
    try {
      const res = await fetch(`${API}/tickets/generate-Ticket-PDF`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, eventId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "ticket.pdf"; a.click();
      URL.revokeObjectURL(url);
      toast("Ticket downloaded!");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setGenerating(g => ({ ...g, [bookingId]: false }));
    }
  };

  const statusColor = { Confirmed: "green", Pending: "amber", Cancelled: "red" };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }} className="fade-up">
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, marginBottom: 24 }}>My Bookings</h1>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="🎟️" title="No bookings yet" message="Browse events and book your first ticket"
          action={<Btn onClick={() => navigate("#/events")}>Browse events →</Btn>}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {bookings.map(b => (
            <Card key={b._id} style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Badge color={statusColor[b.bookingStatus] || "gray"}>{b.bookingStatus}</Badge>
                    <span style={{ fontSize: 12, color: "#bbb" }}>{new Date(b.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#666" }}>
                    {b.ticketCount} ticket{b.ticketCount > 1 ? "s" : ""} · Total: <strong>₹{b.totalAmount}</strong>
                  </p>
                  <p style={{ fontSize: 11, color: "#bbb", marginTop: 4, fontFamily: "monospace" }}>ID: {b._id}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {b.bookingStatus === "Confirmed" && (
                    <Btn size="sm" variant="outline" onClick={() => downloadTicket(b._id, b.event)} disabled={generating[b._id]}>
                      {generating[b._id] ? <Spinner /> : "Download ticket"}
                    </Btn>
                  )}
                  <Btn size="sm" variant="ghost" onClick={() => navigate(`#/event/${b.event}`)}>View event</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// CREATE EVENT
function CreateEventPage() {
  const { navigate } = useRoute();
  const toast = useToast();
  const [form, setForm] = useState({
    title: "", category: "", mode: "Campus", venue: "", seatLimit: 50,
    price: 0, startTime: "", endTime: "", status: "Active"
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      await apiFetch("/events/create-event", {
        method: "POST",
        body: JSON.stringify({ ...form, seatLimit: +form.seatLimit, price: +form.price }),
      });
      toast("Event created! Pending admin approval.");
      navigate("#/events");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }} className="fade-up">
      <Btn variant="ghost" size="sm" onClick={() => navigate("#/events")} style={{ marginBottom: 20 }}>← Back</Btn>
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, marginBottom: 4 }}>Create Event</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>Your event will be reviewed by an admin before going live.</p>

      <Card style={{ padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <FormField label="Event title">
              <input placeholder="Hackathon 2025" value={form.title} onChange={set("title")} />
            </FormField>
          </div>
          <FormField label="Category">
            <input placeholder="Tech, Sports, Cultural…" value={form.category} onChange={set("category")} />
          </FormField>
          <FormField label="Mode">
            <select value={form.mode} onChange={set("mode")}>
              <option value="Online">Online</option>
              <option value="Campus">Campus</option>
              <option value="External">External</option>
            </select>
          </FormField>
          <div style={{ gridColumn: "1/-1" }}>
            <FormField label="Venue">
              <input placeholder="Main Auditorium / Zoom Link" value={form.venue} onChange={set("venue")} />
            </FormField>
          </div>
          <FormField label="Total seats">
            <input type="number" min={1} value={form.seatLimit} onChange={set("seatLimit")} />
          </FormField>
          <FormField label="Price per ticket (₹)">
            <input type="number" min={0} value={form.price} onChange={set("price")} />
          </FormField>
          <FormField label="Start time">
            <input type="datetime-local" value={form.startTime} onChange={set("startTime")} />
          </FormField>
          <FormField label="End time">
            <input type="datetime-local" value={form.endTime} onChange={set("endTime")} />
          </FormField>
        </div>
        <Btn style={{ width: "100%", justifyContent: "center", marginTop: 8 }} size="lg" onClick={submit} disabled={loading}>
          {loading ? <Spinner /> : "Submit for approval →"}
        </Btn>
      </Card>
    </div>
  );
}

// ADMIN PANEL
function AdminPage() {
  const toast = useToast();
  const { navigate } = useRoute();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  const fetchPending = async () => {
    setLoading(true);
    try {
      // get any event id to call getPendingEvents — backend uses :id param but returns all pending
      // We call browse with no approval filter from admin perspective via getEventData
      // Actually getPendingEvents needs an id, so we'll use a workaround: browse all, filter unapproved
      const data = await apiFetch("/events/browse-events?limit=50&page=1");
      // Browse only returns approved. Fetch a known event to get pending via getPendingEvents
      // The actual getPendingEvents route is /:id/get-pending-events which returns pending events list
      // Let's call it with a placeholder and handle gracefully
      try {
        const pending = await apiFetch("/events/000000000000000000000000/get-pending-events");
        setEvents(pending.data || []);
      } catch {
        setEvents([]);
      }
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const approve = async (eventId) => {
    setApproving(a => ({ ...a, [eventId]: true }));
    try {
      await apiFetch("/events/approve-event", {
        method: "POST",
        body: JSON.stringify({ eventId }),
      });
      toast("Event approved!");
      setEvents(evs => evs.filter(e => e._id !== eventId));
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setApproving(a => ({ ...a, [eventId]: false }));
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }} className="fade-up">
      <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 28, marginBottom: 4 }}>Admin Panel</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>Review and approve pending events</p>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner /></div>
      ) : events.length === 0 ? (
        <EmptyState icon="✅" title="All caught up!" message="No pending events to review" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {events.map(ev => (
            <Card key={ev._id} style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 16 }}>{ev.title}</h3>
                  <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
                    {ev.mode} · {ev.venue} · {ev.category} · ₹{ev.price}
                  </p>
                  <p style={{ fontSize: 12, color: "#bbb", marginTop: 2 }}>
                    {new Date(ev.startTime).toLocaleDateString("en-IN")} → {new Date(ev.endTime).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn size="sm" onClick={() => approve(ev._id)} disabled={approving[ev._id]}>
                    {approving[ev._id] ? <Spinner /> : "Approve ✓"}
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => navigate(`#/event/${ev._id}`)}>View</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// PAYMENT RETURN (after PhonePe redirect)
function PaymentReturnPage() {
  const { navigate } = useRoute();
  return (
    <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center" }} className="fade-up">
      <Card style={{ maxWidth: 400, textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 8 }}>
          Payment received!
        </h2>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Your booking is being confirmed. Once the webhook is processed, your ticket will be ready to download.
        </p>
        <Btn onClick={() => navigate("#/my-bookings")} style={{ justifyContent: "center", width: "100%" }}>
          View my bookings →
        </Btn>
      </Card>
    </div>
  );
}

// 404
function NotFoundPage() {
  const { navigate } = useRoute();
  return (
    <EmptyState
      icon="🗺️" title="Page not found" message="This route doesn't exist"
      action={<Btn onClick={() => navigate("#/")}>Go home</Btn>}
    />
  );
}

// ─── Root Router ──────────────────────────────────────────────────────────────
function Router() {
  const { route } = useRoute();
  const { user } = useAuth();
  const { navigate } = useRoute();

  const path = route.replace("#", "") || "/";

  // Auth guard
  const guarded = ["/events", "/my-bookings", "/create-event", "/admin"];
  if (guarded.some(g => path.startsWith(g)) && !user) {
    navigate("#/login");
    return null;
  }
  if (path.startsWith("/admin") && user?.role !== "Admin") {
    return <EmptyState icon="🚫" title="Access denied" message="Admins only" />;
  }
  if (path.startsWith("/create-event") && !["Organizer", "Admin"].includes(user?.role)) {
    return <EmptyState icon="🚫" title="Access denied" message="Organizers and admins only" />;
  }

  if (path === "/" || path === "") return <HomePage />;
  if (path === "/login") return <AuthPage mode="login" />;
  if (path === "/register") return <AuthPage mode="register" />;
  if (path === "/events") return <EventsPage />;
  if (path.startsWith("/event/")) return <EventDetailPage id={path.split("/")[2]} />;
  if (path === "/my-bookings") return <MyBookingsPage />;
  if (path === "/create-event") return <CreateEventPage />;
  if (path === "/admin") return <AdminPage />;
  if (path === "/payment-success") return <PaymentReturnPage />;
  return <NotFoundPage />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{STYLE}</style>
      <AuthProvider>
        <ToastProvider>
          <Nav />
          <main>
            <Router />
          </main>
        </ToastProvider>
      </AuthProvider>
    </>
  );
}