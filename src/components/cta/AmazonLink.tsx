"use client";

import type { ReactNode } from "react";

type GtagFn = (
  command: "event",
  eventName: string,
  params: Record<string, unknown>,
) => void;

type AmazonLinkProps = {
  href: string;
  bookId?: string;
  location: "card" | "inline" | "sidebar";
  topic?: string;
  className?: string;
  children: ReactNode;
};

export function AmazonLink({
  href,
  bookId,
  location,
  topic,
  className,
  children,
}: AmazonLinkProps) {
  const handleClick = () => {
    const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "amazon_click", {
        link_url: href,
        book_id: bookId,
        location,
        topic,
      });
    }
  };
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}