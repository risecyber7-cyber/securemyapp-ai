"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { resendVerification, verifyEmail } from "@/lib/api";
import { useUiStore } from "@/lib/store/ui-store";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const pushToast = useUiStore((state) => state.pushToast);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const stateLabel = useMemo(() => (token ? "Verification link detected" : "Check your inbox"), [token]);

  useEffect(() => {
    async function runVerification() {
      if (!token) return;
      setVerifying(true);
      try {
        const response = await verifyEmail(token);
        pushToast({ title: "Email verified.", description: response.message, tone: "success" });
      } catch (error) {
        pushToast({ title: "Verification failed.", description: error.message, tone: "error" });
      } finally {
        setVerifying(false);
      }
    }
    runVerification();
  }, [token, pushToast]);

  async function handleResend() {
    if (!email) {
      pushToast({ title: "Email missing.", description: "Open the original verification link or sign in again.", tone: "error" });
      return;
    }
    setResending(true);
    try {
      const response = await resendVerification(email);
      pushToast({ title: "Verification queued.", description: response.message, tone: "success" });
    } catch (error) {
      pushToast({ title: "Could not resend verification.", description: error.message, tone: "error" });
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle="One more step before your workspace is fully ready."
      footer={
        <>
          Need a new link?{" "}
          <button className="font-medium text-orange-600 hover:text-orange-500" onClick={handleResend} type="button">
            {resending ? "Sending..." : "Resend verification"}
          </button>
        </>
      }
    >
      <div className="rounded-[1.6rem] bg-stone-50 p-6 text-center">
        <MailCheck className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">{stateLabel}</p>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {verifying
            ? "Confirming your verification token and enabling secure workspace access..."
            : "We sent a verification link to your inbox. Confirm your email to enable secure workspace access and session controls."}
        </p>
      </div>
      <Link href="/login">
        <Button className="h-12 w-full rounded-2xl text-base">Back to login</Button>
      </Link>
    </AuthCard>
  );
}
