"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui-store";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pushToast = useUiStore((state) => state.pushToast);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const token = searchParams.get("token") || "";

  async function handleSubmit(event) {
    event.preventDefault();
    if (!token) {
      pushToast({ title: "Missing reset token.", description: "Open the reset link from your email first.", tone: "error" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      pushToast({ title: "Passwords do not match.", description: "Confirm the same password in both fields.", tone: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token, password: form.password });
      pushToast({ title: "Password updated.", description: "Sign in with your new password.", tone: "success" });
      router.push("/login");
    } catch (error) {
      pushToast({ title: "Reset failed.", description: error.message, tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a strong password and lock the old session history out."
      submitLabel={submitting ? "Updating..." : "Update password"}
      footer={
        <>
          Need to sign in instead?{" "}
          <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Go to login
          </Link>
        </>
      }
      fields={[
        {
          name: "password",
          type: "password",
          label: "New password",
          placeholder: "Enter your new password",
          value: form.password,
          onChange: (event) => setForm((current) => ({ ...current, password: event.target.value })),
        },
        {
          name: "confirmPassword",
          type: "password",
          label: "Confirm password",
          placeholder: "Re-enter your password",
          value: form.confirmPassword,
          onChange: (event) => setForm((current) => ({ ...current, confirmPassword: event.target.value })),
        },
      ]}
      onSubmit={handleSubmit}
    >
      <PasswordStrengthMeter password={form.password} />
    </AuthShell>
  );
}
