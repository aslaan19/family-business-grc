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
    getStoredUser(),
  );
  const [isModalOpen, setIsModalOpen] = useState(() => !getStoredUser());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');

        .assessment-page-bg {
          min-height: 100vh;
          background-color: #f3f8ed;
          background-image:
            radial-gradient(ellipse at 0% 0%, #e8f3de 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, #e6f0dc 0%, transparent 50%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a6b3c' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      <main className="assessment-page-bg px-4 py-8 md:px-8 md:py-10" dir={dir}>
        <AssessmentFormModal
          isOpen={isModalOpen}
          onClose={() => {
            if (currentUser) setIsModalOpen(false);
          }}
          onSubmit={(user) => {
            setCurrentUser(user);
            setIsModalOpen(false);
          }}
        />

        <div className="mx-auto w-full max-w-[1200px]">
          <AssessmentForm
            currentUser={currentUser}
            onSubmitComplete={(answers, totalScore) => {
              console.log("Answers:", answers);
              console.log("Score:", totalScore);
            }}
          />
        </div>
      </main>
    </>
  );
}
