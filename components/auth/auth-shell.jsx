"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { OAuthPlaceholder } from "@/components/auth/oauth-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthShell({
  title,
  subtitle,
  fields,
  footer,
  submitLabel,
  auxiliaryLink,
  children,
  onSubmit,
}) {
  return (
    <AuthCard title={title} subtitle={subtitle} footer={footer}>
      <form className="space-y-4" onSubmit={onSubmit}>
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type || "text"}
              placeholder={field.placeholder}
              value={field.value}
              onChange={field.onChange}
            />
          </div>
        ))}

        {children}

        <Button className="h-12 w-full rounded-2xl text-base">{submitLabel}</Button>
      </form>

      {auxiliaryLink ? (
        <div className="flex justify-center">
          <Link href={auxiliaryLink.href} className="text-sm font-medium text-orange-600 hover:text-orange-500">
            {auxiliaryLink.label}
          </Link>
        </div>
      ) : null}

      <OAuthPlaceholder />
    </AuthCard>
  );
}
