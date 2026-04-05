import type * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: string;
}

export function Badge(props: BadgeProps): JSX.Element;
