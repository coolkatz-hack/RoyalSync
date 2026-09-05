import React, { useState } from "react";
import {
  Shield, FileText, Clock, CheckCircle2, AlertTriangle, Users, Search,
  ChevronRight, MapPin, Mic, FileCheck, Bell, LayoutGrid, BarChart3,
  ArrowLeft, ClipboardList, Download, Banknote, Gauge, StickyNote,
  FolderDown, Plus, CheckCheck, XCircle, Building2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

/* ---------------------------------------------------------------------- */
/* Santam design tokens                                                   */
/* ---------------------------------------------------------------------- */
const C = {
  navy: "#00205C",      // Santam blue
  navyDeep: "#001438",
  blue: "#0B4DA2",
  red: "#E2231A",        // Santam red accent
  redBg: "#FCE7E5",
  paper: "#F5F6F8",
  line: "#DDE1E8",
  ink: "#1B2430",
  slate: "#5C6675",
  green: "#1E7A4C",
  greenBg: "#E4F3EA",
  amber: "#946B1B",
  amberBg: "#FBF0DC",
};

/* ---------------------------------------------------------------------- */
/* Download helpers                                                        */
/* ---------------------------------------------------------------------- */
function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildClaimReport(claim) {
  const lines = [
    `SANTAM — CLAIM CASE FILE`,
    `================================`,
    ``,
    `Reference: ${claim.id}`,
    `Santam claim reference: ${claim.santamRef || "Not yet issued"}`,
    `Client: ${claim.client}`,
    `Broker: ${claim.broker}`,
    `Vehicle: ${claim.vehicle}`,
    `Date received: ${claim.dateReceived}`,
    `Status: ${claim.status}`,
    `Priority: ${claim.priority} — ${claim.priorityReason}`,
    `Assigned assessor: ${claim.assessor || "Unassigned"}`,
    ``,
    `--- POLICY & COVERAGE ---`,
    `Policy number: ${claim.policy.policyNumber}`,
    `Coverage type: ${claim.policy.coverageType}`,
    `Sum insured: ${claim.policy.sumInsured}`,
    `Excess: ${claim.policy.excess}`,
    `Premium status: ${claim.policy.premiumStatus}`,
    ``,
    `--- CLAIM FINANCIALS ---`,
    `Reserve set: ${claim.financials.reserve}`,
    `Estimated / final payout: ${claim.financials.estimatedPayout}`,
    ``,
    `--- RISK ---`,
    `Risk score: ${claim.riskScore}/100 (${riskLabel(claim.riskScore)})`,
    ``,
    `--- INCIDENT ---`,
    `Location: ${claim.location} (${claim.gps})`,
    `Police reference: ${claim.policeRef}`,
    `Witnesses: ${claim.witness}`,
    `Voice note: ${claim.hasVoiceNote ? "Attached" : "None submitted"}`,
    `Incident summary: ${claim.incidentSummary}`,
    ``,
    `--- DOCUMENTS ---`,
    ...claim.docs.map((d) => `- ${d.name}: ${d.received ? "Received" : "Outstanding"}`),
    ``,
    `--- INTERNAL NOTES ---`,
    ...(claim.notes.length ? claim.notes.map((n) => `[${n.ts}] ${n.author}: ${n.text}`) : ["No internal notes recorded."]),
    ``,
    `--- TIMELINE ---`,
    ...claim.timeline.map((t) => `[${t.ts}] ${t.actor}: ${t.action}`),
    ``,
    `Generated ${new Date().toISOString().slice(0, 16).replace("T", " ")} by Santam Claims Portal.`,
  ];
  return lines.join("\n");
}

function riskLabel(score) {
  if (score >= 50) return "High risk";
  if (score >= 20) return "Medium risk";
  return "Low risk";
}

function nowTs() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

/* ---------------------------------------------------------------------- */
/* Reference data                                                          */
/* ---------------------------------------------------------------------- */
const ASSESSORS = [
  { id: "a1", name: "N. Dlamini", dept: "Motor Claims", available: true },
  { id: "a2", name: "T. van Wyk", dept: "Motor Claims", available: true },
  { id: "a3", name: "K. Mahlangu", dept: "Complex Loss", available: false },
  { id: "a4", name: "R. Naidoo", dept: "Motor Claims", available: true },
];

const STATUS_ORDER = [
  "Received",
  "Under Review",
  "Waiting for Documents",
  "Assessor Assigned",
  "Approved",
  "Rejected",
  "Closed",
];

/* ---------------------------------------------------------------------- */
/* Sample claims (all Santam)                                             */
/* ---------------------------------------------------------------------- */
const initialClaims = () => ([
  {
    id: "STM-10452",
    santamRef: null,
    client: "Andile Mokoena",
    broker: "Beacon Brokers",
    vehicle: "2019 VW Polo — CA 123-456",
    location: "N1 North, Woodstock, Cape Town",
    gps: "-33.9284, 18.4514",
    dateReceived: "2026-09-04 08:12",
    policy: { policyNumber: "POL-88213-AM", coverageType: "Comprehensive", sumInsured: "R285,000", excess: "R7,500", premiumStatus: "Active" },
    financials: { reserve: "R65,000", estimatedPayout: "Pending assessment" },
    riskScore: 18,
    notes: [],
    priority: "High",
    priorityReason: "Severe front-end damage with a complete set of photo attachments.",
    status: "Received",
    assessor: null,
    docs: [
      { name: "Drivers licence", received: true },
      { name: "Police report (SAPS)", received: true },
      { name: "Vehicle photos (6)", received: true },
      { name: "Repair quotation", received: false },
    ],
    hasVoiceNote: true,
    witness: "1 witness statement on file",
    policeRef: "CAS 221/09/2026",
    incidentSummary: "Client was rear-ended while stationary at a robot, sustaining front bumper and headlight damage. No injuries reported. SAPS attended the scene.",
    timeline: [
      { action: "Claim package received from broker", actor: "System", ts: "2026-09-04 08:12" },
      { action: "Priority classified as High", actor: "Claims System", ts: "2026-09-04 08:13" },
    ],
  },
  {
    id: "STM-10453",
    santamRef: null,
    client: "Lerato Sithole",
    broker: "Beacon Brokers",
    vehicle: "2021 Toyota Fortuner — GP 789-321",
    location: "William Nicol Dr, Sandton",
    gps: "-26.0525, 28.0562",
    dateReceived: "2026-09-04 10:47",
    policy: { policyNumber: "POL-77410-LS", coverageType: "Comprehensive", sumInsured: "R410,000", excess: "R8,200", premiumStatus: "Active" },
    financials: { reserve: "R18,000", estimatedPayout: "Pending assessment" },
    riskScore: 12,
    notes: [],
    priority: "Medium",
    priorityReason: "Moderate side-panel damage, complete document set, no injuries reported.",
    status: "Waiting for Documents",
    assessor: null,
    docs: [
      { name: "Drivers licence", received: true },
      { name: "Police report (SAPS)", received: false },
      { name: "Vehicle photos (4)", received: true },
      { name: "Repair quotation", received: true },
    ],
    hasVoiceNote: false,
    witness: "No witnesses",
    policeRef: "Pending",
    incidentSummary: "Client's vehicle was side-swiped while changing lanes. Minor cosmetic damage to the rear passenger door. Client reports the other driver did not stop.",
    timeline: [
      { action: "Claim package received from broker", actor: "System", ts: "2026-09-04 10:47" },
      { action: "Priority classified as Medium", actor: "Claims System", ts: "2026-09-04 10:48" },
      { action: "Missing document flagged: Police report", actor: "Claims System", ts: "2026-09-04 10:49" },
    ],
  },
  {
    id: "STM-10454",
    santamRef: "STM-CLM-772014",
    client: "Johan Pretorius",
    broker: "Beacon Brokers",
    vehicle: "2018 Ford Ranger — WC 456-789",
    location: "R44, Stellenbosch",
    gps: "-33.9346, 18.8600",
    dateReceived: "2026-09-03 14:02",
    policy: { policyNumber: "POL-55621-JP", coverageType: "Comprehensive", sumInsured: "R220,000", excess: "R5,000", premiumStatus: "Active" },
    financials: { reserve: "R6,200", estimatedPayout: "R6,200" },
    riskScore: 6,
    notes: [{ text: "Repair quotation confirmed with panel beater — cost within reserve.", author: "N. Dlamini", ts: "2026-09-03 16:00" }],
    priority: "Low",
    priorityReason: "Minor parking-lot scrape, single attachment, low estimated repair cost.",
    status: "Approved",
    assessor: "N. Dlamini",
    docs: [
      { name: "Drivers licence", received: true },
      { name: "Police report (SAPS)", received: true },
      { name: "Vehicle photos (2)", received: true },
      { name: "Repair quotation", received: true },
    ],
    hasVoiceNote: false,
    witness: "No witnesses",
    policeRef: "CAS 044/09/2026",
    incidentSummary: "Minor scrape sustained to the rear bumper while reversing in a parking area. No third party involved. Client provided a repair quotation of R6,200.",
    timeline: [
      { action: "Claim package received from broker", actor: "System", ts: "2026-09-03 14:02" },
      { action: "Priority classified as Low", actor: "Claims System", ts: "2026-09-03 14:03" },
      { action: "Assigned to assessor N. Dlamini", actor: "N. Dlamini", ts: "2026-09-03 15:20" },
      { action: "Claim approved by assessor", actor: "N. Dlamini", ts: "2026-09-03 16:41" },
      { action: "Santam claim reference issued — STM-CLM-772014", actor: "N. Dlamini", ts: "2026-09-03 16:43" },
    ],
  },
  {
    id: "STM-10455",
    santamRef: null,
    client: "Zanele Khumalo",
    broker: "Coastal Cover",
    vehicle: "2020 Hyundai i20 — KZN 112-233",
    location: "M4, Durban",
    gps: "-29.8587, 31.0218",
    dateReceived: "2026-09-05 07:30",
    policy: { policyNumber: "POL-66190-ZK", coverageType: "Comprehensive", sumInsured: "R195,000", excess: "R6,000", premiumStatus: "Active" },
    financials: { reserve: "R28,000", estimatedPayout: "Pending assessment" },
    riskScore: 34,
    notes: [{ text: "Client reported mild whiplash discomfort — monitor for a late medical claim.", author: "T. van Wyk", ts: "2026-09-05 08:10" }],
    priority: "Medium",
    priorityReason: "Moderate rear damage, complete document set, voice note attached.",
    status: "Assessor Assigned",
    assessor: "T. van Wyk",
    docs: [
      { name: "Drivers licence", received: true },
      { name: "Police report (SAPS)", received: true },
      { name: "Vehicle photos (5)", received: true },
      { name: "Repair quotation", received: true },
    ],
    hasVoiceNote: true,
    witness: "2 witness statements on file",
    policeRef: "CAS 118/09/2026",
    incidentSummary: "Client was struck from behind at low speed in slow-moving traffic. Client reports mild whiplash discomfort but did not seek medical attention. Third-party details captured on scene.",
    timeline: [
      { action: "Claim package received from broker", actor: "System", ts: "2026-09-05 07:30" },
      { action: "Priority classified as Medium", actor: "Claims System", ts: "2026-09-05 07:31" },
      { action: "Assigned to assessor T. van Wyk", actor: "T. van Wyk", ts: "2026-09-05 08:05" },
    ],
  },
  {
    id: "STM-10456",
    santamRef: null,
    client: "Michael Botha",
    broker: "Coastal Cover",
    vehicle: "2022 BMW X3 — GP 998-112",
    location: "N3, Midrand",
    gps: "-25.9992, 28.1264",
    dateReceived: "2026-09-05 09:15",
    policy: { policyNumber: "POL-90044-MB", coverageType: "Comprehensive", sumInsured: "R650,000", excess: "R12,000", premiumStatus: "Lapsed" },
    financials: { reserve: "R180,000", estimatedPayout: "Pending assessment" },
    riskScore: 22,
    notes: [],
    priority: "High",
    priorityReason: "Multi-vehicle collision, extensive damage estimate.",
    status: "Under Review",
    assessor: null,
    docs: [
      { name: "Drivers licence", received: true },
      { name: "Police report (SAPS)", received: true },
      { name: "Vehicle photos (9)", received: true },
      { name: "Repair quotation", received: false },
    ],
    hasVoiceNote: true,
    witness: "3 witness statements on file",
    policeRef: "CAS 302/09/2026",
    incidentSummary: "Three-vehicle collision on the N3 during morning traffic. Client's vehicle sustained front and rear damage. High estimated repair cost.",
    timeline: [
      { action: "Claim package received from broker", actor: "System", ts: "2026-09-05 09:15" },
      { action: "Priority classified as High", actor: "Claims System", ts: "2026-09-05 09:16" },
    ],
  },
  {
    id: "STM-10441",
    santamRef: "STM-CLM-771988",
    client: "Precious Nkosi",
    broker: "Beacon Brokers",
    vehicle: "2017 Nissan NP200 — GP 331-778",
    location: "Old Pretoria Rd, Midrand",
    gps: "-25.9822, 28.1359",
    dateReceived: "2026-09-01 11:00",
    policy: { policyNumber: "POL-40021-PN", coverageType: "Third Party, Fire & Theft", sumInsured: "R95,000", excess: "R4,000", premiumStatus: "Active" },
    financials: { reserve: "R4,800", estimatedPayout: "R4,800" },
    riskScore: 4,
    notes: [],
    priority: "Low",
    priorityReason: "Single-vehicle incident, minor damage, complete documentation.",
    status: "Closed",
    assessor: "R. Naidoo",
    docs: [
      { name: "Drivers licence", received: true },
      { name: "Police report (SAPS)", received: true },
      { name: "Vehicle photos (3)", received: true },
      { name: "Repair quotation", received: true },
    ],
    hasVoiceNote: false,
    witness: "No witnesses",
    policeRef: "CAS 900/09/2026",
    incidentSummary: "Client reversed into a pole in a business parking area, damaging the rear bumper and tailgate. No third party involved.",
    timeline: [
      { action: "Claim package received from broker", actor: "System", ts: "2026-09-01 11:00" },
      { action: "Priority classified as Low", actor: "Claims System", ts: "2026-09-01 11:01" },
      { action: "Assigned to assessor R. Naidoo", actor: "R. Naidoo", ts: "2026-09-01 13:10" },
      { action: "Claim approved by assessor", actor: "R. Naidoo", ts: "2026-09-01 15:00" },
      { action: "Santam claim reference issued — STM-CLM-771988", actor: "R. Naidoo", ts: "2026-09-01 15:02" },
      { action: "Claim closed", actor: "R. Naidoo", ts: "2026-09-02 09:00" },
    ],
  },
]);

/* ---------------------------------------------------------------------- */
/* Small presentational pieces                                            */
/* ---------------------------------------------------------------------- */
function PriorityTag({ p }) {
  const map = {
    High: { bg: C.redBg, fg: C.red },
    Medium: { bg: C.amberBg, fg: C.amber },
    Low: { bg: C.greenBg, fg: C.green },
  };
  const s = map[p] || map.Low;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs font-medium border"
      style={{ background: s.bg, color: s.fg, borderColor: s.fg + "33" }}
    >
      {p}
    </span>
  );
}

