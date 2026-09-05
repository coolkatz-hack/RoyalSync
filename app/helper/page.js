"use client";

import { useEffect, useState } from "react";

export default function HelperPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin", { headers: { "X-User-Role": "helper" } })
      .then((response) => response.json())
      .then((data) => setCustomers(data.customers || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="helper-shell">
      <header className="helper-topbar"><a className="helper-brand" href="/helper">RoyalSync <span>intake desk</span></a><a className="helper-link" href="/admin">Admin analytics →</a></header>
      <div className="helper-content">
        <div className="helper-hero"><p className="helper-kicker">Helper workspace / live queue</p><h1>Make every new record complete.</h1><p>Capture the profile, vehicle, insurer, and adviser details that keep a customer ready for processing.</p><a className="helper-cta" href="/admin">Open registration form <span>↗</span></a></div>
        <section className="helper-stats"><div><span>Records in queue</span><strong>{loading ? "—" : customers.length}</strong></div><div><span>Latest customer</span><strong>{loading ? "—" : customers[0]?.fullName || "None"}</strong></div><div><span>Role access</span><strong>Read & write</strong></div></section>
        <section className="intake-board"><div className="intake-heading"><div><p className="helper-kicker">InsuranceHubCore / customer profiles</p><h2>Recent intake</h2></div><span>POST /admin available</span></div>{loading ? <p>Syncing customer records...</p> : customers.length === 0 ? <p>No customers have been registered yet.</p> : <div className="customer-cards">{customers.map((customer, index) => <article key={customer.customerId} className="customer-card"><span className="card-index">0{index + 1}</span><div><h3>{customer.fullName || "Unnamed customer"}</h3><p>{customer.clientNumber || customer.customerId}</p><p>{customer.email || "No email recorded"}</p></div><a href={`/admin?customerId=${customer.customerId}`}>Inspect <span>↗</span></a></article>)}</div>}</section>
      </div>
    </main>
  );
}