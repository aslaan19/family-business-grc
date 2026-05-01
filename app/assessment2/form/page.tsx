"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AssessmentForm2 } from "../../components/ui/AssessmentForm2";
import {
  SUBMISSION_STORAGE_KEY,
  SUBMISSION2_STORAGE_KEY,
} from "../../components/ui/assessment-form-modal";

export default function Assessment2FormPage() {
  const router = useRouter();
  const sub1Done =
    typeof window !== "undefined" &&
    localStorage.getItem(SUBMISSION_STORAGE_KEY) === "true";

  useEffect(() => {
    if (!sub1Done) router.replace("/");
  }, [sub1Done, router]);

  if (!sub1Done) return null;

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <AssessmentForm2
          onSubmitComplete={() => {
            localStorage.setItem(SUBMISSION2_STORAGE_KEY, "true");
            router.push("/");
          }}
        />
      </div>
    </main>
  );
}
