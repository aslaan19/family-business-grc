"use client";
import { useCallback, useEffect, useState } from "react";
export interface ReportAnswer {
  selectedValue: number;
  selectedLabel: string;
  question: {
    categoryKey: string;
    categoryOrder: number;
    questionOrder: number;
    titleEn: string;
    titleAr: string;
    questionEn: string;
    questionAr: string;
  };
}
export interface AssessmentData {
  id: string;
  totalScore: number;
  maxScore: number;
  pct: number | null;
  submittedAt: string;
  answers: ReportAnswer[];
  rawPayload: Record<string, unknown>;
  catBreakdown: Record<string, { score: number; max: number; pct: number }>;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  createdAt: string;
  stage: "registered" | "assessment1_done" | "proposal_ready";
  assessment1: AssessmentData | null;
  assessment2: AssessmentData | null;
}
export function useAdminData() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users);
    } catch {
      setError(
        "We could not load the workspace. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  return { users, loading, error, refresh };
}
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export function userStage(user: AdminUser) {
  if (user.assessment2?.rawPayload._financialProposal)
    return "Proposal published";
  if (user.assessment2?.rawPayload._proposalRequestedAt)
    return "Proposal requested";
  if (user.assessment2) return "Both assessments complete";
  if (user.assessment1) return "Institutional assessment next";
  return "Governance assessment next";
}
