"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownToLine,
  Check,
  Mail,
  Search,
  ChevronDown,
  Printer,
} from "lucide-react";
import { useAdminData, formatDate } from "../lib/admin-data";
import { SECTIONS } from "../lib/institutional-content";
import { FieldValue } from "./ui/AssessmentForm2";
import { Reveal } from "./journey-shell";
import { ProposalEditor } from "./proposal-editor";
import { validProposal } from "../lib/proposal-data";

export function AdminReport({ type }: { type: "assessment1" | "assessment2" }) {
  const { id } = useParams<{ id: string }>();
  const { users, loading, error: loadError, refresh } = useAdminData();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const user = users.find((u) => u.id === id);
  const assessment = user?.[type];
  const first = type === "assessment1";
  async function download() {
    if (!user) return;
    setBusy("pdf");
    setError("");
    try {
      const res = await fetch(
        `/api/admin/report-pdf?userId=${user.id}&type=${type}`,
      );
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `CRAM-${type}-${user.id}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("The PDF could not be downloaded. Please try again.");
    } finally {
      setBusy("");
    }
  }
  async function email() {
    if (!user) return;
    setBusy("email");
    setError("");
    try {
      const res = await fetch("/api/admin/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, assessmentType: type }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setConfirm(false);
    } catch {
      setError(
        "The report could not be sent. Check email delivery configuration and try again.",
      );
    } finally {
      setBusy("");
    }
  }
  if (loading)
    return (
      <p role="status" className="loading-state">
        Loading client report…
      </p>
    );
  if (loadError)
    return (
      <div className="notice-panel">
        <h1>Report unavailable</h1>
        <p>{loadError}</p>
        <button className="button-primary" onClick={refresh}>
          Try again
        </button>
      </div>
    );
  if (!user || !assessment)
    return (
      <div className="notice-panel">
        <h1>No submitted report found</h1>
        <p>This assessment may not have been completed yet.</p>
        <Link href="/admin/reports" className="button-primary">
          Return to reports
        </Link>
      </div>
    );
  const groups = [
    ...new Set(assessment.answers.map((a) => a.question.categoryOrder)),
  ].map((order) =>
    assessment.answers.filter((a) => a.question.categoryOrder === order),
  );
  const q = query.trim().toLowerCase();
  return (
    <Reveal>
      <div className="report-toolbar">
        <Link href="/admin/reports" className="text-button">
          <ArrowLeft size={16} />
          Reports library
        </Link>
        <div>
          <button className="button-secondary" onClick={() => window.print()}>
            <Printer size={16} />
            Print
          </button>
          <button
            className="button-secondary"
            disabled={!!busy || sent}
            onClick={() => setConfirm((v) => !v)}
          >
            {sent ? <Check size={16} /> : <Mail size={16} />}
            {sent ? "Report sent" : "Email report"}
          </button>
          <button
            className="button-primary"
            disabled={!!busy}
            onClick={download}
          >
            <ArrowDownToLine size={16} />
            {busy === "pdf" ? "Preparing…" : "Download PDF"}
          </button>
        </div>
      </div>
      {confirm && (
        <div className="email-confirmation">
          <div>
            <strong>Send this report to {user.email}?</strong>
            <p>
              The client will receive their{" "}
              {first ? "governance assessment" : "institutional profile"}{" "}
              report.
            </p>
          </div>
          <button
            className="button-secondary"
            onClick={() => setConfirm(false)}
            disabled={!!busy}
          >
            Cancel
          </button>
          <button className="button-primary" onClick={email} disabled={!!busy}>
            {busy === "email" ? "Sending…" : "Send report"}
          </button>
        </div>
      )}
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      {sent && (
        <p className="status-pill" role="status">
          Report sent to {user.email}
        </p>
      )}
      {!first && (
        <ProposalEditor
          userId={user.id}
          initial={
            validProposal(assessment.rawPayload._financialProposal)
              ? assessment.rawPayload._financialProposal
              : undefined
          }
        />
      )}
      <article className="report-document">
        <header className="report-cover">
          <div className="report-cover-top">
            <span className="eyebrow">CRAM / CLIENT ASSESSMENT</span>
            <span className="confidential">CONFIDENTIAL</span>
          </div>
          <span className="report-number">{first ? "01" : "02"}</span>
          <h1>
            {first ? "Governance assessment" : "Institutional profile"}
            <br />
            <em>
              {first
                ? "A foundation for progress."
                : "The business, in detail."}
            </em>
          </h1>
          <div className="report-client">
            <div>
              <h2>{user.organization || user.name}</h2>
              <p>
                {user.name} · {user.email}
              </p>
              {user.phone && <p>{user.phone}</p>}
            </div>
            <div>
              <span>SUBMITTED</span>
              <strong>{formatDate(assessment.submittedAt)}</strong>
            </div>
          </div>
        </header>
        <div className="report-body">
          <section className="report-summary">
            <div>
              <span className="eyebrow">EXECUTIVE SUMMARY</span>
              <h2>
                {first
                  ? "Governance at a glance"
                  : "A complete business perspective"}
              </h2>
              <p>
                {first
                  ? "This report reflects the client’s self-assessment of current governance practices. Use the domain results to guide a focused follow-up conversation."
                  : "The following profile contains the business information provided by the client. Review the sections to define a relevant scope of work and financial proposal."}
              </p>
            </div>
            <div className="report-score">
              <strong>{first ? `${assessment.pct ?? 0}%` : "8"}</strong>
              <span>
                {first
                  ? "SELF-ASSESSED GOVERNANCE SCORE"
                  : "BUSINESS AREAS COVERED"}
              </span>
              <small>
                {first
                  ? `${assessment.totalScore} of ${assessment.maxScore} points`
                  : "Submitted institutional profile"}
              </small>
            </div>
          </section>
          {first && (
            <section className="report-domain-section">
              <span className="eyebrow">PERFORMANCE BY DOMAIN</span>
              <h2>Where the business stands</h2>
              <div className="report-domains">
                {groups.map((group) => {
                  const score = group.reduce(
                    (sum, a) => sum + a.selectedValue,
                    0,
                  );
                  const pct = Math.round((score / (group.length * 10)) * 100);
                  return (
                    <div key={group[0].question.categoryOrder}>
                      <div>
                        <span>{group[0].question.titleEn}</span>
                        <strong>{pct}%</strong>
                      </div>
                      <div className="progress-track">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="report-priorities">
                <h3>Priorities for the next conversation</h3>
                {groups.filter(
                  (g) =>
                    g.reduce((sum, a) => sum + a.selectedValue, 0) /
                      (g.length * 10) <
                    0.6,
                ).length ? (
                  <ul>
                    {groups
                      .filter(
                        (g) =>
                          g.reduce((sum, a) => sum + a.selectedValue, 0) /
                            (g.length * 10) <
                          0.6,
                      )
                      .map((g) => (
                        <li key={g[0].question.categoryOrder}>
                          Review gaps in{" "}
                          <strong>{g[0].question.titleEn.toLowerCase()}</strong>{" "}
                          and agree on practical actions with the client.
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p>
                    Discuss how existing practices are documented, monitored,
                    and improved over time.
                  </p>
                )}
              </div>
            </section>
          )}
          {!first && assessment.rawPayload._proposalRequestedAt ? (
            <div className="proposal-request-banner">
              <Check size={18} />
              <div>
                <strong>Financial proposal requested</strong>
                <p>
                  Request saved on{" "}
                  {formatDate(
                    String(assessment.rawPayload._proposalRequestedAt),
                  )}
                  . Review both assessments to prepare the scope and commercial
                  offer.
                </p>
              </div>
            </div>
          ) : null}
          <section className="report-detail-section">
            <div className="report-details-heading">
              <div>
                <span className="eyebrow">THE SOURCE DETAILS</span>
                <h2>
                  {first
                    ? "Submitted responses"
                    : "Submitted business information"}
                </h2>
              </div>
              <label className="search-input print-hide">
                <Search size={16} />
                <span className="sr-only">Search report</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find a topic or response…"
                />
              </label>
            </div>
            {first
              ? groups.map((group) => {
                  const filtered = group.filter(
                    (a) =>
                      !q ||
                      `${a.question.titleEn} ${a.question.questionEn} ${a.question.questionAr}`
                        .toLowerCase()
                        .includes(q),
                  );
                  return filtered.length ? (
                    <details
                      className="report-details"
                      key={group[0].question.categoryOrder}
                      open
                    >
                      <summary>
                        {group[0].question.titleEn}
                        <span>
                          {filtered.length} responses
                          <ChevronDown size={16} />
                        </span>
                      </summary>
                      {filtered.map((a, i) => (
                        <div className="report-response" key={i}>
                          <p>
                            <span>{String(i + 1).padStart(2, "0")}</span>
                            {a.question.questionEn}
                            <small dir="rtl">{a.question.questionAr}</small>
                          </p>
                          <span
                            className={`status-pill ${a.selectedValue === 0 ? "neutral" : a.selectedValue === 5 ? "brass" : ""}`}
                          >
                            {a.selectedValue === 10
                              ? "Yes"
                              : a.selectedValue === 5
                                ? "Partial"
                                : "No"}{" "}
                            · {a.selectedValue}/10
                          </span>
                        </div>
                      ))}
                    </details>
                  ) : null;
                })
              : SECTIONS.map((section) => {
                  const fields = section.fields.filter(
                    (f) =>
                      !q ||
                      `${section.titleEn} ${f.labelEn} ${f.labelAr} ${JSON.stringify(assessment.rawPayload[f.key] ?? "")}`
                        .toLowerCase()
                        .includes(q),
                  );
                  return fields.length ? (
                    <details className="report-details" open key={section.id}>
                      <summary>
                        {section.titleEn}
                        <span>
                          {fields.length} details
                          <ChevronDown size={16} />
                        </span>
                      </summary>
                      {fields.map((f) => (
                        <div className="report-response" key={f.key}>
                          <p>
                            {f.labelEn}
                            <small dir="rtl">{f.labelAr}</small>
                          </p>
                          <FieldValue value={assessment.rawPayload[f.key]} />
                        </div>
                      ))}
                    </details>
                  ) : null;
                })}
            {q &&
              !(first
                ? assessment.answers.some((a) =>
                    `${a.question.titleEn} ${a.question.questionEn} ${a.question.questionAr}`
                      .toLowerCase()
                      .includes(q),
                  )
                : SECTIONS.some((s) =>
                    s.fields.some((f) =>
                      `${s.titleEn} ${f.labelEn} ${f.labelAr} ${JSON.stringify(assessment.rawPayload[f.key] ?? "")}`
                        .toLowerCase()
                        .includes(q),
                    ),
                  )) && (
                <div className="empty-state">
                  <h3>No matching responses</h3>
                  <button className="text-button" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                </div>
              )}
          </section>
          <footer className="report-document-footer">
            <strong>CRAM Consulting</strong>
            <span>Self-reported client information · Confidential</span>
            <span>gm@cram.sa</span>
          </footer>
        </div>
      </article>
      <div className="report-crosslink">
        {first && user.assessment2 ? (
          <Link
            href={`/admin/reports/assessment2/${user.id}`}
            className="button-secondary"
          >
            Open institutional profile →
          </Link>
        ) : !first && user.assessment1 ? (
          <Link
            href={`/admin/reports/assessment1/${user.id}`}
            className="button-secondary"
          >
            Open governance report →
          </Link>
        ) : null}
      </div>
    </Reveal>
  );
}
