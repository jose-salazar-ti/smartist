import CompanyQuoteForm from "./CompanyQuoteForm";
import { Award, ShieldCheck, Flame, Zap, Percent, Clock } from "lucide-react";

export default function EmpresasPage() {
  return (
    <section style={{ paddingTop: '130px', paddingBottom: '80px', minHeight: '100vh', background: 'radial-gradient(circle at top, var(--bg-dark-2) 0%, var(--bg-dark) 80%)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span className="section-label">
            💼 Área Corporativa
          </span>
          <h1 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 48px)', maxWidth: '800px', margin: '0 auto' }}>
            Merchandising y Regalos Corporativos a <span className="gradient-text">Gran Escala</span>
          </h1>
          <p className="section-subtitle" style={{ margin: '0 auto', maxWidth: '640px' }}>
            Fortalece tu identidad de marca con productos personalizados premium. Diseñamos, producimos y enviamos tus regalos corporativos con acabados perfectos.
          </p>
        </div>

        {/* Benefits Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '80px'
        }}>
          {/* Benefit 1 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Calidad Premium Garantizada</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Utilizamos insumos importados de alta gama y tintas de sublimación alemanas para colores vibrantes e inalterables.
            </p>
          </div>

          {/* Benefit 2 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Facturación SUNAT Inmediata</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Somos una empresa formal registrada. Emitimos factura electrónica SUNAT para que puedas declarar sin inconvenientes fiscales.
            </p>
          </div>

          {/* Benefit 3 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Tiempos de Entrega Récord</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
              Taller propio con múltiples prensas automáticas de sublimación. Despachos rápidos para Lima y envíos a todo el Perú en 24-48 horas.
            </p>
          </div>
        </div>

        {/* Info & Quote Form Section */}
        <div style={{
          display: 'grid',
          gap: '50px',
          alignItems: 'start'
        }} className="grid md:grid-cols-2">
          
          {/* Prices & Information (Col 1) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
                ¿Por qué elegirnos para tu merchandising corporativo?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                Entendemos que cada detalle representa a tu organización. Por eso ofrecemos muestras físicas previas antes de iniciar la producción en masa y un control de calidad riguroso en cada pieza.
              </p>
            </div>

            {/* Discount Scale */}
            <div style={{
              background: 'var(--bg-dark-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)' }}>
                <Percent size={18} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  Escala de Descuentos Corporativos
                </h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>De 25 a 50 unidades</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>10% DE DESCUENTO</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>De 51 a 100 unidades</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>15% DE DESCUENTO</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>De 101 a 250 unidades</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>20% DE DESCUENTO</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>De 251 a 500 unidades</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>25% DE DESCUENTO</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Más de 500 unidades</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>30% - 40% DESCUENTO</span>
                </div>
              </div>
            </div>

            {/* Quote Testimonial */}
            <div style={{
              borderLeft: '4px solid var(--primary)',
              paddingLeft: '20px',
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              lineHeight: '1.6',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <p style={{ margin: 0 }}>
                "Pedí 50 tazas con el logo de mi empresa para un evento corporativo y quedaron espectaculares. Los colores del logo corporativo coinciden a la perfección con nuestro branding y la entrega se realizó a tiempo en oficinas."
              </p>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '12px', notStyle: 'normal' } as any}>
                — María Castillo, Gerente de Marketing en TechPeru SAC
              </span>
            </div>
          </div>

          {/* Form (Col 2) */}
          <div>
            <CompanyQuoteForm />
          </div>

        </div>

      </div>
    </section>
  );
}
