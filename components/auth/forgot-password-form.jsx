"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui-store";
import { AuthShell } from "@/components/auth/auth-shell";

export function ForgotPasswordForm() {
  const pushToast = useUiStore((state) => state.pushToast);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await forgotPassword(email);
      pushToast({ title: "Reset flow started.", description: response.message, tone: "success" });
    } catch (error) {
      pushToast({ title: "Could not start reset.", description: error.message, tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will send a secure password reset link."
      submitLabel={submitting ? "Sending..." : "Send reset link"}
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Return to login
          </Link>
        </>
      }
      fields={[
        {
          name: "email",
          type: "email",
          label: "Email",
          placeholder: "name@company.com",
          value: email,
          onChange: (event) => setEmail(event.target.value),
        },
      ]}
      onSubmit={handleSubmit}
    />
  );
}
