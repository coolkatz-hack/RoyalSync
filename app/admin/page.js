"use client";

import { useEffect, useMemo, useState } from "react";

const apiUrl = "/api/admin";

function getErrorMessage(error) {
  return error instanceof Error ? error.message : "The customer service is unavailable.";
}

function DetailItem({ label, value }) {
  return <div className="profile-detail"><span>{label}</span><strong>{value || "Not provided"}</strong></div>;
}

function CustomerProfile({ customer }) {
  const profile = customer.profile || {};
  const vehicle = profile.vehicle || customer.claims?.[0]?.vehicle || {};
  const insurer = profile.insurer || customer.claims?.[0]?.insurer || "Not provided";
  const policy = profile.policy || customer.claims?.[0]?.policy || {};
  const adviser = profile.adviser || {};

  return <>
    <p className="eyebrow">Customer profile</p>
    <div className="profile-title"><div><h2>{profile.fullName || customer.customerId}</h2><p className="muted">{profile.clientNumber || customer.customerId}</p></div><span className="profile-status">Active record</span></div>
    <section className="profile-section"><h3>Contact and identity</h3><div className="profile-grid"><DetailItem label="Email" value={profile.email} /><DetailItem label="Phone" value={profile.phone} /><DetailItem label="ID number" value={profile.idNumber} /><DetailItem label="Address" value={profile.address} /><DetailItem label="Tax number" value={profile.taxNumber} /><DetailItem label="Registered" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-ZA") : "Not provided"} /></div></section>
    <section className="profile-section"><h3>Vehicle and cover</h3><div className="profile-grid"><DetailItem label="Vehicle" value={[vehicle.make, vehicle.model].filter(Boolean).join(" ")} /><DetailItem label="Registration" value={vehicle.registration} /><DetailItem label="Year" value={vehicle.year} /><DetailItem label="Insurer" value={typeof insurer === "string" ? insurer : insurer.name} /><DetailItem label="Policy number" value={policy.policyNumber} /><DetailItem label="Coverage" value={policy.coverage} /></div></section>
    <section className="profile-section"><h3>Adviser relationship</h3><div className="profile-grid"><DetailItem label="Adviser" value={adviser.name} /><DetailItem label="Email" value={adviser.email} /><DetailItem label="Phone" value={adviser.phone} /><DetailItem label="FSP number" value={adviser.fspNumber} /></div></section>
    <div className="profile-summary"><span>{customer.policies?.length || 0} policies</span><span>{customer.claims?.length || 0} claims</span><span>{customer.totalRecords || 0} linked records</span></div>
  </>;
}