const STATUS_STYLE = {
  Received: { bg: "#E7EDF7", fg: C.blue },
  "Under Review": { bg: C.amberBg, fg: C.amber },
  "Waiting for Documents": { bg: "#F1E7F3", fg: "#7A3E80" },
  "Assessor Assigned": { bg: "#E3ECF7", fg: C.navy },
  Approved: { bg: C.greenBg, fg: C.green },
  Rejected: { bg: C.redBg, fg: C.red },
  Closed: { bg: "#EAEAEA", fg: C.slate },
};

function StatusTag({ s }) {
  const st = STATUS_STYLE[s] || STATUS_STYLE.Received;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs font-medium border"
      style={{ background: st.bg, color: st.fg, borderColor: st.fg + "33" }}
    >
      {s}
    </span>
  );
}

/* A working status control: click it to open an inline picker of every
   status in the workflow and jump the claim straight to it. */
function StatusButton({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const st = STATUS_STYLE[status] || STATUS_STYLE.Received;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border"
        style={{ background: st.bg, color: st.fg, borderColor: st.fg + "55" }}
      >
        {status}
        <ChevronRight size={12} style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 120ms" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 border bg-white shadow-lg z-30" style={{ borderColor: C.line }}>
            {STATUS_ORDER.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[#F5F6F8] flex items-center justify-between"
                style={{ color: s === status ? C.navy : C.ink, fontWeight: s === status ? 600 : 400 }}
              >
                {s}
                {s === status && <CheckCheck size={13} style={{ color: C.navy }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function PremiumStatusTag({ s }) {
  const map = {
    Active: { bg: C.greenBg, fg: C.green },
    "Grace Period": { bg: C.amberBg, fg: C.amber },
    Lapsed: { bg: C.redBg, fg: C.red },
  };
  const st = map[s] || map.Active;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-xs font-medium border"
      style={{ background: st.bg, color: st.fg, borderColor: st.fg + "33" }}
    >
      {s}
    </span>
  );
}

function RiskMeter({ score }) {
  const color = score >= 50 ? C.red : score >= 20 ? C.amber : C.green;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span style={{ color: C.slate }}>Risk score</span>
        <span style={{ color, fontWeight: 600 }}>{score}/100 — {riskLabel(score)}</span>
      </div>
      <div className="w-full h-2" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
        <div className="h-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="flex-1 border p-4 bg-white" style={{ borderColor: C.line }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs tracking-wide" style={{ color: C.slate }}>{label}</span>
        <Icon size={16} style={{ color: accent || C.navy }} />
      </div>
      <div className="text-2xl" style={{ color: C.ink, fontFamily: "Georgia, serif" }}>{value}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Sidebar + top bar                                                       */
/* ---------------------------------------------------------------------- */
function Sidebar({ view, setView }) {
  const items = [
    { id: "dashboard", label: "Claims Dashboard", icon: LayoutGrid },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];
  return (
    <div className="w-56 shrink-0 hidden md:flex flex-col" style={{ background: C.navyDeep, color: "#E7ECF5" }}>
      <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: "#122A55" }}>
        <Shield size={20} style={{ color: C.red }} />
        <div>
          <div className="text-sm leading-tight" style={{ fontFamily: "Georgia, serif" }}>Santam</div>
          <div className="text-[10px] tracking-wide" style={{ color: "#8FA0BE" }}>CLAIMS PORTAL</div>
        </div>
      </div>
      <nav className="flex-1 py-3">
        {items.map((it) => {
          const active = view === it.id || (view === "claim" && it.id === "dashboard");
          return (
            <button
              key={it.id}
              onClick={() => setView(it.id)}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left"
              style={{ color: active ? "#fff" : "#AEBBD0", background: active ? "#0E2A56" : "transparent", borderLeft: active ? `3px solid ${C.red}` : "3px solid transparent" }}
            >
              <it.icon size={16} />
              {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function TopBar({ query, setQuery, onBack, showBack, title }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b bg-white sticky top-0 z-10" style={{ borderColor: C.line }}>
      {showBack ? (
        <button onClick={onBack} className="flex items-center gap-1 text-sm" style={{ color: C.blue }}>
          <ArrowLeft size={16} /> Back
        </button>
      ) : (
        <div className="flex items-center gap-2 text-sm" style={{ color: C.ink }}>
          <Building2 size={16} style={{ color: C.navy }} />
          <span style={{ fontFamily: "Georgia, serif" }}>{title}</span>
        </div>
      )}
      <div className="flex-1" />
      {!showBack && (
        <div className="relative w-64 hidden sm:block">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: C.slate }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search claim ref or client"
            className="w-full pl-8 pr-2 py-1.5 text-sm border outline-none"
            style={{ borderColor: C.line, background: C.paper, color: C.ink }}
          />
        </div>
      )}
      <Bell size={17} style={{ color: C.slate }} />
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white" style={{ background: C.navy }}>
        SC
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Dashboard view                                                          */
/* ---------------------------------------------------------------------- */
function Dashboard({ claims, query, onOpen, onStatusChange }) {
  const filtered = claims.filter(
    (c) => c.id.toLowerCase().includes(query.toLowerCase()) || c.client.toLowerCase().includes(query.toLowerCase())
  );
  const counts = {
    total: claims.length,
    high: claims.filter((c) => c.priority === "High").length,
    review: claims.filter((c) => ["Received", "Under Review", "Waiting for Documents"].includes(c.status)).length,
    closed: claims.filter((c) => ["Approved", "Closed"].includes(c.status)).length,
  };
  return (
    <div className="p-5">
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <StatCard label="Incoming claims" value={counts.total} icon={FileText} />
        <StatCard label="High priority" value={counts.high} icon={AlertTriangle} accent={C.red} />
        <StatCard label="Awaiting action" value={counts.review} icon={Clock} accent={C.amber} />
        <StatCard label="Approved / closed" value={counts.closed} icon={CheckCircle2} accent={C.green} />
      </div>

      <div className="border bg-white" style={{ borderColor: C.line }}>
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: C.line }}>
          <span className="text-sm" style={{ fontFamily: "Georgia, serif", color: C.ink }}>Incoming Claims</span>
          <span className="text-xs" style={{ color: C.slate }}>{filtered.length} of {claims.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: C.slate }} className="text-xs">
                <th className="text-left font-normal px-4 py-2">Reference</th>
                <th className="text-left font-normal px-4 py-2">Client</th>
                <th className="text-left font-normal px-4 py-2">Vehicle</th>
                <th className="text-left font-normal px-4 py-2">Received</th>
                <th className="text-left font-normal px-4 py-2">Priority</th>
                <th className="text-left font-normal px-4 py-2">Assessor</th>
                <th className="text-left font-normal px-4 py-2">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-[#FAFAFB]" style={{ borderColor: C.line }}>
                  <td className="px-4 py-3 cursor-pointer" style={{ color: C.navy, fontWeight: 500 }} onClick={() => onOpen(c.id)}>{c.id}</td>
                  <td className="px-4 py-3 cursor-pointer" style={{ color: C.ink }} onClick={() => onOpen(c.id)}>{c.client}</td>
                  <td className="px-4 py-3 cursor-pointer" style={{ color: C.slate }} onClick={() => onOpen(c.id)}>{c.vehicle}</td>
                  <td className="px-4 py-3 cursor-pointer" style={{ color: C.slate }} onClick={() => onOpen(c.id)}>{c.dateReceived}</td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onOpen(c.id)}><PriorityTag p={c.priority} /></td>
                  <td className="px-4 py-3 cursor-pointer" style={{ color: c.assessor ? C.ink : C.slate }} onClick={() => onOpen(c.id)}>{c.assessor || "Unassigned"}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusButton status={c.status} onChange={(s) => onStatusChange(c.id, s)} />
                  </td>
                  <td className="px-4 py-3 text-right cursor-pointer" onClick={() => onOpen(c.id)}><ChevronRight size={15} style={{ color: C.slate }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Internal notes                                                          */
/* ---------------------------------------------------------------------- */
function InternalNotes({ claim, onAddNote }) {
  const [text, setText] = useState("");
  return (
    <section className="border bg-white p-4" style={{ borderColor: C.line }}>
      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>
        <StickyNote size={14} /> Internal Notes
      </div>
      {claim.notes.length > 0 && (
        <ul className="space-y-3 mb-3">
          {claim.notes.map((n, i) => (
            <li key={i} className="text-sm border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: C.line }}>
              <div style={{ color: C.ink }}>{n.text}</div>
              <div className="text-xs mt-1" style={{ color: C.slate }}>{n.author} · {n.ts}</div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add an internal note (not visible to client)…"
          className="flex-1 border px-2 py-1.5 text-sm outline-none"
          style={{ borderColor: C.line, color: C.ink }}
        />
        <button
          disabled={!text.trim()}
          onClick={() => { onAddNote(text.trim()); setText(""); }}
          className="px-3 py-1.5 text-sm text-white disabled:opacity-40 flex items-center gap-1"
          style={{ background: C.navy }}
        >
          <Plus size={13} /> Add
        </button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Claim detail view                                                       */
/* ---------------------------------------------------------------------- */
function ClaimDetail({ claim, onAssign, onStatusChange, onAddNote }) {
  const policyLapsed = claim.policy.premiumStatus === "Lapsed";

  return (
    <div className="p-5 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="text-xl" style={{ fontFamily: "Georgia, serif", color: C.ink }}>{claim.id}</div>
          <div className="text-sm mt-1" style={{ color: C.slate }}>{claim.client} · {claim.broker}</div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityTag p={claim.priority} />
          <StatusButton status={claim.status} onChange={onStatusChange} />
          <button
            onClick={() => downloadTextFile(`${claim.id}-case-file.txt`, buildClaimReport(claim))}
            className="flex items-center gap-1 px-2.5 py-1 text-xs border"
            style={{ borderColor: C.navy, color: C.navy }}
          >
            <Download size={13} /> Download Case File
          </button>
        </div>
      </div>

      {policyLapsed && (
        <div className="border p-3 mb-5 flex items-start gap-2" style={{ background: C.redBg, borderColor: C.red + "44" }}>
          <AlertTriangle size={15} style={{ color: C.red, marginTop: 2 }} />
          <div className="text-sm" style={{ color: C.red }}>
            This policy is <b>lapsed</b>. Claims cannot be approved until premium arrears are settled.
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="text-sm mb-3" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>Incident Summary</div>
            <p className="text-sm leading-relaxed" style={{ color: C.ink }}>{claim.incidentSummary}</p>
            <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: C.line, color: C.slate }}>
              Priority reason: {claim.priorityReason}
            </div>
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="text-sm mb-3" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>Accident Details</div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5" style={{ color: C.slate }} /><div><div style={{ color: C.ink }}>{claim.location}</div><div className="text-xs" style={{ color: C.slate }}>{claim.gps}</div></div></div>
              <div className="flex items-start gap-2"><FileCheck size={14} className="mt-0.5" style={{ color: C.slate }} /><div><div style={{ color: C.ink }}>Police reference</div><div className="text-xs" style={{ color: C.slate }}>{claim.policeRef}</div></div></div>
              <div className="flex items-start gap-2"><Users size={14} className="mt-0.5" style={{ color: C.slate }} /><div><div style={{ color: C.ink }}>Witnesses</div><div className="text-xs" style={{ color: C.slate }}>{claim.witness}</div></div></div>
              <div className="flex items-start gap-2"><Mic size={14} className="mt-0.5" style={{ color: C.slate }} /><div><div style={{ color: C.ink }}>Voice note</div><div className="text-xs" style={{ color: C.slate }}>{claim.hasVoiceNote ? "Attached" : "None submitted"}</div></div></div>
            </div>
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>
                <ClipboardList size={14} /> Policy &amp; Coverage
              </div>
              <PremiumStatusTag s={claim.policy.premiumStatus} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs" style={{ color: C.slate }}>Policy number</div><div style={{ color: C.ink }}>{claim.policy.policyNumber}</div></div>
              <div><div className="text-xs" style={{ color: C.slate }}>Coverage type</div><div style={{ color: C.ink }}>{claim.policy.coverageType}</div></div>
              <div><div className="text-xs" style={{ color: C.slate }}>Sum insured</div><div style={{ color: C.ink }}>{claim.policy.sumInsured}</div></div>
              <div><div className="text-xs" style={{ color: C.slate }}>Excess</div><div style={{ color: C.ink }}>{claim.policy.excess}</div></div>
            </div>
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>
              <Banknote size={14} /> Claim Financials
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs" style={{ color: C.slate }}>Reserve set</div><div style={{ color: C.ink }}>{claim.financials.reserve}</div></div>
              <div><div className="text-xs" style={{ color: C.slate }}>Estimated / final payout</div><div style={{ color: C.ink }}>{claim.financials.estimatedPayout}</div></div>
            </div>
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>
              <Gauge size={14} /> Risk Score
            </div>
            <RiskMeter score={claim.riskScore} />
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>
                <FileText size={14} /> Documents
              </div>
              <button
                onClick={() => downloadTextFile(
                  `${claim.id}-document-manifest.txt`,
                  `Document manifest — ${claim.id}\n\n${claim.docs.map((d) => `${d.name}: ${d.received ? "Received" : "Outstanding"}`).join("\n")}`
                )}
                className="flex items-center gap-1 text-xs"
                style={{ color: C.blue }}
              >
                <FolderDown size={13} /> Download manifest
              </button>
            </div>
            <ul className="text-sm space-y-2">
              {claim.docs.map((d) => (
                <li key={d.name} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: C.line }}>
                  <span style={{ color: C.ink }}>{d.name}</span>
                  <span className="text-xs" style={{ color: d.received ? C.green : C.red }}>{d.received ? "Received" : "Outstanding"}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>
              <Clock size={14} /> Timeline
            </div>
            <ul className="space-y-3">
              {claim.timeline.map((t, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <div className="w-24 shrink-0 text-xs" style={{ color: C.slate }}>{t.ts}</div>
                  <div>
                    <div style={{ color: C.ink }}>{t.action}</div>
                    <div className="text-xs" style={{ color: C.slate }}>{t.actor}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <InternalNotes claim={claim} onAddNote={onAddNote} />
        </div>

        <div className="space-y-5">
          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="text-sm mb-3" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>Assessor</div>
            {claim.assessor ? (
              <div className="text-sm" style={{ color: C.ink }}>{claim.assessor}</div>
            ) : (
              <select
                onChange={(e) => onAssign(e.target.value)}
                defaultValue=""
                className="w-full border px-2 py-1.5 text-sm outline-none"
                style={{ borderColor: C.line, color: C.ink }}
              >
                <option value="" disabled>Assign an assessor…</option>
                {ASSESSORS.filter((a) => a.available).map((a) => (
                  <option key={a.id} value={a.name}>{a.name} — {a.dept}</option>
                ))}
              </select>
            )}
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="text-sm mb-3" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>Assessor Decision</div>
            {policyLapsed && (
              <p className="text-xs mb-3" style={{ color: C.red }}>Blocked: policy is lapsed. Settle premium arrears before approving.</p>
            )}
            {!claim.assessor && !policyLapsed && (
              <p className="text-xs mb-3" style={{ color: C.slate }}>Assign an assessor before this claim can be decided.</p>
            )}
            <p className="text-xs" style={{ color: C.slate }}>
              Use the status control at the top of this claim to move it to <b>Approved</b> or <b>Rejected</b> — a Santam claim reference is issued automatically on approval.
            </p>
          </section>

          <section className="border bg-white p-4" style={{ borderColor: C.line }}>
            <div className="text-sm mb-3" style={{ color: C.navy, fontFamily: "Georgia, serif" }}>Santam Claim Reference</div>
            {claim.santamRef ? (
              <div className="text-sm" style={{ color: C.red, fontWeight: 600 }}>{claim.santamRef}</div>
            ) : (
              <div className="text-xs" style={{ color: C.slate }}>Issued automatically once the claim is approved.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Analytics                                                                */
/* ---------------------------------------------------------------------- */
const PIE_COLORS = [C.navy, C.red, C.amber, C.green, C.blue, C.slate];

function Analytics({ claims }) {
  const statusCounts = STATUS_ORDER.map((s) => ({ name: s, value: claims.filter((c) => c.status === s).length })).filter((d) => d.value > 0);
  const priorityCounts = ["High", "Medium", "Low"].map((p) => ({ name: p, value: claims.filter((c) => c.priority === p).length }));
  const byDate = {};
  claims.forEach((c) => {
    const day = c.dateReceived.slice(0, 10);
    byDate[day] = (byDate[day] || 0) + 1;
  });
  const dateSeries = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
  const avgRisk = Math.round(claims.reduce((sum, c) => sum + c.riskScore, 0) / (claims.length || 1));

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <StatCard label="Total claims" value={claims.length} icon={FileText} />
        <StatCard label="Average risk score" value={`${avgRisk}/100`} icon={Gauge} accent={avgRisk >= 20 ? C.amber : C.green} />
        <StatCard label="Approved claims" value={claims.filter((c) => c.status === "Approved").length} icon={CheckCircle2} accent={C.green} />
        <StatCard label="Rejected claims" value={claims.filter((c) => c.status === "Rejected").length} icon={XCircle} accent={C.red} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="border bg-white p-4" style={{ borderColor: C.line }}>
          <div className="text-sm mb-3" style={{ fontFamily: "Georgia, serif", color: C.ink }}>Claims by Status</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.slate }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.slate }} />
              <Tooltip />
              <Bar dataKey="value" fill={C.navy} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border bg-white p-4" style={{ borderColor: C.line }}>
          <div className="text-sm mb-3" style={{ fontFamily: "Georgia, serif", color: C.ink }}>Claims by Priority</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={priorityCounts} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {priorityCounts.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border bg-white p-4 md:col-span-2" style={{ borderColor: C.line }}>
          <div className="text-sm mb-3" style={{ fontFamily: "Georgia, serif", color: C.ink }}>Claims Received Over Time</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dateSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.line} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.slate }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.slate }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke={C.red} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App                                                                      */
/* ---------------------------------------------------------------------- */
export default function App() {
  const [claims, setClaims] = useState(initialClaims);
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");

  const selected = claims.find((c) => c.id === selectedId);

  const updateClaim = (id, patch, timelineEntry) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...patch, timeline: timelineEntry ? [...c.timeline, timelineEntry] : c.timeline }
          : c
      )
    );
  };

  const handleAssign = (name) => {
    updateClaim(selected.id, { assessor: name, status: selected.status === "Received" || selected.status === "Under Review" ? "Assessor Assigned" : selected.status }, {
      action: `Assigned to assessor ${name}`, actor: "You", ts: nowTs(),
    });
  };

  const handleStatusChange = (id, newStatus) => {
    const claim = claims.find((c) => c.id === id);
    if (!claim || claim.status === newStatus) return;
    const ts = nowTs();
    if (newStatus === "Approved" && !claim.santamRef) {
      const ref = "STM-CLM-" + Math.floor(700000 + Math.random() * 99999);
      updateClaim(id, { status: newStatus, santamRef: ref }, {
        action: `Claim approved — Santam reference ${ref} issued`, actor: "You", ts,
      });
      return;
    }
    updateClaim(id, { status: newStatus }, {
      action: `Status changed from ${claim.status} to ${newStatus}`, actor: "You", ts,
    });
  };

  const handleAddNote = (text) => {
    const ts = nowTs();
    updateClaim(selected.id, { notes: [...selected.notes, { text, author: "You", ts }] }, {
      action: `Internal note added`, actor: "You", ts,
    });
  };

  return (
    <div className="w-full h-full min-h-[700px] flex" style={{ background: C.paper, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar view={view} setView={(v) => { setView(v); setSelectedId(null); }} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          query={query}
          setQuery={setQuery}
          showBack={view === "claim"}
          onBack={() => setView("dashboard")}
          title={view === "analytics" ? "Analytics" : "Claims Dashboard"}
        />
        {view === "dashboard" && (
          <Dashboard claims={claims} query={query} onOpen={(id) => { setSelectedId(id); setView("claim"); }} onStatusChange={handleStatusChange} />
        )}
        {view === "claim" && selected && (
          <ClaimDetail
            claim={selected}
            onAssign={handleAssign}
            onStatusChange={(s) => handleStatusChange(selected.id, s)}
            onAddNote={handleAddNote}
          />
        )}
        {view === "analytics" && <Analytics claims={claims} />}
      </div>
    </div>
  );
}
