"use client";

import { useCallback, useEffect, useState } from "react";
import type { SavedUser } from "../components/ui/assessment-form-modal";

export function readUser(): SavedUser | null {
  try {
    const user = JSON.parse(localStorage.getItem("karam_user") ?? "null");
    return user?.id && user?.email ? user : null;
  } catch {
    return null;
  }
}

export function saveJourney(user: SavedUser, first: boolean, second: boolean) {
  localStorage.setItem("karam_user", JSON.stringify(user));
  localStorage.setItem("karam_submission_done", String(first));
  localStorage.setItem("karam_submission2_done", String(first && second));
  window.dispatchEvent(new Event("journey-updated"));
}

export function useJourney() {
  const [state, setState] = useState<{
    user: SavedUser | null;
    first: boolean;
    second: boolean;
    loading: boolean;
    error: boolean;
  }>({ user: null, first: false, second: false, loading: true, error: false });
  const refresh = useCallback(async () => {
    const user = readUser();
    if (!user) {
      setState({
        user: null,
        first: false,
        second: false,
        loading: false,
        error: false,
      });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: false }));
    try {
      const res = await fetch("/api/users/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (!res.ok) throw new Error("lookup");
      const data = await res.json();
      saveJourney(data.user, data.hasAssessment1, data.hasAssessment2);
      setState({
        user: data.user,
        first: data.hasAssessment1,
        second: data.hasAssessment1 && data.hasAssessment2,
        loading: false,
        error: false,
      });
    } catch {
      setState({
        user,
        first: false,
        second: false,
        loading: false,
        error: true,
      });
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void refresh(), 0);
    const sync = () => {
      const user = readUser();
      setState({
        user,
        first:
          !!user && localStorage.getItem("karam_submission_done") === "true",
        second:
          !!user && localStorage.getItem("karam_submission2_done") === "true",
        loading: false,
        error: false,
      });
    };
    window.addEventListener("journey-updated", sync);
    window.addEventListener("storage", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("journey-updated", sync);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);
  return { ...state, refresh };
}

export function useDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : initial;
        setValue(
          parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed
            : initial,
        );
      } catch {
        setValue(initial);
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
    // The initial value is used only when opening this user-scoped draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [key, value, ready]);
  return { value, setValue, ready, saved };
}
