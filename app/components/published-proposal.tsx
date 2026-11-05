"use client";
import { useState } from "react";
import { ArrowDownToLine, CheckCircle2, FileText } from "lucide-react";
import { useLanguage } from "../lib/language-context";
import {
  money,
  proposalTotals,
  type FinancialProposal,
} from "../lib/proposal-data";
import { Reveal } from "./journey-shell";
export function PublishedProposal({
  proposal,
  userId,
  company,
}: {
  proposal: FinancialProposal;
  userId: string;
  company: string;
}) {
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  const totals = proposalTotals(proposal);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/proposal/pdf?userId=${encodeURIComponent(userId)}`,
      );
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposal.reference}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(
        ar
          ? "تعذر تحميل العرض. حاول مرة أخرى."
          : "The proposal could not be downloaded. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Reveal className="published-proposal">
      <div className="published-heading">
        <div>
          <span className="status-pill">
            <CheckCircle2 size={15} />
            {ar ? "عرضك المالي جاهز" : "YOUR FINANCIAL PROPOSAL IS READY"}
          </span>
          <h1>
            {ar
              ? "خطوتك القادمة، أصبحت واضحة."
              : "Your next step, clearly defined."}
          </h1>
          <p>{company}</p>
        </div>
        <button className="button-primary" onClick={download} disabled={busy}>
          <ArrowDownToLine size={17} />
          {busy
            ? ar
              ? "جارٍ التحميل…"
              : "Preparing…"
            : ar
              ? "تحميل العرض PDF"
              : "Download proposal PDF"}
        </button>
      </div>
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <article className="published-document">
        <header>
          <FileText size={28} />
          <span className="eyebrow">{proposal.reference}</span>
          <h2>{proposal.title}</h2>
          <p>
            {ar ? "ساري حتى " : "Valid until "}
            <bdi>{proposal.validUntil}</bdi>
          </p>
        </header>
        <section>
          <span className="eyebrow">{ar ? "نطاق العمل" : "SCOPE OF WORK"}</span>
          <p className="proposal-scope">{proposal.scope}</p>
        </section>
        <section>
          <h3>{ar ? "الأتعاب المهنية" : "Professional fees"}</h3>
          <div className="published-items">
            {proposal.items.map((item, i) => (
              <div key={i}>
                <div>
                  <strong>{item.description}</strong>
                  <small>
                    <bdi>
                      {item.quantity} × {money(item.unitPrice, ar)}
                    </bdi>
                  </small>
                </div>
                <bdi>{money(item.quantity * item.unitPrice, ar)}</bdi>
              </div>
            ))}
          </div>
          <dl className="published-totals">
            <div>
              <dt>{ar ? "المجموع الفرعي" : "Subtotal"}</dt>
              <dd>
                <bdi>{money(totals.subtotal, ar)}</bdi>
              </dd>
            </div>
            <div>
              <dt>
                {ar ? "الضريبة" : "Tax"} ({proposal.taxRate}%)
              </dt>
              <dd>
                <bdi>{money(totals.tax, ar)}</bdi>
              </dd>
            </div>
            <div>
              <dt>{ar ? "الإجمالي" : "Total"}</dt>
              <dd>
                <bdi>{money(totals.total, ar)}</bdi>
              </dd>
            </div>
          </dl>
        </section>
        <footer>
          <p>
            {ar
              ? "تواصل معنا لمناقشة العرض والخطوات التالية."
              : "Contact our team to discuss your proposal and the next steps."}
          </p>
          <a className="text-button" href="mailto:gm@cram.sa">
            gm@cram.sa
          </a>
        </footer>
      </article>
    </Reveal>
  );
}
