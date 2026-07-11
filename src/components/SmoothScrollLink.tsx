"use client";

import Link from "next/link";
import React from "react";

interface SmoothScrollLinkProps {
  href: string;
  targetId: string;
  children: React.ReactNode;
}

export default function SmoothScrollLink({ href, targetId, children }: SmoothScrollLinkProps) {
  return (
    <Link 
      href={href}
      onClick={(e) => {
        if (window.location.pathname === "/") {
            e.preventDefault();
            document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
        }
      }}
    >
      {children}
    </Link>
  );
}
