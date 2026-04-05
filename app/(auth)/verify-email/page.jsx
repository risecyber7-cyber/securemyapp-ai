import { Suspense } from "react";
import { VerifyEmailView } from "@/components/auth/verify-email-view";

export const metadata = {
  title: "Verify Email | SecureMyApp AI",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyEmailView />
    </Suspense>
  );
}
