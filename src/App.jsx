import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  Wind, Droplet, Volume2, Trash2, Factory, Waves, Car, TreePine, AlertCircle,
  CheckCircle2, Clock, MapPin, Calendar, Bell, User, LogOut, Search,
  ChevronRight, ChevronDown, Upload, BarChart3, Award, BookOpen,
  Menu, X, ArrowRight, Leaf, ShieldCheck, Building2, FileText, Send,
  Recycle, Users, Sprout, CircleAlert, ClipboardList, LayoutGrid,
  Mail, Phone, Lock, Briefcase, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

/* ---------------------------------------------------------------------- */
/* Tokens                                                                  */
/* ---------------------------------------------------------------------- */
const T = {
  ink: "#132420", forest: "#1F5C46", forestDark: "#153E30", moss: "#5E8468",
  sky: "#2B6E8F", clay: "#B85A26", paper: "#F1F4EF", card: "#FFFFFF",
  line: "#DEE5DA", faint: "#7C8B81",
};
const FONT_DISPLAY = "'Space Grotesk', 'Segoe UI', sans-serif";
const FONT_BODY = "'IBM Plex Sans', 'Segoe UI', sans-serif";

/* ---------------------------------------------------------------------- */
/* Static data                                                             */
/* ---------------------------------------------------------------------- */
const CATEGORIES = [
  { id: "air", label: "Air Pollution", icon: Wind, color: "#5E8468" },
  { id: "water", label: "Water Pollution", icon: Droplet, color: "#2B6E8F" },
  { id: "noise", label: "Noise Pollution", icon: Volume2, color: "#B85A26" },
  { id: "waste", label: "Waste & Garbage", icon: Trash2, color: "#7A6A4F" },
  { id: "industrial", label: "Industrial Pollution", icon: Factory, color: "#6B4A6B" },
  { id: "sewage", label: "Sewage & Drainage", icon: Waves, color: "#2B6E8F" },
  { id: "vehicular", label: "Vehicular Pollution", icon: Car, color: "#B85A26" },
  { id: "environmental", label: "Environmental Damage", icon: TreePine, color: "#1F5C46" },
  { id: "other", label: "Other", icon: AlertCircle, color: "#7C8B81" },
];
const catMeta = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
const STATUS_FLOW = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved", "Closed"];
const DEPARTMENTS = [
  "Municipal Waste Management", "Water & Sewage Board", "Air Quality Control Cell",
  "Noise & Nuisance Control", "Industrial Compliance Unit", "Public Works Department",
];
const DESIGNATIONS = ["Grievance Officer", "Department Head", "Field Inspector", "Administrative Staff", "Other"];

