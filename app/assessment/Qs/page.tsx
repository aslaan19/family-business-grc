"use client";

import { useState } from "react";
import { useLanguage } from "../../lib/language-context";
import { AssessmentForm } from "../../components/ui/AssessmentForm";
import {
  AssessmentFormModal,
  USER_STORAGE_KEY,
  type SavedUser,
} from "../../components/ui/assessment-form-modal";

function getStoredUser(): SavedUser | null {
  if (typeof window === "undefined") return null;

  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser) as SavedUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export default function AssessmentQsPage() {
  const { dir } = useLanguage();

  const [currentUser, setCurrentUser] = useState<SavedUser | null>(() =>
    getStoredUser()
  );

  const [isModalOpen, setIsModalOpen] = useState(() => !getStoredUser());

  return (
    <main
      className="min-h-screen bg-background px-4 py-4 md:px-6 md:py-6"
      dir={dir}
    >
      <AssessmentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          if (currentUser) {
            setIsModalOpen(false);
          }
        }}
        onSubmit={(user) => {
          setCurrentUser(user);
          setIsModalOpen(false);
        }}
      />

      <div className="mx-auto w-full max-w-[1500px]">
        <div className="bg-card border border-border rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg min-h-[calc(100vh-3rem)]">
          <AssessmentForm
            currentUser={currentUser}
            onSubmitComplete={(answers, totalScore) => {
              console.log("Answers:", answers);
              console.log("Score:", totalScore);
            }}
          />
        </div>
      </div>
    </main>
  );
}