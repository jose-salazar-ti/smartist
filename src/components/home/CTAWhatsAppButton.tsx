"use client";

import React, { useState, useEffect } from "react";

export default function CTAWhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState("51999999999");

  useEffect(() => {
    async function loadWhatsapp() {
      try {
        const res = await fetch("/api/admin/ajustes");
        if (res.ok) {
          const data = await res.json();
          if (data.whatsappNumber) {
            setPhoneNumber(data.whatsappNumber);
          }
        }
      } catch (err) {
        console.error("Failed to load whatsapp number for CTA", err);
      }
    }
    loadWhatsapp();
  }, []);

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-ghost"
    >
      💬 Escríbenos por WhatsApp
    </a>
  );
}