function fmt(d) { return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
function fmtTime(d) { return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }

/* Awareness content (unchanged, static) */
const POLLUTION_INFO = [
  { id: "air", title: "Air Pollution", icon: Wind, blurb: "Harmful gases and particulate matter released into the atmosphere.", causes: "Vehicle exhaust, industrial emissions, open burning, construction dust.", impact: "Respiratory illness, reduced visibility, damage to crops and buildings.", prevent: "Use public transport, maintain vehicles, avoid burning waste." },
  { id: "water", title: "Water Pollution", icon: Droplet, blurb: "Contamination of rivers, lakes, and groundwater by waste and chemicals.", causes: "Industrial effluent, untreated sewage, agricultural runoff, littering.", impact: "Unsafe drinking water, harm to aquatic life, spread of disease.", prevent: "Never dump waste in water bodies, treat effluent before discharge." },
  { id: "noise", title: "Noise Pollution", icon: Volume2, blurb: "Excessive or disruptive sound levels in the environment.", causes: "Traffic honking, construction, loudspeakers, industrial machinery.", impact: "Hearing loss, stress, sleep disruption, effect on wildlife.", prevent: "Limit honking, respect quiet hours, use sound barriers." },
  { id: "soil", title: "Soil Pollution", icon: Sprout, blurb: "Degradation of soil quality from chemicals and improper waste disposal.", causes: "Pesticides, industrial waste dumping, plastic accumulation.", impact: "Reduced fertility, contaminated crops, groundwater seepage.", prevent: "Proper waste segregation, responsible pesticide use, composting." },
  { id: "plastic", title: "Plastic Pollution", icon: Recycle, blurb: "Accumulation of non-biodegradable plastic in the environment.", causes: "Single-use plastics, poor waste management, littering.", impact: "Clogged drains, harm to animals, microplastics in food chains.", prevent: "Carry reusable bags, avoid single-use plastic, recycle properly." },
  { id: "waste", title: "Waste Pollution", icon: Trash2, blurb: "Improper handling and disposal of household and municipal waste.", causes: "Mixed waste streams, illegal dumping, inadequate collection.", impact: "Breeding ground for disease, land and water contamination.", prevent: "Segregate wet and dry waste, follow local collection schedules." },
  { id: "industrial", title: "Industrial Pollution", icon: Factory, blurb: "Pollution generated directly from manufacturing and industrial activity.", causes: "Unregulated emissions, effluent discharge, hazardous waste.", impact: "Severe local air and water contamination, health hazards.", prevent: "Enforce compliance, adopt cleaner technology, regular audits." },
];
const HOW_TO_HELP = [
  { id: "air", title: "Reduce Air Pollution", icon: Wind, tips: ["Use public transport where possible", "Avoid unnecessary vehicle idling", "Maintain vehicles properly", "Prefer walking or cycling for short trips"] },
  { id: "water", title: "Reduce Water Pollution", icon: Droplet, tips: ["Do not dump waste into water bodies", "Dispose of chemicals responsibly", "Avoid littering near rivers, lakes, and drains"] },
  { id: "waste", title: "Reduce Waste", icon: Trash2, tips: ["Separate wet and dry waste", "Reuse materials where possible", "Reduce unnecessary plastic use", "Follow local waste collection rules"] },
  { id: "noise", title: "Reduce Noise Pollution", icon: Volume2, tips: ["Avoid unnecessary honking", "Keep sound levels reasonable", "Follow local restrictions on loudspeakers"] },
];
const ARTICLES = [
  { id: 1, title: "What is Air Pollution?", tag: "Air", icon: Wind, facts: "Vehicles and industry are the two largest urban contributors.", tip: "Check your city's AQI before outdoor activity on high-pollution days." },
  { id: 2, title: "Understanding AQI", tag: "Air", icon: BarChart3, facts: "AQI above 200 is considered unhealthy for the general public.", tip: "An AQI below 50 is classified as good air quality." },
  { id: 3, title: "How Plastic Pollution Affects the Environment", tag: "Plastic", icon: Recycle, facts: "Plastic can take hundreds of years to break down in the environment.", tip: "Swap single-use plastic bags for reusable cloth ones." },
  { id: 4, title: "How to Segregate Household Waste", tag: "Waste", icon: Trash2, facts: "Wet, dry, and hazardous waste each need separate handling.", tip: "Keep a labelled bin for each waste type at home." },
  { id: 5, title: "How Citizens Can Reduce Pollution", tag: "Community", icon: Users, facts: "Local reporting speeds up municipal response significantly.", tip: "Report issues as soon as you notice them, with photos if possible." },
  { id: 6, title: "The Importance of Recycling", tag: "Waste", icon: Recycle, facts: "Recycling reduces the demand for raw material extraction.", tip: "Rinse containers before placing them in the recycling bin." },
  { id: 7, title: "Effects of Noise Pollution", tag: "Noise", icon: Volume2, facts: "Prolonged exposure above 85 decibels can damage hearing.", tip: "Use noise-cancelling measures near busy roads at home." },
  { id: 8, title: "Protecting Local Water Bodies", tag: "Water", icon: Waves, facts: "Untreated sewage is a leading cause of river contamination.", tip: "Report any pipe discharging directly into a water body." },
  { id: 9, title: "Sustainable Transportation", tag: "Air", icon: Car, facts: "Shifting short trips to cycling can cut local emissions notably.", tip: "Combine errands into a single trip to cut unnecessary driving." },
  { id: 10, title: "The Role of Citizens in Pollution Control", tag: "Community", icon: ShieldCheck, facts: "Civic participation is a core pillar of environmental governance.", tip: "Encourage neighbours to use the grievance portal too." },
];
const QUIZ = [
  { q: "Which type of waste should generally be separated from recyclable dry waste?", options: ["Wet/organic waste", "Cardboard", "Glass bottles", "Metal cans"], a: 0, ex: "Wet or organic waste decomposes and contaminates recyclables, so it is collected separately." },
  { q: "What does AQI stand for?", options: ["Air Quality Index", "Annual Quality Inspection", "Atmospheric Quantity Indicator", "Air Quota Index"], a: 0, ex: "AQI (Air Quality Index) is a standard scale used to report how polluted the air currently is." },
  { q: "Which of these is a major cause of water pollution?", options: ["Recycling paper", "Untreated industrial effluent", "Walking to work", "Composting food waste"], a: 1, ex: "Untreated effluent discharged into rivers and lakes is a leading cause of water contamination." },
  { q: "What is the safest way to dispose of household chemicals?", options: ["Pour down the drain", "Through designated hazardous waste collection", "Bury in the garden", "Mix with regular garbage"], a: 1, ex: "Hazardous household chemicals need designated collection so they don't contaminate soil or water." },
  { q: "Which action helps reduce noise pollution in a neighbourhood?", options: ["Idling vehicles longer", "Following restrictions on loudspeaker use", "Using more machinery at night", "Ignoring local by-laws"], a: 1, ex: "Respecting local restrictions on loudspeakers and quiet hours directly reduces community noise levels." },
  { q: "Why is citizen reporting important for pollution control?", options: ["It has no real effect", "It helps municipal bodies detect and act on issues faster", "It replaces the need for regulation", "It is only useful for large factories"], a: 1, ex: "Citizen reports give municipal bodies real-time, localised information they would otherwise miss." },
];
const STAT_INDICATORS = [
  { label: "Air Quality Index (Nashik, sample)", value: 96, max: 300, unit: "" },
  { label: "Water Quality Indicator", value: 72, max: 100, unit: "%" },
  { label: "Waste Recycled vs Generated", value: 58, max: 100, unit: "%" },
  { label: "Green Cover", value: 34, max: 100, unit: "%" },
];

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                   */
/* ---------------------------------------------------------------------- */
function Badge({ status }) {
  const map = {
    "Submitted": { bg: "#EEF1EC", fg: T.faint, icon: FileText },
    "Under Review": { bg: "#FBEEE2", fg: T.clay, icon: Search },
    "Assigned": { bg: "#E7EEF3", fg: T.sky, icon: Users },
    "In Progress": { bg: "#E7EEF3", fg: T.sky, icon: Clock },
    "Resolved": { bg: "#E5EEE7", fg: T.forest, icon: CheckCircle2 },
    "Closed": { bg: "#1F5C46", fg: "#fff", icon: ShieldCheck },
  };
  const s = map[status] || map["Submitted"];
  const Icon = s.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.fg, padding: "4px 10px", borderRadius: 20, fontSize: 12.5, fontWeight: 600, fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>
      <Icon size={13} /> {status}
    </span>
  );
}
function PriorityDot({ p }) {
  const c = p === "High" ? T.clay : p === "Medium" ? "#B08D2E" : T.moss;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: c, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "inline-block" }} /> {p} priority
    </span>
  );
}
function Card({ children, style, ...rest }) {
  return <div style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, ...style }} {...rest}>{children}</div>;
}
function TimelineRiver({ timeline }) {
  return (
    <div style={{ position: "relative", paddingLeft: 28 }}>
      <div style={{ position: "absolute", left: 8, top: 6, bottom: 6, width: 3, borderRadius: 3, background: `linear-gradient(${T.forest}, ${T.sky})` }} />
      {timeline.map((t, i) => (
        <div key={i} style={{ position: "relative", paddingBottom: i === timeline.length - 1 ? 0 : 22 }}>
          <div style={{ position: "absolute", left: -28 + 4, top: 2, width: 13, height: 13, borderRadius: "50%", background: i === timeline.length - 1 ? T.forest : "#fff", border: `3px solid ${T.forest}` }} />
          <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, color: T.ink }}>{t.status}</div>
          <div style={{ fontSize: 12.5, color: T.faint, margin: "2px 0 4px" }}>{fmt(t.date)} · {t.department}</div>
          <div style={{ fontSize: 13.5, color: "#3C4A42" }}>{t.note}</div>
        </div>
      ))}
    </div>
  );
}
function EmptyState({ icon: Icon, title, body }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: T.faint }}>
      <Icon size={34} color={T.line} />
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: T.ink, margin: "14px 0 6px" }}>{title}</div>
      <div style={{ fontSize: 13.5, maxWidth: 340, margin: "0 auto" }}>{body}</div>
    </div>
  );
}
const btnPrimary = { display: "inline-flex", alignItems: "center", gap: 8, background: T.forest, color: "#fff", border: "none", padding: "13px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: FONT_BODY };
const btnGhost = { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: T.ink, border: `1.5px solid ${T.line}`, padding: "13px 22px", borderRadius: 10, fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: FONT_BODY };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 9, border: `1.5px solid ${T.line}`, fontSize: 14, fontFamily: FONT_BODY, background: "#fff", color: T.ink, outline: "none" };

