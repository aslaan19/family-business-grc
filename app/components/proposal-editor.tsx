"use client";
import { useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import {
  money,
  proposalTotals,
  type FinancialProposal,
} from "../lib/proposal-data";
export function ProposalEditor({
  userId,
  initial,
}: {
  userId: string;
  initial?: FinancialProposal;
}) {
  const [open, setOpen] = useState(false);
  const [proposal, setProposal] = useState<FinancialProposal>(
    initial ?? {
      title: "Governance & institutional advisory",
      scope: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      taxRate: 0,
      issuedAt: "",
      validUntil: "",
      reference: "",
    },
  );
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const totals = proposalTotals(proposal);
  async function publish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, proposal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to publish proposal");
      setProposal(data.proposal);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to publish proposal. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function setItem(
    index: number,
    key: "description" | "quantity" | "unitPrice",
    value: string | number,
  ) {
    setProposal((p) => ({
      ...p,
      items: p.items.map((row, n) =>
        n === index ? { ...row, [key]: value } : row,
      ),
    }));
  }
  return (
    <section className="proposal-editor print-hide">
      <div className="proposal-editor-heading">
        <div>
          <span className="eyebrow">COMMERCIAL NEXT STEP</span>
          <h2>Financial proposal</h2>
          <p>
            {initial || saved
              ? "Published proposals are available in the client’s proposal workspace."
              : "Define the scope and fees, then publish the proposal for this client."}
          </p>
        </div>
        <button className="button-primary" onClick={() => setOpen((v) => !v)}>
          {open
            ? "Close editor"
            : initial || saved
              ? "Edit published proposal"
              : "Prepare proposal"}
        </button>
      </div>
      {open && (
        <form onSubmit={publish}>
          <div className="form-grid">
            <label>
              Proposal title
              <input
                required
                maxLength={160}
                value={proposal.title}
                onChange={(e) =>
                  setProposal((p) => ({ ...p, title: e.target.value }))
                }
              />
            </label>
            <label>
              Valid until
              <input
                required
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={proposal.validUntil}
                onChange={(e) =>
                  setProposal((p) => ({ ...p, validUntil: e.target.value }))
                }
              />
            </label>
          </div>
          <label>
            Scope of work
            <textarea
              required
              rows={4}
              maxLength={10000}
              value={proposal.scope}
              onChange={(e) =>
                setProposal((p) => ({ ...p, scope: e.target.value }))
              }
              placeholder="Describe deliverables, milestones, and the proposed engagement."
            />
          </label>
          <div className="proposal-line-items">
            {proposal.items.map((item, i) => (
              <div className="proposal-line-item" key={i}>
                <label>
                  Service / deliverable
                  <input
                    required
                    maxLength={500}
                    value={item.description}
                    onChange={(e) => setItem(i, "description", e.target.value)}
                  />
                </label>
                <label>
                  Quantity
                  <input
                    required
                    type="number"
                    min="0.01"
                    max="100000"
                    step="0.01"
                    value={Number.isNaN(item.quantity) ? "" : item.quantity}
                    onChange={(e) =>
                      setItem(
                        i,
                        "quantity",
                        e.target.value === "" ? NaN : Number(e.target.value),
                      )
                    }
                  />
                </label>
                <label>
                  Unit fee (SAR)
                  <input
                    required
                    type="number"
                    min="0"
                    max="1000000000"
                    step="0.01"
                    value={Number.isNaN(item.unitPrice) ? "" : item.unitPrice}
                    onChange={(e) =>
                      setItem(
                        i,
                        "unitPrice",
                        e.target.value === "" ? NaN : Number(e.target.value),
                      )
                    }
                  />
                </label>
                <button
                  type="button"
                  className="button-quiet danger"
                  disabled={proposal.items.length === 1}
                  onClick={() =>
                    setProposal((p) => ({
                      ...p,
                      items: p.items.filter((_, n) => n !== i),
                    }))
                  }
                  aria-label={`Remove service ${i + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="proposal-editor-bottom">
            <button
              className="button-secondary"
              type="button"
              disabled={proposal.items.length >= 30}
              onClick={() =>
                setProposal((p) => ({
                  ...p,
                  items: [
                    ...p.items,
                    { description: "", quantity: 1, unitPrice: 0 },
                  ],
                }))
              }
            >
              <Plus size={15} />
              Add service
            </button>
            <label>
              Tax rate (%)
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={Number.isNaN(proposal.taxRate) ? "" : proposal.taxRate}
                onChange={(e) =>
                  setProposal((p) => ({
                    ...p,
                    taxRate:
                      e.target.value === "" ? NaN : Number(e.target.value),
                  }))
                }
              />
              <small>Set the applicable rate for this engagement.</small>
            </label>
            <div className="proposal-editor-total">
              <small>Total including entered tax</small>
              <strong>{money(totals.total || 0)}</strong>
            </div>
          </div>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p className="request-confirmation" role="status">
              <CheckCircle2 size={18} />
              Published. The client can now view and download this proposal.
            </p>
          )}
          <div className="proposal-publish">
            <p>
              Publishing makes these fees and scope visible to this client
              immediately.
            </p>
            <button className="button-primary" disabled={busy}>
              {busy ? "Publishing…" : "Publish for client"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
