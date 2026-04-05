import type * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card(props: CardProps): JSX.Element;

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader(props: CardHeaderProps): JSX.Element;

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle(props: CardTitleProps): JSX.Element;

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent(props: CardContentProps): JSX.Element;