/* ---------------------------------------------------------------------- */
/* Landing                                                                 */
/* ---------------------------------------------------------------------- */
function Gauge({ value = 96, max = 300 }) {
  const pct = Math.min(value / max, 1);
  const r = 70, c = 2 * Math.PI * r;
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r={r} fill="none" stroke="#E4E9E0" strokeWidth="16" />
      <circle cx="100" cy="100" r={r} fill="none" stroke={T.forest} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`} transform="rotate(-90 100 100)" />
      <text x="100" y="96" textAnchor="middle" fontSize="34" fontWeight="700" fill={T.ink} fontFamily={FONT_DISPLAY}>{value}</text>
      <text x="100" y="120" textAnchor="middle" fontSize="12" fill={T.faint} fontFamily={FONT_BODY}>AQI · sample</text>
    </svg>
  );
}
function Landing({ onEnter }) {
  const steps = [
    { n: "Report", d: "Citizen reports a local pollution issue with location and evidence.", icon: FileText },
    { n: "Review", d: "Municipal officials review and assign the complaint to a department.", icon: Search },
    { n: "Action", d: "The responsible department carries out an on-ground inspection and fix.", icon: ClipboardList },
    { n: "Resolve", d: "The citizen is notified at every step and can track resolution.", icon: CheckCircle2 },
  ];
  return (
    <div>
      <section style={{ padding: "72px 24px 56px", maxWidth: 1180, margin: "0 auto", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 460px", minWidth: 300 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#E5EEE7", color: T.forest, padding: "6px 14px", borderRadius: 20, fontSize: 12.5, fontWeight: 700 }}>
            <Leaf size={14} /> Nashik Municipal Corporation
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.06, color: T.ink, margin: "20px 0 18px", fontWeight: 700 }}>
            Report pollution.<br />Protect your community.
          </h1>
          <p style={{ fontSize: 17, color: "#41504A", maxWidth: 480, lineHeight: 1.6, marginBottom: 30 }}>
            Report local pollution issues, track municipal action, and learn how you can contribute to a cleaner and healthier environment.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button onClick={() => onEnter("citizen", "report")} style={btnPrimary}>Raise a Complaint <ArrowRight size={16} /></button>
            <button onClick={() => onEnter("citizen", "awareness")} style={btnGhost}>Explore Awareness</button>
          </div>
        </div>
        <div style={{ flex: "0 0 auto", margin: "0 auto" }}>
          <Card style={{ padding: 28, textAlign: "center", boxShadow: "0 24px 48px -24px rgba(21,62,48,0.28)" }}>
            <Gauge />
            <div style={{ marginTop: 6, fontSize: 13, color: T.faint }}>Live indicators are demo data pending API integration.</div>
          </Card>
        </div>
      </section>
      <section style={{ background: T.paper, padding: "56px 24px", borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: T.ink, marginBottom: 8 }}>How it works</h2>
          <p style={{ color: T.faint, marginBottom: 32 }}>From report to resolution, in four steps.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 20 }}>
            {steps.map((s) => (
              <Card key={s.n} style={{ padding: 22 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#E5EEE7", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <s.icon size={19} color={T.forest} />
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: T.ink, marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontSize: 13.5, color: "#41504A", lineHeight: 1.5 }}>{s.d}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: "56px 24px", maxWidth: 1180, margin: "0 auto" }}>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: T.ink, marginBottom: 28 }}>Choose how you'd like to enter</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 20 }}>
          <Card style={{ padding: 28, cursor: "pointer" }} onClick={() => onEnter("citizen", "dashboard")}>
            <User size={22} color={T.forest} />
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, margin: "14px 0 8px" }}>Citizen Portal</h3>
            <p style={{ fontSize: 13.5, color: T.faint, marginBottom: 16 }}>Report issues, track complaints, and browse the awareness library.</p>
            <span style={{ color: T.forest, fontWeight: 700, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6 }}>Enter as citizen <ArrowRight size={14} /></span>
          </Card>
          <Card style={{ padding: 28, cursor: "pointer" }} onClick={() => onEnter("official", "dashboard")}>
            <Building2 size={22} color={T.sky} />
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, margin: "14px 0 8px" }}>Municipal Corporation Portal</h3>
            <p style={{ fontSize: 13.5, color: T.faint, marginBottom: 16 }}>Review grievances, assign departments, and monitor analytics.</p>
            <span style={{ color: T.sky, fontWeight: 700, fontSize: 13.5, display: "inline-flex", alignItems: "center", gap: 6 }}>Enter as official <ArrowRight size={14} /></span>
          </Card>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Auth — now wired to real Supabase sign-up / login                      */
/* ---------------------------------------------------------------------- */
function AuthField({ label, icon: Icon, error, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: T.ink, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {Icon && <Icon size={15} color={T.faint} style={{ position: "absolute", left: 12, top: 13 }} />}
        {children}
      </div>
      {error && <div style={{ color: T.clay, fontSize: 12, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}><CircleAlert size={12} />{error}</div>}
    </div>
  );
}

function AuthForm({ role, onAuthenticated, onBack }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", area: "",
    employeeId: "", designation: DESIGNATIONS[0], department: DEPARTMENTS[0], wards: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);
  const isCitizen = role === "citizen";
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function validate() {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Please enter your full name.";
    if (!form.email.trim()) e.email = "Please enter an email address.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email address.";
    if (!form.phone.trim()) e.phone = "Please enter a phone number.";
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Please enter a 10-digit phone number.";
    if (!form.password || form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (mode === "signup" && !isCitizen && !form.employeeId.trim()) e.employeeId = "Please enter your employee ID.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setServerError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password });
      if (error) { setServerError(error.message); setBusy(false); return; }
      const userId = data.user?.id;
      if (!userId) { setServerError("Could not create account — try logging in instead."); setBusy(false); return; }

      const profileRow = {
        id: userId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role,
        area: isCitizen ? form.area.trim() : null,
        employee_id: isCitizen ? null : form.employeeId.trim(),
        designation: isCitizen ? null : form.designation,
        department: isCitizen ? null : form.department,
        wards: isCitizen ? null : form.wards.trim(),
      };
      const { error: profileError } = await supabase.from("profiles").insert(profileRow);
      setBusy(false);
      if (profileError) { setServerError(profileError.message); return; }
      setSuccess(profileRow);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
      if (error) { setServerError(error.message); setBusy(false); return; }
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles").select("*").eq("id", data.user.id).single();
      setBusy(false);
      if (profileError) { setServerError("Signed in, but couldn't load your profile."); return; }
      setSuccess(profileRow);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ width: "100%", maxWidth: 420, padding: 36, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E5EEE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <CheckCircle2 size={28} color={T.forest} />
          </div>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 21, margin: "0 0 8px" }}>
            {mode === "signup" ? "Registration successful" : "Logged in successfully"}
          </h3>
          <p style={{ color: T.faint, fontSize: 13.5, marginBottom: 24 }}>
            Welcome{success.name ? `, ${success.name.split(" ")[0]}` : ""} — taking you to your {isCitizen ? "citizen" : "municipal"} dashboard.
          </p>
          <button style={{ ...btnPrimary, width: "100%", justifyContent: "center" }} onClick={() => onAuthenticated(success)}>
            Continue <ArrowRight size={15} />
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Card style={{ width: "100%", maxWidth: 440, padding: 32 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, fontSize: 12.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, padding: 0, marginBottom: 18 }}>
          <ArrowRight size={13} style={{ transform: "rotate(180deg)" }} /> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: isCitizen ? "#E5EEE7" : "#E7EEF3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isCitizen ? <User size={16} color={T.forest} /> : <Building2 size={16} color={T.sky} />}
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, margin: 0 }}>{isCitizen ? "Citizen Portal" : "Municipal Corporation Portal"}</h2>
        </div>
        <p style={{ fontSize: 13, color: T.faint, marginBottom: 20 }}>
          {isCitizen ? "Sign up or log in to report issues and track complaints." : "Officials sign in with their municipal credentials."}
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 22, background: T.paper, padding: 4, borderRadius: 10 }}>
          {["signup", "login"].map((m) => (
            <button key={m} onClick={() => { setMode(m); setServerError(""); }} style={{
              flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: mode === m ? "#fff" : "transparent", color: mode === m ? T.ink : T.faint, boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{m === "signup" ? "Create account" : "Log in"}</button>
          ))}
        </div>

        {serverError && (
          <div style={{ background: "#FBEEE2", color: T.clay, fontSize: 12.5, fontWeight: 600, padding: "10px 14px", borderRadius: 9, marginBottom: 16 }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <AuthField label="Full name" icon={User} error={errors.name}>
              <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.name} onChange={set("name")} placeholder="e.g. Asha Patil" />
            </AuthField>
          )}
          <AuthField label={isCitizen ? "Email address" : "Official email address"} icon={Mail} error={errors.email}>
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </AuthField>
          <AuthField label="Phone number" icon={Phone} error={errors.phone}>
            <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.phone} onChange={set("phone")} placeholder="10-digit mobile number" />
          </AuthField>
          <AuthField label="Password" icon={Lock} error={errors.password}>
            <input type="password" style={{ ...inputStyle, paddingLeft: 34 }} value={form.password} onChange={set("password")} placeholder="At least 6 characters" />
          </AuthField>

          {mode === "signup" && isCitizen && (
            <AuthField label="Area / Ward (optional)" icon={MapPin}>
              <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.area} onChange={set("area")} placeholder="e.g. Panchavati, Ward 9" />
            </AuthField>
          )}
          {mode === "signup" && !isCitizen && (
            <>
              <AuthField label="Employee ID" icon={Briefcase} error={errors.employeeId}>
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.employeeId} onChange={set("employeeId")} placeholder="e.g. NMC-4471" />
              </AuthField>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <AuthField label="Designation">
                    <select style={{ ...inputStyle, paddingLeft: 13 }} value={form.designation} onChange={set("designation")}>
                      {DESIGNATIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </AuthField>
                </div>
                <div style={{ flex: 1 }}>
                  <AuthField label="Department">
                    <select style={{ ...inputStyle, paddingLeft: 13 }} value={form.department} onChange={set("department")}>
                      {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </AuthField>
                </div>
              </div>
              <AuthField label="Ward(s) / Zone you handle (optional)" icon={MapPin}>
                <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.wards} onChange={set("wards")} placeholder="e.g. Wards 5-9, East Zone" />
              </AuthField>
            </>
          )}

          <button type="submit" disabled={busy} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: 6, opacity: busy ? 0.7 : 1 }}>
            {busy ? <Loader2 size={15} className="spin" /> : null}
            {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
            {!busy && <ArrowRight size={15} />}
          </button>
        </form>
        <p style={{ fontSize: 11.5, color: T.faint, marginTop: 16, textAlign: "center" }}>
          Your details are stored securely in the project's database.
        </p>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Citizen: Report form — now uploads evidence and inserts a real row     */
/* ---------------------------------------------------------------------- */
function ReportForm({ onSubmit, userId }) {
  const [form, setForm] = useState({ title: "", category: "", description: "", location: "", priority: "Medium" });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmedId, setConfirmedId] = useState(null);

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Please enter a complaint title.";
    if (!form.category) e.category = "Please select a pollution category.";
    if (!form.description.trim() || form.description.trim().length < 10) e.description = "Please add a few more details (at least 10 characters).";
    if (!form.location.trim()) e.location = "Please enter a location.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    setServerError("");
    const result = await onSubmit(form, file);
    setBusy(false);
    if (result.error) { setServerError(result.error); return; }
    setConfirmedId(result.code);
    setForm({ title: "", category: "", description: "", location: "", priority: "Medium" });
    setFile(null);
  }

  if (confirmedId) {
    return (
      <Card style={{ padding: 40, textAlign: "center", maxWidth: 520, margin: "40px auto" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E5EEE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <CheckCircle2 size={28} color={T.forest} />
        </div>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 21, margin: "0 0 8px" }}>Complaint submitted successfully</h3>
        <p style={{ color: T.faint, marginBottom: 18 }}>It's now saved and visible to municipal officials.</p>
        <div style={{ background: T.paper, borderRadius: 10, padding: "12px 18px", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, color: T.forest, display: "inline-block" }}>
          Complaint ID: {confirmedId}
        </div>
        <div style={{ marginTop: 24 }}>
          <button style={btnPrimary} onClick={() => setConfirmedId(null)}>Report another issue</button>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: T.ink, marginBottom: 4 }}>Raise a complaint</h2>
      <p style={{ color: T.faint, marginBottom: 24, fontSize: 14 }}>Tell us what's happening and where — the more detail, the faster we can act.</p>
      {serverError && (
        <div style={{ background: "#FBEEE2", color: T.clay, fontSize: 12.5, fontWeight: 600, padding: "10px 14px", borderRadius: 9, marginBottom: 16 }}>{serverError}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Complaint title</label>
          <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Garbage dumping near riverside park" />
          {errors.title && <div style={{ color: T.clay, fontSize: 12.5, marginTop: 5 }}>{errors.title}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Pollution category</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button type="button" key={c.id} onClick={() => setForm({ ...form, category: c.id })}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 10px", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${form.category === c.id ? T.forest : T.line}`, background: form.category === c.id ? "#E5EEE7" : "#fff", color: form.category === c.id ? T.forest : T.ink }}>
                <c.icon size={14} /> {c.label}
              </button>
            ))}
          </div>
          {errors.category && <div style={{ color: T.clay, fontSize: 12.5, marginTop: 5 }}>{errors.category}</div>}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Detailed description</label>
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what you observed, how often, and any impact on residents..." />
          {errors.description && <div style={{ color: T.clay, fontSize: 12.5, marginTop: 5 }}>{errors.description}</div>}
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px", marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Location</label>
            <div style={{ position: "relative" }}>
              <MapPin size={15} color={T.faint} style={{ position: "absolute", left: 12, top: 13 }} />
              <input style={{ ...inputStyle, paddingLeft: 34 }} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Street, landmark, or ward" />
            </div>
            {errors.location && <div style={{ color: T.clay, fontSize: 12.5, marginTop: 5 }}>{errors.location}</div>}
          </div>
          <div style={{ flex: "1 1 160px", marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Priority / severity</label>
            <select style={inputStyle} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Evidence (optional)</label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px dashed ${T.line}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer", fontSize: 13.5, color: T.faint }}>
            <Upload size={16} />
            {file ? file.name : "Attach a photo or video of the issue"}
            <input type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </div>

        <button type="submit" disabled={busy} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: 8, padding: "14px 22px", opacity: busy ? 0.7 : 1 }}>
          {busy ? "Submitting..." : <>Submit Complaint <Send size={16} /></>}
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Citizen: My complaints / Notifications (presentational, real data)      */
/* ---------------------------------------------------------------------- */
function MyComplaints({ complaints }) {
  const [openId, setOpenId] = useState(complaints[0]?.id || null);
  if (!complaints.length) return <EmptyState icon={FileText} title="No complaints yet" body="Complaints you raise will appear here, with live status tracking." />;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: T.ink, marginBottom: 20 }}>My complaints</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {complaints.map((c) => {
          const meta = catMeta(c.category);
          const open = openId === c.id;
          return (
            <Card key={c.id} style={{ overflow: "hidden" }}>
              <div onClick={() => setOpenId(open ? null : c.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, cursor: "pointer" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: T.paper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <meta.icon size={18} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: T.ink, marginBottom: 3 }}>{c.title}</div>
                  <div style={{ fontSize: 12.5, color: T.faint, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>{c.code}</span><span>·</span><span>{fmt(c.createdAt)}</span><span>·</span><span>{c.location}</span>
                  </div>
                </div>
                <Badge status={c.status} />
                <ChevronDown size={18} color={T.faint} style={{ transform: open ? "rotate(180deg)" : "none" }} />
              </div>
              {open && (
                <div style={{ padding: "0 18px 22px", borderTop: `1px solid ${T.line}`, paddingTop: 18 }}>
                  <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 18, fontSize: 13 }}>
                    <PriorityDot p={c.priority} />
                    <span style={{ color: T.faint }}>Department: <b style={{ color: T.ink }}>{c.department}</b></span>
                    {c.evidenceUrl && <a href={c.evidenceUrl} target="_blank" rel="noreferrer" style={{ color: T.sky, fontWeight: 700 }}>View evidence</a>}
                  </div>
                  <p style={{ fontSize: 13.5, color: "#41504A", marginBottom: 20 }}>{c.description}</p>
                  <TimelineRiver timeline={c.timeline} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
function Notifications({ notifications, onRead }) {
  if (!notifications.length) return <EmptyState icon={Bell} title="No notifications yet" body="You'll see updates here whenever officials act on your complaints." />;
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: T.ink, marginBottom: 20 }}>Notifications</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.map((n) => (
          <Card key={n.id} onClick={() => onRead(n.id)} style={{ padding: 16, cursor: "pointer", background: n.read ? "#fff" : "#F4F8F3", display: "flex", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "transparent" : T.forest, marginTop: 6, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: T.ink, marginBottom: 3 }}>Complaint updated</div>
              <div style={{ fontSize: 13, color: "#41504A", marginBottom: 5 }}>{n.message}</div>
              <div style={{ fontSize: 11.5, color: T.faint }}>{fmt(n.date)} · {fmtTime(n.date)}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Awareness hub (unchanged, static content)                               */
/* ---------------------------------------------------------------------- */
function AwarenessHub() {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid }, { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "help", label: "How Can You Help?", icon: Sprout }, { id: "articles", label: "Articles", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: Award },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: T.ink, marginBottom: 4 }}>Pollution Awareness</h2>
      <p style={{ color: T.faint, marginBottom: 22, fontSize: 14 }}>Learn about pollution and how you can help keep your city clean.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 26, flexWrap: "wrap", borderBottom: `1px solid ${T.line}`, paddingBottom: 4 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
            background: tab === t.id ? T.forest : "transparent", color: tab === t.id ? "#fff" : T.faint }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      {tab === "overview" && <PollutionOverview />}
      {tab === "stats" && <StatsSection />}
      {tab === "help" && <HowCanYouHelp />}
      {tab === "articles" && <ArticleLibrary />}
      {tab === "quiz" && <Quiz />}
    </div>
  );
}
function PollutionOverview() {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 16 }}>
      {POLLUTION_INFO.map((p) => {
        const isOpen = open === p.id;
        return (
          <Card key={p.id} style={{ padding: 20, cursor: "pointer" }} onClick={() => setOpen(isOpen ? null : p.id)}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: T.paper, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <p.icon size={18} color={T.forest} />
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15.5, marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 13, color: T.faint, lineHeight: 1.5 }}>{p.blurb}</div>
            {isOpen && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line}`, fontSize: 12.5, color: "#41504A", display: "flex", flexDirection: "column", gap: 8 }}>
                <div><b style={{ color: T.ink }}>Causes:</b> {p.causes}</div>
                <div><b style={{ color: T.ink }}>Impact:</b> {p.impact}</div>
                <div><b style={{ color: T.ink }}>Prevention:</b> {p.prevent}</div>
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: T.forest, display: "flex", alignItems: "center", gap: 4 }}>
              {isOpen ? "Show less" : "Learn more"} <ChevronDown size={13} style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
function StatsSection() {
  return (
    <div>
      <div style={{ background: "#FBEEE2", color: T.clay, fontSize: 12.5, fontWeight: 600, padding: "9px 14px", borderRadius: 9, marginBottom: 18, display: "inline-block" }}>
        Sample / demo data — not connected to a live environmental sensor feed.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 16 }}>
        {STAT_INDICATORS.map((s) => {
          const pct = Math.round((s.value / s.max) * 100);
          return (
            <Card key={s.label} style={{ padding: 20 }}>
              <div style={{ fontSize: 12.5, color: T.faint, marginBottom: 10, minHeight: 32 }}>{s.label}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, color: T.ink, marginBottom: 10 }}>{s.value}{s.unit}</div>
              <div style={{ height: 8, borderRadius: 6, background: T.paper, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: T.forest, borderRadius: 6 }} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
function HowCanYouHelp() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px,1fr))", gap: 16 }}>
      {HOW_TO_HELP.map((h) => (
        <Card key={h.id} style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#E5EEE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <h.icon size={16} color={T.forest} />
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15 }}>{h.title}</div>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
            {h.tips.map((t) => <li key={t} style={{ fontSize: 13, color: "#41504A" }}>{t}</li>)}
          </ul>
        </Card>
      ))}
    </div>
  );
}
function ArticleLibrary() {
  const [openId, setOpenId] = useState(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))", gap: 16 }}>
      {ARTICLES.map((a) => {
        const open = openId === a.id;
        return (
          <Card key={a.id} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: T.paper, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <a.icon size={16} color={T.sky} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.sky, background: "#E7EEF3", padding: "3px 8px", borderRadius: 20 }}>{a.tag}</span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 14.5, marginBottom: 8, lineHeight: 1.3 }}>{a.title}</div>
            {open && (
              <div style={{ fontSize: 12.5, color: "#41504A", display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                <div><b style={{ color: T.ink }}>Key fact:</b> {a.facts}</div>
                <div><b style={{ color: T.ink }}>Tip:</b> {a.tip}</div>
              </div>
            )}
            <button onClick={() => setOpenId(open ? null : a.id)} style={{ background: "none", border: "none", color: T.forest, fontWeight: 700, fontSize: 12.5, cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
              {open ? "Show less" : "Learn More"} <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none" }} />
            </button>
          </Card>
        );
      })}
    </div>
  );
}
function Quiz() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  function choose(i) { if (selected !== null) return; setSelected(i); if (i === QUIZ[step].a) setScore((s) => s + 1); }
  function next() { if (step === QUIZ.length - 1) { setDone(true); return; } setStep((s) => s + 1); setSelected(null); }
  function restart() { setStep(0); setSelected(null); setScore(0); setDone(false); }
  if (done) {
    return (
      <Card style={{ padding: 40, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <Award size={32} color={T.forest} />
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 21, margin: "14px 0 6px" }}>Quiz complete</h3>
        <p style={{ color: T.faint, marginBottom: 16 }}>You scored</p>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 700, color: T.forest, marginBottom: 20 }}>{score} / {QUIZ.length}</div>
        <button style={btnPrimary} onClick={restart}>Try again</button>
      </Card>
    );
  }
  const q = QUIZ[step];
  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: T.faint, marginBottom: 8 }}>
        <span>Question {step + 1} of {QUIZ.length}</span><span>Score: {score}</span>
      </div>
      <div style={{ height: 6, borderRadius: 6, background: T.paper, marginBottom: 22, overflow: "hidden" }}>
        <div style={{ width: `${(step / QUIZ.length) * 100}%`, height: "100%", background: T.forest }} />
      </div>
      <Card style={{ padding: 24 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 17, marginBottom: 18, lineHeight: 1.4 }}>{q.q}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {q.options.map((o, i) => {
            let bg = "#fff", border = T.line, color = T.ink;
            if (selected !== null) {
              if (i === q.a) { bg = "#E5EEE7"; border = T.forest; color = T.forest; }
              else if (i === selected) { bg = "#FBEEE2"; border = T.clay; color = T.clay; }
            }
            return (
              <button key={i} onClick={() => choose(i)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: 9, border: `1.5px solid ${border}`, background: bg, color, cursor: selected === null ? "pointer" : "default", fontSize: 13.5, fontWeight: 600 }}>
                {o}
              </button>
            );
          })}
        </div>
        {selected !== null && <div style={{ marginTop: 16, padding: 14, background: T.paper, borderRadius: 9, fontSize: 13, color: "#41504A" }}>{q.ex}</div>}
        {selected !== null && (
          <button style={{ ...btnPrimary, marginTop: 16, width: "100%", justifyContent: "center" }} onClick={next}>
            {step === QUIZ.length - 1 ? "See score" : "Next question"}
          </button>
        )}
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Municipal dashboard (unchanged, real data)                              */
/* ---------------------------------------------------------------------- */
const PIE_COLORS = [T.faint, T.clay, T.sky, T.sky, T.forest, T.forestDark];
function MunicipalDashboard({ complaints }) {
  const total = complaints.length;
  const counts = useMemo(() => { const c = {}; STATUS_FLOW.forEach((s) => (c[s] = 0)); complaints.forEach((x) => c[x.status]++); return c; }, [complaints]);
  const highPriority = complaints.filter((c) => c.priority === "High").length;
  const categoryData = useMemo(() => CATEGORIES.filter((c) => c.id !== "other").map((c) => ({
    name: c.label.replace(" Pollution", "").replace(" & Garbage", ""),
    count: complaints.filter((x) => x.category === c.id).length,
  })), [complaints]);
  const pieData = STATUS_FLOW.map((s) => ({ name: s, value: counts[s] }));
  const trendData = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    complaints.forEach((c) => { const diff = Math.floor((Date.now() - c.createdAt.getTime()) / (7 * 86400000)); if (diff >= 0 && diff < 4) weeks[3 - diff]++; });
    return weeks.map((v, i) => ({ week: `Wk ${i + 1}`, complaints: v }));
  }, [complaints]);
  const cards = [
    { label: "Total Complaints", value: total, icon: FileText, color: T.ink },
    { label: "New (Submitted)", value: counts["Submitted"], icon: Bell, color: T.faint },
    { label: "Under Review", value: counts["Under Review"], icon: Search, color: T.clay },
    { label: "Assigned", value: counts["Assigned"], icon: Users, color: T.sky },
    { label: "In Progress", value: counts["In Progress"], icon: Clock, color: T.sky },
    { label: "Resolved", value: counts["Resolved"], icon: CheckCircle2, color: T.forest },
    { label: "Closed", value: counts["Closed"], icon: ShieldCheck, color: T.forestDark },
    { label: "High Priority", value: highPriority, icon: CircleAlert, color: T.clay },
  ];
  return (
    <div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: T.ink, marginBottom: 20 }}>Municipal Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 12, marginBottom: 28 }}>
        {cards.map((c) => (
          <Card key={c.label} style={{ padding: 16 }}>
            <c.icon size={16} color={c.color} />
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, color: T.ink, margin: "10px 0 2px" }}>{c.value}</div>
            <div style={{ fontSize: 11.5, color: T.faint }}>{c.label}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px,1fr))", gap: 18 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Complaints by category</div>
          <div style={{ fontSize: 12, color: T.faint, marginBottom: 14 }}>Distribution across pollution types</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={categoryData}>
              <CartesianGrid vertical={false} stroke={T.line} />
              <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: T.faint }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: T.faint }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.line}` }} />
              <Bar dataKey="count" fill={T.forest} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Status distribution</div>
          <div style={{ fontSize: 12, color: T.faint, marginBottom: 14 }}>Where complaints stand right now</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.line}` }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        <Card style={{ padding: 20, gridColumn: "1 / -1" }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Weekly complaint trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid vertical={false} stroke={T.line} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: T.faint }} />
              <YAxis tick={{ fontSize: 11, fill: T.faint }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.line}` }} />
              <Line type="monotone" dataKey="complaints" stroke={T.sky} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Municipal: Grievances — status changes now write to Supabase            */
