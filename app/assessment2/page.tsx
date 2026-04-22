"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentForm2 } from "../components/ui/AssessmentForm2";
import { SUBMISSION_STORAGE_KEY, SUBMISSION2_STORAGE_KEY } from "../components/ui/assessment-form-modal";


export default function Assessment2Page() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Must have completed assessment 1 to access this page
    const sub1Done = localStorage.getItem(SUBMISSION_STORAGE_KEY) === "true";
    if (!sub1Done) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, [router]);

  function handleComplete() {
    localStorage.setItem(SUBMISSION2_STORAGE_KEY, "true");
    router.push("/");
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <AssessmentForm2 onSubmitComplete={handleComplete} />
      </div>
    </main>
  );
}