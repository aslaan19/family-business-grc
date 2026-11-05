"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  LayoutDashboard,
  Files,
  ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
export default function AdminLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="admin-workspace" dir="ltr">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand">
          <Image src="/images/logo.png" alt="CRAM" width={40} height={40} />
          <span>
            <strong>CRAM.</strong>
            <small>ADVISORY WORKSPACE</small>
          </span>
        </Link>
        <span className="eyebrow">MANAGE</span>
        <nav>
          <Link className={path === "/admin" ? "active" : ""} href="/admin">
            <LayoutDashboard size={17} />
            Overview
          </Link>
          <Link
            className={path.startsWith("/admin/reports") ? "active" : ""}
            href="/admin/reports"
          >
            <Files size={17} />
            Reports library
          </Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <ShieldCheck size={18} />
          <p>
            Governance, with perspective.
            <small>Client assessment management</small>
          </p>
          <Link href="/">
            View public website
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar">
          <span>
            WORKSPACE <span>/</span>{" "}
            {path.includes("reports") ? "REPORTS" : "OVERVIEW"}
          </span>
          <span className="admin-access">
            <span />
            Administrator
          </span>
        </header>
        <main id="main-content" className="admin-main">
          {children}
        </main>
        <footer className="admin-footer">
          CRAM Consulting <span>Private client information · Internal use</span>
        </footer>
      </div>
    </div>
  );
}