/* ---------------------------------------------------------------------- */
function Grievances({ complaints, onUpdate }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || null);
  const [noteDraft, setNoteDraft] = useState("");
  const [deptDraft, setDeptDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = complaints.filter((c) => {
    const matchesQuery = (c.title + c.code + c.location).toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const selected = complaints.find((c) => c.id === selectedId) || filtered[0];

  async function advance() {
    if (!selected) return;
    const idx = STATUS_FLOW.indexOf(selected.status);
    if (idx >= STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[idx + 1];
    const dept = deptDraft || (selected.department !== "Unassigned" ? selected.department : DEPARTMENTS[0]);
    setBusy(true);
    await onUpdate(selected.id, nextStatus, dept, noteDraft);
    setBusy(false);
    setNoteDraft(""); setDeptDraft("");
  }

  return (
    <div>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: T.ink, marginBottom: 20 }}>All Grievances</h2>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 360px", minWidth: 300 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={14} color={T.faint} style={{ position: "absolute", left: 11, top: 11 }} />
              <input placeholder="Search by title, ID, or location" value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...inputStyle, paddingLeft: 32 }} />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 150 }}>
              <option>All</option>{STATUS_FLOW.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto", paddingRight: 4 }}>
            {filtered.length === 0 && <EmptyState icon={Search} title="No matches" body="Try a different search term or filter." />}
            {filtered.map((c) => {
              const meta = catMeta(c.category);
              const active = selected && c.id === selected.id;
              return (
                <Card key={c.id} onClick={() => setSelectedId(c.id)} style={{ padding: 14, cursor: "pointer", border: `1.5px solid ${active ? T.forest : T.line}`, background: active ? "#F4F8F3" : "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: T.faint, fontWeight: 600 }}>{c.code}</span>
                    <PriorityDot p={c.priority} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: T.ink, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: T.faint, marginBottom: 8 }}>
                    <meta.icon size={12} /> {meta.label} <span>·</span> <MapPin size={11} /> {c.location}
                  </div>
                  <Badge status={c.status} />
                </Card>
              );
            })}
          </div>
        </div>

        {selected && (
          <Card style={{ flex: "1 1 380px", minWidth: 320, padding: 24, position: "sticky", top: 90 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 11.5, color: T.faint, fontWeight: 700 }}>{selected.code}</div>
              <Badge status={selected.status} />
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{selected.title}</div>
            <div style={{ fontSize: 13, color: "#41504A", marginBottom: 16 }}>{selected.description}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: T.faint, marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 6 }}><MapPin size={13} /> {selected.location}</div>
              <div style={{ display: "flex", gap: 6 }}><Calendar size={13} /> Submitted {fmt(selected.createdAt)}</div>
              <div style={{ display: "flex", gap: 6 }}><Users size={13} /> {selected.department}</div>
              {selected.evidenceUrl && <a href={selected.evidenceUrl} target="_blank" rel="noreferrer" style={{ color: T.sky, fontWeight: 700 }}>View uploaded evidence</a>}
            </div>
            <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16, marginBottom: 18 }}>
              <TimelineRiver timeline={selected.timeline} />
            </div>
            {selected.status !== "Closed" && (
              <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                  Move to: <span style={{ color: T.forest }}>{STATUS_FLOW[STATUS_FLOW.indexOf(selected.status) + 1]}</span>
                </div>
                {STATUS_FLOW.indexOf(selected.status) === 1 && (
                  <select value={deptDraft} onChange={(e) => setDeptDraft(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }}>
                    <option value="">Assign department...</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
                <textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add an official update or response..." style={{ ...inputStyle, minHeight: 70, marginBottom: 10, resize: "vertical" }} />
                <button onClick={advance} disabled={busy} style={{ ...btnPrimary, width: "100%", justifyContent: "center", opacity: busy ? 0.7 : 1 }}>
                  {busy ? "Updating..." : <>Update status <ArrowRight size={15} /></>}
                </button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Nav                                                                     */
/* ---------------------------------------------------------------------- */
function TopNav({ role, profile, page, setPage, onSignOut, onHome, unread, notifPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const citizenLinks = [{ id: "dashboard", label: "Home" }, { id: "report", label: "Report Pollution" }, { id: "mycomplaints", label: "My Complaints" }, { id: "awareness", label: "Awareness" }];
  const municipalLinks = [{ id: "dashboard", label: "Dashboard" }, { id: "grievances", label: "All Grievances" }];
  const links = role === "citizen" ? citizenLinks : municipalLinks;
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(241,244,239,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${T.line}` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 62, gap: 20 }}>
        <div onClick={onHome} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: T.ink }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.forest, display: "flex", alignItems: "center", justifyContent: "center" }}><Leaf size={16} color="#fff" /></div>
          CleanCity
        </div>
        <div style={{ display: "flex", gap: 4, flex: 1 }} className="desktop-nav">
          {links.map((l) => (
            <button key={l.id} onClick={() => setPage(l.id)} style={{ background: page === l.id ? "#fff" : "transparent", border: page === l.id ? `1px solid ${T.line}` : "1px solid transparent", color: page === l.id ? T.forest : "#3C4A42", fontWeight: 600, fontSize: 13.5, padding: "8px 13px", borderRadius: 8, cursor: "pointer" }}>{l.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="desktop-nav">
          {role === "citizen" && (
            <button onClick={notifPage} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              <Bell size={19} color={T.ink} />
              {unread > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 15, height: 15, borderRadius: "50%", background: T.clay, color: "#fff", fontSize: 9.5, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unread}</span>}
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, color: T.faint, background: "#fff", border: `1px solid ${T.line}`, padding: "6px 10px", borderRadius: 20 }}>
            {role === "citizen" ? <User size={13} /> : <Building2 size={13} />} {profile?.name || (role === "citizen" ? "Citizen" : "Official")}
          </div>
          <button onClick={onSignOut} title="Sign out" style={{ background: "none", border: `1px solid ${T.line}`, borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}><LogOut size={15} color={T.faint} /></button>
        </div>
        <button className="mobile-nav-toggle" onClick={() => setMobileOpen((o) => !o)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", display: "none" }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="mobile-nav-panel" style={{ borderTop: `1px solid ${T.line}`, padding: 14, display: "flex", flexDirection: "column", gap: 6, background: "#fff" }}>
          {links.map((l) => <button key={l.id} onClick={() => { setPage(l.id); setMobileOpen(false); }} style={{ textAlign: "left", background: page === l.id ? T.paper : "transparent", border: "none", padding: "10px 12px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>{l.label}</button>)}
          {role === "citizen" && <button onClick={() => { notifPage(); setMobileOpen(false); }} style={{ textAlign: "left", background: "transparent", border: "none", padding: "10px 12px", borderRadius: 8, fontWeight: 600, fontSize: 14 }}>Notifications {unread > 0 && `(${unread})`}</button>}
          <button onClick={onSignOut} style={{ textAlign: "left", background: "transparent", border: "none", padding: "10px 12px", borderRadius: 8, fontWeight: 600, fontSize: 14, color: T.faint }}>Sign out</button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Root App — owns the Supabase session, profile, and all data fetching   */
/* ---------------------------------------------------------------------- */
function shapeComplaint(row) {
  const timeline = (row.complaint_timeline || [])
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((t) => ({ status: t.status, date: new Date(t.created_at), note: t.note, department: t.department }));
  return {
    id: row.id, code: row.complaint_code, title: row.title, category: row.category,
    description: row.description, location: row.location, priority: row.priority,
    status: row.status, department: row.department, evidenceUrl: row.evidence_url,
    createdAt: new Date(row.created_at), userId: row.user_id, timeline,
  };
}

export default function App() {
  const [authFlow, setAuthFlow] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Restore session on load, and react to sign-out elsewhere
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Once we have a session, load the profile
  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => {
      setProfile(data || null);
      setLoading(false);
    });
  }, [session]);

  const role = profile?.role || null;

  async function fetchComplaints() {
    if (!profile) return;
    let query = supabase.from("complaints").select("*, complaint_timeline(*)").order("created_at", { ascending: false });
    if (role === "citizen") query = query.eq("user_id", profile.id);
    const { data } = await query;
    setComplaints((data || []).map(shapeComplaint));
  }
  async function fetchNotifications() {
    if (!profile) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });
    setNotifications((data || []).map((n) => ({ id: n.id, message: n.message, read: n.read, date: new Date(n.created_at) })));
  }
  useEffect(() => { if (profile) { fetchComplaints(); fetchNotifications(); } }, [profile]);

  async function submitComplaint(form, file) {
    let evidenceUrl = null;
    if (file) {
      const path = `${profile.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("evidence").upload(path, file);
      if (uploadError) return { error: uploadError.message };
      const { data } = supabase.storage.from("evidence").getPublicUrl(path);
      evidenceUrl = data.publicUrl;
    }
    const { data: inserted, error } = await supabase.from("complaints").insert({
      user_id: profile.id, title: form.title, category: form.category, description: form.description,
      location: form.location, priority: form.priority, evidence_url: evidenceUrl,
    }).select().single();
    if (error) return { error: error.message };
    await supabase.from("complaint_timeline").insert({
      complaint_id: inserted.id, status: "Submitted", note: "Complaint received and logged into the system.", department: "Grievance Cell",
    });
    await fetchComplaints();
    return { code: inserted.complaint_code };
  }

  async function updateComplaint(complaintId, nextStatus, dept, note) {
    await supabase.from("complaints").update({ status: nextStatus, department: dept }).eq("id", complaintId);
    await supabase.from("complaint_timeline").insert({
      complaint_id: complaintId, status: nextStatus, department: dept, note: note?.trim() || `Status updated to ${nextStatus}.`,
    });
    const complaint = complaints.find((c) => c.id === complaintId);
    if (complaint) {
      await supabase.from("notifications").insert({
        user_id: complaint.userId, complaint_id: complaintId,
        message: `Your complaint has been moved to ${nextStatus}${dept && dept !== "Unassigned" ? ` · ${dept}` : ""}.`,
      });
    }
    await fetchComplaints();
  }

  async function markRead(notificationId) {
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
    setNotifications((ns) => ns.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null); setProfile(null); setAuthFlow(null); setPage("dashboard");
  }

  const unread = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.paper }}>
        <Loader2 size={28} color={T.forest} className="spin" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT_BODY, background: T.paper, minHeight: "100vh", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; } button { font-family: inherit; } select, input, textarea { font-family: inherit; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 860px) { .desktop-nav { display: none !important; } .mobile-nav-toggle { display: block !important; } }
      `}</style>

      {!role && authFlow === null && <Landing onEnter={(r, p) => setAuthFlow({ role: r, targetPage: p })} />}
      {!role && authFlow !== null && (
        <AuthForm role={authFlow.role} onBack={() => setAuthFlow(null)} onAuthenticated={(prof) => { setProfile(prof); setPage(authFlow.targetPage); setAuthFlow(null); }} />
      )}
      {role && (
        <>
          <TopNav role={role} profile={profile} page={page} setPage={setPage} onSignOut={signOut} onHome={signOut} unread={unread} notifPage={() => setPage("notifications")} />
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
            {role === "citizen" && page === "dashboard" && <CitizenHome complaints={complaints} setPage={setPage} profile={profile} />}
            {role === "citizen" && page === "report" && <ReportForm onSubmit={submitComplaint} userId={profile.id} />}
            {role === "citizen" && page === "mycomplaints" && <MyComplaints complaints={complaints} />}
            {role === "citizen" && page === "awareness" && <AwarenessHub />}
            {role === "citizen" && page === "notifications" && <Notifications notifications={notifications} onRead={markRead} />}
            {role === "official" && page === "dashboard" && <MunicipalDashboard complaints={complaints} />}
            {role === "official" && page === "grievances" && <Grievances complaints={complaints} onUpdate={updateComplaint} />}
          </div>
        </>
      )}
    </div>
  );
}

function CitizenHome({ complaints, setPage, profile }) {
  const active = complaints.filter((c) => c.status !== "Closed").length;
  const resolved = complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length;
  const firstName = profile?.name ? profile.name.split(" ")[0] : null;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, margin: 0 }}>{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</h2>
          <p style={{ color: T.faint, margin: "4px 0 0", fontSize: 14 }}>Here's what's happening with your reports.</p>
        </div>
        <button style={btnPrimary} onClick={() => setPage("report")}>Raise a Complaint <ArrowRight size={15} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 14, marginBottom: 32 }}>
        <Card style={{ padding: 18 }}><FileText size={16} color={T.forest} /><div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: "8px 0 2px" }}>{complaints.length}</div><div style={{ fontSize: 12, color: T.faint }}>Total complaints</div></Card>
        <Card style={{ padding: 18 }}><Clock size={16} color={T.sky} /><div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: "8px 0 2px" }}>{active}</div><div style={{ fontSize: 12, color: T.faint }}>Active</div></Card>
        <Card style={{ padding: 18 }}><CheckCircle2 size={16} color={T.forest} /><div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, margin: "8px 0 2px" }}>{resolved}</div><div style={{ fontSize: 12, color: T.faint }}>Resolved or closed</div></Card>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, margin: 0 }}>Recent complaints</h3>
        <button onClick={() => setPage("mycomplaints")} style={{ background: "none", border: "none", color: T.forest, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>View all <ChevronRight size={14} /></button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {complaints.slice(0, 4).map((c) => {
          const meta = catMeta(c.category);
          return (
            <Card key={c.id} style={{ padding: 15, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: T.paper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><meta.icon size={16} color={meta.color} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.title}</div>
                <div style={{ fontSize: 11.5, color: T.faint }}>{c.code} · {fmt(c.createdAt)}</div>
              </div>
              <Badge status={c.status} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
