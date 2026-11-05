import { SECTIONS, type Field, type FormValues } from "./institutional-content";

export function fieldError(
  field: Field,
  value: unknown,
): "required" | "number" | "table" | "choice" | null {
  const empty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && !value.trim()) ||
    (Array.isArray(value) && !value.length);
  if (empty) return field.required ? "required" : null;
  if (field.type === "table") {
    if (
      !Array.isArray(value) ||
      value.some(
        (row) =>
          !row ||
          typeof row !== "object" ||
          field.columns?.some(
            (col) =>
              typeof row[col.keyEn] !== "string" ||
              !row[col.keyEn].trim() ||
              (col.options && !col.options.includes(row[col.keyEn])),
          ),
      )
    )
      return "table";
  } else if (typeof value !== "string") return "choice";
  else if (field.type === "yesno" && !["Yes", "No"].includes(value))
    return "choice";
  else if (field.type === "select" && !field.options?.includes(value))
    return "choice";
  else if (field.type === "number") {
    const n = Number(value);
    if (!Number.isFinite(n)) return "number";
    if (
      field.key === "yearEstablished" &&
      (!Number.isInteger(n) || n < 1800 || n > new Date().getFullYear())
    )
      return "number";
    if (
      field.key === "profitabilityPct"
        ? n < -100 || n > 100
        : n < 0 || !Number.isInteger(n)
    )
      return "number";
  }
  return null;
}

export function invalidFields(values: FormValues) {
  return SECTIONS.flatMap((section) =>
    section.fields
      .filter((field) => fieldError(field, values[field.key]))
      .map((field) => field.key),
  );
}
