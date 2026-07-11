import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SmoothScrollLink from "./SmoothScrollLink";
import { Ajustes, MetodoPago } from "@prisma/client";

export default async function Footer() {
  let settingsList: Ajustes[] = [];
  let paymentMethods: MetodoPago[] = [];
  try {
    settingsList = await prisma.ajustes.findMany();
    paymentMethods = await prisma.metodoPago.findMany({
      where: { inEstado: true },
      orderBy: { nombre: 'asc' }
    });
  } catch (err) {
    console.error("Error loading settings/payments in footer:", err);
  }

  const settings = settingsList.reduce((acc: Record<string, string>, curr) => {
    acc[curr.clave] = curr.valor;
    return acc;
  }, {
    whatsappNumber: "51999999999",
    contactEmail: "hola@smartist.pe",
    address: "Miraflores, Lima, Perú",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    tiktokUrl: "https://tiktok.com"
  });

  const getFormattedPhone = () => {
    const raw = settings.whatsappNumber;
    if (raw && raw.startsWith("51") && raw.length === 11) {
      return `+51 ${raw.slice(2, 5)} ${raw.slice(5, 8)} ${raw.slice(8)}`;
    }
    return raw;
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="navbar-logo" style={{ marginBottom: "4px" }}>
              <span className="navbar-logo-text">Smart<span>ist</span></span>
            </Link>
            <p className="footer-brand-desc">
              Transformamos tus ideas y recuerdos en productos sublimados premium con los más altos estándares de color y detalle.
            </p>
            <div className="footer-socials">
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                  </svg>
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.74-3.94-1.78-.22-.22-.41-.47-.58-.73v7.02c0 3.74-3.07 6.77-6.81 6.77-3.81.04-7.05-2.98-7.08-6.79C3.99 10.96 7.15 7.78 11 7.82V12c-1.92-.08-3.55 1.43-3.64 3.35-.11 2.19 1.63 3.99 3.82 4.02 2.14.03 3.93-1.63 3.99-3.77V.02z" />
                  </svg>
                </a>
              )}
              {settings.whatsappNumber && (
                <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="footer-social" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.966.01c3.179.001 6.169 1.24 8.425 3.496 2.257 2.256 3.493 5.244 3.491 8.425-.003 6.617-5.34 11.955-11.913 11.955-2.005-.001-3.973-.505-5.717-1.464L0 24zm6.59-4.846c1.6.95 3.198 1.453 4.937 1.454 5.41.002 9.813-4.394 9.815-9.804.001-2.621-1.02-5.086-2.877-6.942-1.856-1.856-4.321-2.876-6.94-2.877-5.418 0-9.82 4.397-9.823 9.808-.001 1.777.466 3.513 1.353 5.048l-.995 3.636 3.73-.977zm11.168-5.138c-.307-.154-1.82-.9-2.1-.1-.28.1-.55.55-.68.7-.13.15-.27.17-.58.02-.307-.154-1.3-.48-2.477-1.53-.915-.817-1.533-1.827-1.713-2.135-.18-.307-.02-.473.134-.627.14-.138.307-.358.462-.538.153-.18.2-.307.307-.513.103-.205.05-.385-.026-.538-.077-.154-.68-1.64-.93-2.246-.247-.59-.5-.51-.68-.52-.18 0-.39-.01-.6-.01-.21 0-.55.08-.84.4-.29.32-1.1.98-1.1 2.4s1.03 2.78 1.17 2.98c.15.2 2.03 3.1 4.92 4.35.688.298 1.224.475 1.64.607.69.22 1.32.19 1.82.11.557-.084 1.82-.743 2.08-1.47.26-.72.26-1.34.18-1.47-.08-.13-.3-.2-.6-.35z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div>
            <h3 className="footer-heading">Categorías</h3>
            <div className="footer-links">
              <Link href="/productos?category=Tazas">Tazas Cerámicas</Link>
              <Link href="/productos?category=Tazas">Tazas Mágicas</Link>
              <Link href="/productos?category=Ropa">Polo Tacto Algodón</Link>
              <Link href="/productos?category=Oficina">Mousepad de Neopreno</Link>
              <Link href="/productos?category=Parejas">Rompecabezas Corazón</Link>
              <Link href="/productos?category=Parejas">Fotoroca Pizarra</Link>
            </div>
          </div>
          <div>
            <h3 className="footer-heading">Servicios y Enlaces</h3>
            <div className="footer-links">
              <Link href="/empresas">Para Empresas (Volumen)</Link>
              <Link href="/emprendedores">Emprendedores (Drop-shipping)</Link>
              <Link href="/productos?customizable=true">Artículos Personalizados</Link>
              <Link href="/regalos?recipient=enamorados">Regalos para Enamorados</Link>
              <Link href="/regalos">Ideas de Regalo</Link>
              <Link href="/contacto">Contacto & Soporte</Link>
              <SmoothScrollLink href="/#como-funciona" targetId="como-funciona">
                ¿Cómo Funciona?
              </SmoothScrollLink>
            </div>
          </div>
          <div>
            <h3 className="footer-heading">Contacto Taller</h3>
            {settings.whatsappNumber && (
              <div className="footer-contact-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <span>{getFormattedPhone()}</span>
              </div>
            )}
            {settings.contactEmail && (
              <div className="footer-contact-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>{settings.contactEmail}</span>
              </div>
            )}
            {settings.address && (
              <div className="footer-contact-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>{settings.address}</span>
              </div>
            )}
            <div className="footer-contact-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Lun - Sáb: 9am - 7pm</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <p>© 2026 Smartist. Todos los derechos reservados.</p>
          
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', opacity: 0.8 }} className="footer-legal-links">
            <Link href="/politica-de-privacidad" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-indigo-500">Política de Privacidad</Link>
            <Link href="/terminos-y-condiciones" style={{ color: 'inherit', textDecoration: 'none' }} className="hover:text-indigo-500">Términos y Condiciones</Link>
          </div>

          {paymentMethods.length > 0 && (
            <div className="footer-payments" style={{ marginTop: '4px' }}>
              {paymentMethods.map(method => (
                <span key={method.id} className="payment-badge">{method.nombre}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
