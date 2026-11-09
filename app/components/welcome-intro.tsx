"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../lib/language-context";
import "./welcome-intro.css";

const SEEN_KEY = "cram:welcome-seen:v1";
let seenThisSession = false;

export default function WelcomeIntro() {
  const { dir } = useLanguage();
  const ar = dir === "rtl";
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dismissRef = useRef<() => void>(() => {});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || pathname.startsWith("/admin") || seenThisSession) return;

    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      // Memory still prevents repeat intros when browser storage is unavailable.
    }

    // Respect visitors who have asked their device to reduce animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const previousOverflow = document.body.style.overflow;
    let autoDismiss: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const dismiss = () => {
      if (!dialog.open || dialog.dataset.closing) return;
      dialog.dataset.closing = "true";
      closeTimer = setTimeout(() => {
        dialog.close();
        document.body.style.overflow = previousOverflow;
      }, 650);
    };
    dismissRef.current = dismiss;
    // Defer until the effect is committed, including React Strict Mode's replay.
    const frame = requestAnimationFrame(() => {
      delete dialog.dataset.closing;
      dialog.showModal();
      document.body.style.overflow = "hidden";
      seenThisSession = true;
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {
        // The platform remains usable with storage disabled.
      }
      autoDismiss = setTimeout(dismiss, 3600);
    });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(autoDismiss);
      clearTimeout(closeTimer);
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [pathname]);

  return (
    <dialog
      ref={dialogRef}
      className="welcome-intro"
      dir={dir}
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      onCancel={(event) => {
        event.preventDefault();
        dismissRef.current();
      }}
    >
      <div className="welcome-grid" aria-hidden="true" />
      <div className="welcome-aura" aria-hidden="true" />
      <div className="welcome-topline">
        <span dir="ltr">CRAM<span className="welcome-gold">.</span></span>
        <span>{ar ? "إرث ينمو. مستقبل يُبنى." : "LEGACY GROWS. THE FUTURE BEGINS."}</span>
      </div>

      <div className="welcome-content">
        <div className="welcome-emblem" aria-hidden="true">
          <div className="welcome-orbit welcome-orbit-outer" />
          <div className="welcome-orbit welcome-orbit-inner" />
          <svg className="welcome-trace" viewBox="0 0 240 240" fill="none">
            <path d="M120 222V174M120 174L77 143M120 174L163 143M120 174V119M120 119L90 89M120 119L150 89M120 119V40" />
            <circle cx="120" cy="40" r="4" />
            <circle cx="90" cy="89" r="4" />
            <circle cx="150" cy="89" r="4" />
            <circle cx="77" cy="143" r="4" />
            <circle cx="163" cy="143" r="4" />
          </svg>
          <div className="welcome-logo">
            <Image src="/images/logo.png" width={72} height={72} alt="" loading="eager" />
          </div>
          <span className="welcome-orbit-point" />
        </div>
        <p className="welcome-eyebrow">{ar ? "أهلاً بك في كرام" : "WELCOME TO CRAM"}</p>
        <h1 id="welcome-title">
          {ar ? "إرثك يستحق" : "Your legacy deserves"}
          <span>{ar ? "مستقبلاً استثنائياً." : "an extraordinary future."}</span>
        </h1>
        <p id="welcome-description" className="welcome-description">
          {ar ? "معاً، نبدأ رحلة التميز في أعمالك العائلية." : "Together, we begin your family business’s next chapter."}
        </p>
        <div className="welcome-chapters" aria-hidden="true">
          <span>{ar ? "حوكمة" : "Governance"}</span><i />
          <span>{ar ? "نمو" : "Growth"}</span><i />
          <span>{ar ? "استدامة" : "Legacy"}</span>
        </div>
      </div>

      <div className="welcome-bottomline">
        <span>{ar ? "كل إرث عظيم يبدأ بخطوة" : "EVERY LASTING LEGACY STARTS WITH A STEP"}</span>
        <button type="button" onClick={() => dismissRef.current()}>
          {ar ? "تخطي المقدمة" : "Skip intro"}<ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="welcome-progress" aria-hidden="true"><span /></div>
    </dialog>
  );
}
