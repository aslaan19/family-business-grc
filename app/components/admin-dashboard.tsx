"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Search,
  RefreshCw,
  Users,
  CheckCircle2,
  Files,
  FileCheck2,
} from "lucide-react";
import { useAdminData, formatDate, userStage } from "../lib/admin-data";
import { Reveal } from "./journey-shell";

export function AdminDashboard({ reports = false }: { reports?: boolean }) {
  const { users, loading, error, refresh } = useAdminData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const a1 = users.filter((u) => u.assessment1).length;
  const a2 = users.filter((u) => u.assessment2).length;
  const requested = users.filter(
    (u) => u.assessment2?.rawPayload._proposalRequestedAt,
  ).length;
  const filtered = users
    .filter(
      (u) =>
        (!reports || u.assessment1 || u.assessment2) &&
        (!search.trim() ||
          [u.name, u.email, u.organization].some((v) =>
            v?.toLowerCase().includes(search.trim().toLowerCase()),
          )) &&
        (filter === "all" ||
          (filter === "registered" && !u.assessment1) ||
          (filter === "first" && u.assessment1 && !u.assessment2) ||
          (filter === "complete" && u.assessment2) ||
          (filter === "requested" &&
            u.assessment2?.rawPayload._proposalRequestedAt)),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "score"
          ? (b.assessment1?.pct ?? -1) - (a.assessment1?.pct ?? -1)
          : +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  async function exportFile() {
    setExporting(true);
    setExportError("");
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "CRAM-client-assessments.xlsx";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setExportError("Export could not be downloaded. Please try again.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <Reveal>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">
            {reports ? "CLIENT INTELLIGENCE" : "THE BIG PICTURE"}
          </span>
          <h1>{reports ? "Reports library" : "Business, in perspective."}</h1>
          <p>
            {reports
              ? "A clear record of every assessment, organised by client."
              : "Track your clients from their first assessment to their proposal request."}
          </p>
        </div>
        <div className="admin-heading-actions">
          <button
            className="button-secondary"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh workspace"
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
          <button
            className="button-primary"
            onClick={exportFile}
            disabled={loading || exporting}
          >
            <ArrowDownToLine size={16} />
            {exporting ? "Preparing…" : "Export data"}
          </button>
        </div>
      </div>
      {(error || exportError) && (
        <div role="alert" className="error-message">
          {error || exportError}
          {error && (
            <button className="text-button" onClick={refresh}>
              Try again
            </button>
          )}
        </div>
      )}
      <div className="admin-stats">
        {[
          {
            label: "Total clients",
            value: users.length,
            icon: Users,
            sub: "Registered business profiles",
          },
          {
            label: "Governance completed",
            value: a1,
            icon: CheckCircle2,
            sub: "First assessments submitted",
          },
          {
            label: "Institutional completed",
            value: a2,
            icon: Files,
            sub: "Ready for a proposal request",
          },
          {
            label: "Proposal requests",
            value: requested,
            icon: FileCheck2,
            sub: "Clients ready for your follow-up",
          },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div>
              <span>{s.label}</span>
              <s.icon size={17} />
            </div>
            <strong>{loading ? "—" : s.value.toLocaleString()}</strong>
            <p>{s.sub}</p>
          </div>
        ))}
      </div>
      {!reports && (
        <div className="admin-insight">
          <div>
            <span className="eyebrow">ASSESSMENT PIPELINE</span>
            <h2>Every client has a next step.</h2>
            <p>
              {requested
                ? `${requested} client${requested === 1 ? " has" : "s have"} requested a financial proposal.`
                : "Completed assessments become the starting point for your next conversation."}
            </p>
          </div>
          <div className="pipeline-summary">
            {[
              { label: "Governance next", value: users.length - a1 },
              { label: "Institutional next", value: a1 - a2 },
              { label: "Both complete", value: a2 },
            ].map((s) => (
              <div key={s.label}>
                <span>{s.label}</span>
                <div className="progress-track">
                  <span
                    style={{
                      width: `${users.length ? (s.value / users.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <b>{s.value}</b>
              </div>
            ))}
          </div>
        </div>
      )}
      <section className="client-directory">
        <div className="directory-heading">
          <h2>
            {reports ? "Client reports" : "Client directory"}
            <span>{filtered.length}</span>
          </h2>
          <p>
            {reports
              ? "Open a report to explore results and submitted business details."
              : "Search profiles, review progress, and open assessment reports."}
          </p>
        </div>
        <div className="directory-toolbar">
          <label className="search-input">
            <Search size={17} />
            <span className="sr-only">Search clients</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, business, or email…"
            />
          </label>
          <label>
            <span className="sr-only">Filter by progress</span>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All stages</option>
              <option value="registered">Governance next</option>
              <option value="first">Institutional next</option>
              <option value="complete">Both complete</option>
              <option value="requested">Proposal requested</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort clients</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="score">Highest governance score</option>
            </select>
          </label>
        </div>
        {loading ? (
          <div role="status" className="loading-state">
            Loading client workspace…
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Client data is unavailable</h3>
            <p>Retry the connection to load this workspace.</p>
          </div>
        ) : !visible.length ? (
          <div className="empty-state">
            <Files size={30} />
            <h3>
              {search || filter !== "all"
                ? "No matching clients"
                : reports
                  ? "Your reports will appear here"
                  : "Your first client starts the story"}
            </h3>
            <p>
              {search || filter !== "all"
                ? "Try a different search or reset the filters."
                : "New profiles and completed assessments will be organised here."}
            </p>
            {(search || filter !== "all") && (
              <button
                className="button-secondary"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="client-table-scroll">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>Client / Business</th>
                    <th>Journey status</th>
                    <th>Governance</th>
                    <th>Institutional</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="client-identity">
                          <span className="client-avatar">
                            {u.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>{u.name}</strong>
                            <span>
                              {u.organization || "Business not specified"}
                            </span>
                            <small>{u.email}</small>
                            {u.phone && <small>{u.phone}</small>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-pill ${u.assessment2?.rawPayload._proposalRequestedAt ? "brass" : ""}`}
                        >
                          {userStage(u)}
                        </span>
                        {u.assessment2?.rawPayload._proposalRequestedAt ? (
                          <small className="table-date">
                            Requested{" "}
                            {formatDate(
                              String(
                                u.assessment2.rawPayload._proposalRequestedAt,
                              ),
                            )}
                          </small>
                        ) : null}
                      </td>
                      <td>
                        {u.assessment1 ? (
                          <Link
                            className="table-report-link"
                            href={`/admin/reports/assessment1/${u.id}`}
                          >
                            <strong>{u.assessment1.pct ?? "—"}%</strong>
                            <span>
                              View report
                              <ArrowUpRight size={13} />
                            </span>
                          </Link>
                        ) : (
                          <span className="table-pending">Not submitted</span>
                        )}
                      </td>
                      <td>
                        {u.assessment2 ? (
                          <Link
                            className="table-report-link"
                            href={`/admin/reports/assessment2/${u.id}`}
                          >
                            <strong>Submitted</strong>
                            <span>
                              View profile
                              <ArrowUpRight size={13} />
                            </span>
                          </Link>
                        ) : (
                          <span className="table-pending">
                            {u.assessment1 ? "Awaiting response" : "Locked"}
                          </span>
                        )}
                      </td>
                      <td className="table-date">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="table-pagination">
              <span>
                Showing {(currentPage - 1) * 10 + 1}–
                {Math.min(currentPage * 10, filtered.length)} of{" "}
                {filtered.length} clients
              </span>
              <div>
                <button
                  className="button-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="button-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </Reveal>
  );
}
