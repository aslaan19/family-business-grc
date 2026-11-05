export interface FinancialProposal {
  title: string;
  scope: string;
  items: { description: string; quantity: number; unitPrice: number }[];
  taxRate: number;
  issuedAt: string;
  validUntil: string;
  reference: string;
}
export function validProposal(value: unknown): value is FinancialProposal {
  if (!value || typeof value !== "object") return false;
  const p = value as FinancialProposal;
  return (
    typeof p.title === "string" &&
    !!p.title.trim() &&
    p.title.length <= 160 &&
    typeof p.scope === "string" &&
    !!p.scope.trim() &&
    p.scope.length <= 10000 &&
    Array.isArray(p.items) &&
    p.items.length > 0 &&
    p.items.length <= 30 &&
    p.items.every(
      (i) =>
        !!i &&
        typeof i.description === "string" &&
        !!i.description.trim() &&
        i.description.length <= 500 &&
        Number.isFinite(i.quantity) &&
        i.quantity > 0 &&
        i.quantity <= 100000 &&
        Number.isFinite(i.unitPrice) &&
        i.unitPrice >= 0 &&
        i.unitPrice <= 1e9,
    ) &&
    Number.isFinite(p.taxRate) &&
    p.taxRate >= 0 &&
    p.taxRate <= 100 &&
    typeof p.validUntil === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(p.validUntil) &&
    !Number.isNaN(Date.parse(p.validUntil))
  );
}
export function proposalTotals(proposal: FinancialProposal) {
  const subtotal =
    Math.round(
      proposal.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) *
        100,
    ) / 100;
  const tax = Math.round(subtotal * proposal.taxRate) / 100;
  return { subtotal, tax, total: subtotal + tax };
}
export function money(value: number, ar = false) {
  return new Intl.NumberFormat(ar ? "ar-SA" : "en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(value);
}