export default function AdminPage() {
  const [role, setRole] = useState("admin");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", idNumber: "", address: "", taxNumber: "", vehicle: { registration: "", make: "", model: "", year: "" }, insurer: { name: "", policyNumber: "", coverage: "" }, adviser: { name: "", phone: "", email: "", fspNumber: "" } });

  async function loadCustomers() {
    if (!apiUrl) {
      setError("Set NEXT_PUBLIC_ADMIN_API_URL to your API Gateway /admin URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl, { headers: { "X-User-Role": role } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load customers.");
      setCustomers(data.customers || []);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, [role]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) => [customer.fullName, customer.email, customer.clientNumber].some((value) => value?.toLowerCase().includes(query)));
  }, [customers, search]);

  const analytics = useMemo(() => ({
    total: customers.length,
    completeProfiles: customers.filter((customer) => customer.phone !== "N/A" && customer.idNumber !== "N/A").length,
    missingContact: customers.filter((customer) => customer.phone === "N/A" || customer.email === "N/A").length,
    recent: customers.filter((customer) => customer.createdAt && customer.createdAt !== "N/A" && Date.now() - Date.parse(customer.createdAt) < 30 * 86400000).length,
    withVehicles: customers.filter((customer) => customer.vehicle).length,
    trend: Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index), 1);
      const month = date.toLocaleDateString("en-ZA", { month: "short" });
      const count = customers.filter((customer) => {
        const created = customer.createdAt && Date.parse(customer.createdAt);
        return created && new Date(created).getMonth() === date.getMonth() && new Date(created).getFullYear() === date.getFullYear();
      }).length;
      return { month, count };
    }),
  }), [customers]);

  const completionRate = analytics.total ? Math.round((analytics.completeProfiles / analytics.total) * 100) : 0;
  const trendPeak = Math.max(...analytics.trend.map((item) => item.count), 1);

  async function openCustomer(customerId) {
    setSelectedCustomer({ loading: true });
    try {
      const response = await fetch(`${apiUrl}?customerId=${encodeURIComponent(customerId)}`, { headers: { "X-User-Role": role } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load this customer.");
      setSelectedCustomer(data);
    } catch (detailError) {
      setError(getErrorMessage(detailError));
      setSelectedCustomer(null);
    }
  }

  async function createCustomer(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json", "X-User-Role": "helper" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to register customer.");
      setForm({ fullName: "", email: "", phone: "", idNumber: "", address: "", taxNumber: "", vehicle: { registration: "", make: "", model: "", year: "" }, insurer: { name: "", policyNumber: "", coverage: "" }, adviser: { name: "", phone: "", email: "", fspNumber: "" } });
      setNotice(`${data.customer.fullName} was registered successfully.`);
      await loadCustomers();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/admin">Royal<span>Sync</span></a>
        <div className="role-control"><a href="/helper">Helper desk</a><label htmlFor="role">Viewing as</label><select id="role" value={role} onChange={(event) => setRole(event.target.value)}><option value="admin">Admin · read only</option><option value="helper">Helper · read & write</option></select></div>
      </header>
      <div className="content">
        <p className="eyebrow">InsuranceHubAdmin / {role}</p>
        <div className="page-heading"><div><h1>Lets onboard our customers to the healthier and insured side.</h1><p className="intro">Live customer records from InsuranceHubCore.</p></div><button className="button" type="button" onClick={loadCustomers}>Refresh records</button></div>
        {error && <p className="message error">{error}</p>}
        {notice && <p className="message success">{notice}</p>}
        <section className="metrics" aria-label="Customer analytics"><div className="metric"><strong>{analytics.total}</strong><span>Customers returned</span></div><div className="metric"><strong>{analytics.completeProfiles}</strong><span>Profiles with contact data</span></div><div className="metric"><strong>{analytics.recent}</strong><span>Registered in last 30 days</span></div><div className="metric"><strong>{analytics.missingContact}</strong><span>Need contact review</span></div></section>
        <section className="analytics-grid" aria-label="Analytics and highlights">
          <article className="chart-panel"><div className="section-heading"><div><p className="eyebrow">Registration trend</p><h2>New customers</h2></div><span className="chart-caption">Last 6 months</span></div><div className="bar-chart" aria-label="New customers by month">{analytics.trend.map((item) => <div className="bar-column" key={item.month}><span className="bar-value">{item.count}</span><div className="bar-track"><div className="bar" style={{ height: `${Math.max((item.count / trendPeak) * 100, item.count ? 12 : 3)}%` }} /></div><span className="bar-label">{item.month}</span></div>)}</div></article>
          <article className="chart-panel highlights"><div className="section-heading"><div><p className="eyebrow">Data quality</p><h2>Highlights</h2></div><span className="chart-caption">Live calculation</span></div><div className="progress-row"><div><span>Profile completeness</span><strong>{completionRate}%</strong></div><div className="progress-track"><div className="progress" style={{ width: `${completionRate}%` }} /></div></div><div className="highlight-list"><div><span className="highlight-dot teal" /><p><strong>{analytics.withVehicles}</strong> customers with vehicle details</p></div><div><span className="highlight-dot orange" /><p><strong>{analytics.missingContact}</strong> records need contact review</p></div><div><span className="highlight-dot dark" /><p><strong>{analytics.recent}</strong> new registrations in 30 days</p></div></div></article>
        </section>
        <section className="workspace">
          <div className="section-heading"><div><p className="eyebrow">GET /admin</p><h2>Customer directory</h2></div><input className="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or client number" aria-label="Search customers" /></div>
          {loading ? <p className="empty">Loading InsuranceHubCore records...</p> : filteredCustomers.length === 0 ? <p className="empty">No customer records match this view.</p> : <div className="table-wrap"><table className="table"><thead><tr><th>Customer</th><th>Client number</th><th>Email</th><th>Phone</th><th>Created</th><th /></tr></thead><tbody>{filteredCustomers.map((customer) => <tr key={customer.customerId}><td><strong>{customer.fullName || "Unnamed customer"}</strong><small>{customer.customerId}</small></td><td>{customer.clientNumber || "N/A"}</td><td>{customer.email || "N/A"}</td><td>{customer.phone || "N/A"}</td><td>{customer.createdAt === "N/A" ? "N/A" : new Date(customer.createdAt).toLocaleDateString("en-ZA")}</td><td><button className="text-button" type="button" onClick={() => openCustomer(customer.customerId)}>View profile</button></td></tr>)}</tbody></table></div>}
        </section>
        {role === "helper" && <section className="workspace form-panel"><div className="section-heading"><div><p className="eyebrow">POST /admin</p><h2>Register customer</h2></div><span className="permission">Helper permission</span></div><form onSubmit={createCustomer}><div className="form-section"><p className="form-section-title">Customer identity</p><div className="form-grid">{[["fullName", "Full name", true], ["email", "Email address", true], ["phone", "Phone", false], ["idNumber", "ID number", false], ["address", "Address", false], ["taxNumber", "Tax number", false]].map(([name, label, required]) => <label key={name}>{label}<input required={required} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} /></label>)}</div></div><div className="form-section"><p className="form-section-title">Vehicle details</p><div className="form-grid">{[["registration", "Registration", true], ["make", "Make", false], ["model", "Model", false], ["year", "Year", false]].map(([name, label, required]) => <label key={name}>{label}<input required={required} value={form.vehicle[name]} onChange={(event) => setForm({ ...form, vehicle: { ...form.vehicle, [name]: event.target.value } })} /></label>)}</div></div><div className="form-section"><p className="form-section-title">Insurer and policy</p><div className="form-grid">{[["name", "Insurer name", true], ["policyNumber", "Policy number", false], ["coverage", "Coverage", false]].map(([name, label, required]) => <label key={name}>{label}<input required={required} value={form.insurer[name]} onChange={(event) => setForm({ ...form, insurer: { ...form.insurer, [name]: event.target.value } })} /></label>)}</div></div><div className="form-section"><p className="form-section-title">Adviser</p><div className="form-grid">{[["name", "Adviser name", false], ["phone", "Adviser phone", false], ["email", "Adviser email", false], ["fspNumber", "FSP number", false]].map(([name, label]) => <label key={name}>{label}<input value={form.adviser[name]} onChange={(event) => setForm({ ...form, adviser: { ...form.adviser, [name]: event.target.value } })} /></label>)}</div></div><button className="button solid" disabled={saving}>{saving ? "Registering..." : "Register customer"}</button></form></section>}
      </div>
      {selectedCustomer && <div className="dialog-backdrop" role="presentation" onClick={() => setSelectedCustomer(null)}><aside className="dialog" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><button className="close" type="button" onClick={() => setSelectedCustomer(null)} aria-label="Close customer profile">×</button>{selectedCustomer.loading ? <p>Loading profile...</p> : <CustomerProfile customer={selectedCustomer} />}</aside></div>}
    </main>
  );
}