"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui-store";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";

export function SignupForm() {
  const router = useRouter();
  const pushToast = useUiStore((state) => state.pushToast);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", workspaceName: "", password: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await register(form);
      pushToast({ title: "Workspace created.", description: "Your account is ready and signed in.", tone: "success" });
      router.push("/dashboard");
    } catch (error) {
      pushToast({ title: "Sign up failed.", description: error.message, tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Start with a clean security cockpit for scans, findings, and developer-ready fixes."
      submitLabel={submitting ? "Creating account..." : "Create account"}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
            Log in
          </Link>
        </>
      }
      fields={[
        {
          name: "fullName",
          label: "Full name",
          placeholder: "Aisha Khan",
          value: form.fullName,
          onChange: (event) => setForm((current) => ({ ...current, fullName: event.target.value })),
        },
        {
          name: "email",
          type: "email",
          label: "Work email",
          placeholder: "aisha@company.com",
          value: form.email,
          onChange: (event) => setForm((current) => ({ ...current, email: event.target.value })),
        },
        {
          name: "workspaceName",
          label: "Workspace name",
          placeholder: "Acme Security Team",
          value: form.workspaceName,
          onChange: (event) => setForm((current) => ({ ...current, workspaceName: event.target.value })),
        },
        {
          name: "password",
          type: "password",
          label: "Password",
          placeholder: "Create a strong password",
          value: form.password,
          onChange: (event) => setForm((current) => ({ ...current, password: event.target.value })),
        },
      ]}
      onSubmit={handleSubmit}
    >
      <PasswordStrengthMeter password={form.password} />
    </AuthShell>
  );
}
