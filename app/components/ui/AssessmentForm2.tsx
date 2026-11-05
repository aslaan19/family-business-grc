"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import {
  SECTIONS,
  optionLabel,
  type Field,
  type FormValues,
} from "../../lib/institutional-content";
import { fieldError, invalidFields } from "../../lib/assessment-validation";
import { useDraft, readUser, saveJourney } from "../../lib/journey";
import { Reveal, SectionNav } from "../journey-shell";

const columnLabels = Object.fromEntries(
  SECTIONS.flatMap((s) =>
    s.fields.flatMap((f) => (f.columns ?? []).map((c) => [c.keyEn, c.keyAr])),
  ),
);

export function FieldValue({
  value,
  ar = false,
}: {
  value: unknown;
  ar?: boolean;
}) {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && !value.length)
  )
    return (
      <span className="muted">{ar ? "لم تُضف بيانات" : "Not provided"}</span>
    );
  if (Array.isArray(value))
    return (
      <div className="response-rows">
        {value.map((row, i) => (
          <div className="response-row" key={i}>
            {Object.entries(row as Record<string, string>).map(([key, val]) => (
              <span key={key}>
                <small>{ar ? (columnLabels[key] ?? key) : key}</small>
                <b>{optionLabel(String(val || "—"), ar)}</b>
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  if (value === "Yes" || value === "No")
    return (
      <span className="status-pill">
        {ar ? (value === "Yes" ? "نعم" : "لا") : String(value)}
      </span>
    );
  return (
    <span className="response-text">{optionLabel(String(value), ar)}</span>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  ar,
  invalid,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  ar: boolean;
  invalid: boolean;
}) {
  const id = `field-${field.key}`;
  const shared = {
    id,
    "aria-invalid": invalid,
    "aria-describedby": invalid ? `${id}-error` : undefined,
  };
  if (field.type === "yesno")
    return (
      <div className="answer-options compact">
        {["Yes", "No"].map((v) => (
          <label
            key={v}
            className={`answer-option ${value === v ? "selected" : ""}`}
          >
            <input
              type="radio"
              name={field.key}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              aria-label={`${ar ? field.labelAr : field.labelEn}: ${ar ? (v === "Yes" ? "نعم" : "لا") : v}`}
            />
            <span className="answer-radio">
              {value === v && <Check size={14} />}
            </span>
            {ar ? (v === "Yes" ? "نعم" : "لا") : v}
          </label>
        ))}
      </div>
    );
  if (field.type === "table") {
    const rows = Array.isArray(value)
      ? (value as Record<string, string>[])
      : [];
    return (
      <div className="repeatable-field">
        {rows.map((row, index) => (
          <div className="entry-card" key={index}>
            <div className="entry-heading">
              <b>{ar ? `السجل ${index + 1}` : `Entry ${index + 1}`}</b>
              <button
                type="button"
                className="button-quiet danger"
                aria-label={
                  ar ? `حذف السجل ${index + 1}` : `Remove entry ${index + 1}`
                }
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="form-grid">
              {field.columns?.map((col) => (
                <label key={col.keyEn}>
                  {ar ? col.keyAr : col.keyEn}
                  {col.type === "select" ? (
                    <select
                      value={row[col.keyEn] ?? ""}
                      onChange={(e) =>
                        onChange(
                          rows.map((r, i) =>
                            i === index
                              ? { ...r, [col.keyEn]: e.target.value }
                              : r,
                          ),
                        )
                      }
                    >
                      <option value="">{ar ? "اختر…" : "Select…"}</option>
                      {col.options?.map((o) => (
                        <option key={o} value={o}>
                          {optionLabel(o, ar)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      maxLength={500}
                      value={row[col.keyEn] ?? ""}
                      onChange={(e) =>
                        onChange(
                          rows.map((r, i) =>
                            i === index
                              ? { ...r, [col.keyEn]: e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="button-secondary"
          onClick={() =>
            onChange([
              ...rows,
              Object.fromEntries(
                (field.columns ?? []).map((c) => [c.keyEn, ""]),
              ),
            ])
          }
        >
          <Plus size={16} />
          {ar ? "إضافة سجل" : "Add an entry"}
        </button>
        <p className="form-note">
          {ar
            ? "أكمل حقول كل سجل تضيفه، أو احذف السجلات غير المطلوبة."
            : "Complete each entry you add, or remove entries you do not need."}
        </p>
      </div>
    );
  }
  if (field.type === "select")
    return (
      <select
        {...shared}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{ar ? "اختر…" : "Select…"}</option>
        {field.options?.map((o) => (
          <option key={o} value={o}>
            {optionLabel(o, ar)}
          </option>
        ))}
      </select>
    );
  if (field.type === "textarea")
    return (
      <textarea
        {...shared}
        rows={4}
        maxLength={10000}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          ar ? "أضف التفاصيل هنا…" : field.placeholder || "Add details here…"
        }
      />
    );
  return (
    <input
      {...shared}
      type={field.type === "number" ? "number" : "text"}
      step={field.key === "profitabilityPct" ? "any" : "1"}
      min={
        field.key === "yearEstablished"
          ? 1800
          : field.key === "profitabilityPct"
            ? -100
            : field.type === "number"
              ? 0
              : undefined
      }
      max={
        field.key === "yearEstablished"
          ? new Date().getFullYear()
          : field.key === "profitabilityPct"
            ? 100
            : undefined
      }
      maxLength={2000}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function AssessmentForm2({
  onSubmitComplete,
}: {
  onSubmitComplete?: () => void;
}) {
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  const router = useRouter();
  const user = readUser();
  const draftKey = `karam:a2:${user?.id}`;
  const {
    value: values,
    setValue: setValues,
    ready,
    saved,
  } = useDraft<FormValues>(draftKey, {});
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const section = SECTIONS[index];
  const titles = SECTIONS.map((s) => (ar ? s.titleAr : s.titleEn));
  const required = SECTIONS.flatMap((s) => s.fields.filter((f) => f.required));
  const answered = required.filter((f) => !fieldError(f, values[f.key])).length;
  function complete(i: number) {
    const fields = SECTIONS[i].fields;
    return (
      fields.every((f) => !fieldError(f, values[f.key])) &&
      fields.some((f) => values[f.key] !== undefined && values[f.key] !== "")
    );
  }
  function go(i: number, isReview = false) {
    setIndex(i);
    setReview(isReview);
    setErrors([]);
    setError("");
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  function validate() {
    const missing = section.fields
      .filter((f) => fieldError(f, values[f.key]))
      .map((f) => f.key);
    setErrors(missing);
    if (missing.length) {
      setError(
        ar
          ? "تحقق من الحقول المحددة أدناه."
          : "Please check the highlighted fields below.",
      );
      requestAnimationFrame(() =>
        document
          .getElementById(`group-${missing[0]}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
    }
    return !missing.length;
  }
  async function submit() {
    if (busy || !user || invalidFields(values).length) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/submissions2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, formData: values }),
      });
      if (!res.ok && res.status !== 409) throw new Error();
      saveJourney(user, true, true);
      localStorage.removeItem(draftKey);
      onSubmitComplete?.();
      router.push("/proposal");
    } catch {
      setError(
        ar
          ? "تعذر إرسال التقييم. إجاباتك باقية؛ حاول مرة أخرى."
          : "We could not submit your assessment. Your answers are still here; please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!ready)
    return (
      <p role="status" className="loading-state">
        {ar ? "جارٍ تحميل إجاباتك…" : "Loading your answers…"}
      </p>
    );
  return (
    <>
      <div className="assessment-heading">
        <div>
          <span className="eyebrow">
            02 / {ar ? "التقييم المؤسسي" : "INSTITUTIONAL ASSESSMENT"}
          </span>
          <h1>{ar ? "لنكمل الصورة." : "Let’s complete the picture."}</h1>
          <p>
            {ar
              ? "عرّفنا بمنشأتك وأولوياتها. الحقول بعلامة * مطلوبة؛ أضف ما يناسبك من التفاصيل الأخرى."
              : "Tell us about your business and priorities. Fields marked * are required; add other details where relevant."}
          </p>
        </div>
        <div className="save-status">
          <ShieldCheck size={16} />
          {saved
            ? ar
              ? "يُحفظ تقدمك على هذا الجهاز"
              : "Progress saved on this device"
            : ar
              ? "تعذر الحفظ على هذا الجهاز"
              : "Device storage unavailable"}
        </div>
      </div>
      <div className="assessment-progress">
        <div>
          <span>{ar ? "الحقول المطلوبة" : "REQUIRED DETAILS"}</span>
          <strong dir="ltr">
            {answered}
            <small> / {required.length}</small>
          </strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label={
            ar ? "الحقول المطلوبة المكتملة" : "Required details completed"
          }
          aria-valuenow={answered}
          aria-valuemin={0}
          aria-valuemax={required.length}
        >
          <span style={{ width: `${(answered / required.length) * 100}%` }} />
        </div>
        <b>{Math.round((answered / required.length) * 100)}%</b>
      </div>
      <div className="assessment-layout">
        <SectionNav
          titles={titles}
          active={index}
          complete={complete}
          onSelect={(i) => go(i)}
          review={review}
        />
        <section className="question-panel">
          <div className="panel-heading">
            <span className="eyebrow" dir={review ? undefined : "ltr"}>
              {review
                ? ar
                  ? "الخطوة الأخيرة"
                  : "FINAL CHECK"
                : `0${index + 1} / 0${SECTIONS.length}`}
            </span>
            <h2 ref={heading} tabIndex={-1}>
              {review
                ? ar
                  ? "راجع ملف منشأتك"
                  : "Review your business profile"
                : titles[index]}
            </h2>
            <p>
              {review
                ? ar
                  ? "تأكد من صحة بياناتك قبل إرسالها لفريقنا."
                  : "Check your details before sharing them with our team."
                : ar
                  ? "املأ ما ينطبق على منشأتك اليوم."
                  : "Describe your business as it stands today."}
            </p>
          </div>
          <Reveal key={review ? "review" : index} className="question-body">
            {review
              ? SECTIONS.map((s, i) => (
                  <div className="review-section" key={s.id}>
                    <div>
                      <h3>{titles[i]}</h3>
                      <button className="text-button" onClick={() => go(i)}>
                        {ar ? "تعديل" : "Edit"}
                      </button>
                    </div>
                    {s.fields.map((f) => (
                      <div className="review-answer" key={f.key}>
                        <p>{ar ? f.labelAr : f.labelEn}</p>
                        <FieldValue value={values[f.key]} ar={ar} />
                      </div>
                    ))}
                  </div>
                ))
              : section.fields.map((f) => (
                  <div
                    className={`field-group ${errors.includes(f.key) ? "has-error" : ""}`}
                    id={`group-${f.key}`}
                    key={f.key}
                  >
                    <label
                      htmlFor={
                        f.type === "yesno" || f.type === "table"
                          ? undefined
                          : `field-${f.key}`
                      }
                      className="field-label"
                    >
                      {ar ? f.labelAr : f.labelEn}{" "}
                      {f.required ? (
                        <span className="required-star">*</span>
                      ) : (
                        <small>{ar ? "اختياري" : "Optional"}</small>
                      )}
                    </label>
                    <FieldInput
                      field={f}
                      value={values[f.key]}
                      ar={ar}
                      invalid={errors.includes(f.key)}
                      onChange={(v) => {
                        setValues((prev) => ({ ...prev, [f.key]: v }));
                        setErrors((prev) => prev.filter((k) => k !== f.key));
                      }}
                    />
                    {errors.includes(f.key) && (
                      <p className="field-error" id={`field-${f.key}-error`}>
                        {fieldError(f, values[f.key]) === "table"
                          ? ar
                            ? "أكمل كل حقول السجل أو احذفه."
                            : "Complete every field in each entry, or remove the entry."
                          : fieldError(f, values[f.key]) === "number"
                            ? ar
                              ? "أدخل رقماً صحيحاً ضمن النطاق المسموح."
                              : "Enter a valid number within the allowed range."
                            : ar
                              ? "هذا الحقل مطلوب."
                              : "This field is required."}
                      </p>
                    )}
                  </div>
                ))}
          </Reveal>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          <div className="assessment-controls">
            <button
              className="button-secondary"
              disabled={busy || (!index && !review)}
              onClick={() => go(review ? SECTIONS.length - 1 : index - 1)}
            >
              <ArrowLeft size={16} className="direction-arrow" />
              {ar ? "السابق" : "Previous"}
            </button>
            <span>
              {review
                ? ar
                  ? "تُرسل البيانات بعد تأكيدك"
                  : "Shared only when you submit"
                : ar
                  ? `القسم ${index + 1} من ${SECTIONS.length}`
                  : `Section ${index + 1} of ${SECTIONS.length}`}
            </span>
            <button
              className="button-primary"
              disabled={busy}
              onClick={() => {
                if (review) {
                  void submit();
                  return;
                }
                if (!validate()) return;
                if (index === SECTIONS.length - 1) {
                  const invalid = invalidFields(values);
                  if (invalid.length) {
                    const i = SECTIONS.findIndex((s) =>
                      s.fields.some((f) => invalid.includes(f.key)),
                    );
                    go(i);
                    setErrors(invalid);
                    setError(
                      ar
                        ? "أكمل الحقول المحددة قبل المراجعة."
                        : "Complete the highlighted fields before reviewing.",
                    );
                  } else go(index, true);
                } else go(index + 1);
              }}
            >
              {busy ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <ArrowRight size={17} className="direction-arrow" />
              )}
              {review
                ? ar
                  ? "إرسال التقييم"
                  : "Submit assessment"
                : index === SECTIONS.length - 1
                  ? ar
                    ? "مراجعة البيانات"
                    : "Review details"
                  : ar
                    ? "حفظ ومتابعة"
                    : "Save & continue"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
