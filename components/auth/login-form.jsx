"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui-store";
import { AuthShell } from "@/components/auth/auth-shell";

export function LoginForm() {
  const router = useRouter();
  const pushToast = useUiStore((state) => state.pushToast);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      pushToast({ title: "Welcome back.", description: "Your workspace session is ready.", tone: "success" });
      router.push("/dashboard");
    } catch (error) {
      pushToast({ title: "Login failed.", description: error.message, tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to review scans, fixes, and reports from your team workspace."
      submitLabel={submitting ? "Logging in..." : "Log in"}
      auxiliaryLink={{ href: "/forgot-password", label: "Forgot password?" }}
      footer={
        <>
          New to SecureMyApp AI?{" "}
          <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500">
            Create an account
          </Link>
        </>
      }
      fields={[
        {
          name: "email",
          type: "email",
          label: "Email",
          placeholder: "name@company.com",
          value: form.email,
          onChange: (event) => setForm((current) => ({ ...current, email: event.target.value })),
        },
        {
          name: "password",
          type: "password",
          label: "Password",
          placeholder: "Enter your password",
          value: form.password,
          onChange: (event) => setForm((current) => ({ ...current, password: event.target.value })),
        },
      ]}
      onSubmit={handleSubmit}
    />
  );
}
