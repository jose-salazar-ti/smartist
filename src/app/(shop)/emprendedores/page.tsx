import ResellerRegisterForm from "./ResellerRegisterForm";
import { Sparkles, ArrowRight, ShieldAlert, DollarSign, PackageOpen } from "lucide-react";

export default function EmprendedoresPage() {
  return (
    <section style={{ paddingTop: '130px', paddingBottom: '80px', minHeight: '100vh', background: 'radial-gradient(circle at top, var(--bg-dark-2) 0%, var(--bg-dark) 80%)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span className="section-label">
            🚀 Programa Dropshipping POD
          </span>
          <h1 className="section-title" style={{ fontSize: 'clamp(36px, 5vw, 48px)', maxWidth: '850px', margin: '0 auto' }}>
            Lanza tu marca de personalizados <span className="gradient-text">Sin Stock</span>
          </h1>
          <p className="section-subtitle" style={{ margin: '0 auto', maxWidth: '640px' }}>
            Nosotros fabricamos y enviamos tus productos directamente a tus clientes con empaques neutros. Tú solo te preocupas por vender y diseñar.
          </p>
        </div>

        {/* POD Model Steps */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '80px'
        }}>
          {/* Step 1 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 24px',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-15px', left: '24px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', border: '3px solid var(--bg-dark-2)' }}>
              1
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '10px', marginBottom: '12px' }}>Vendes en tu Tienda</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
              Publicas los productos en tu sitio web o redes sociales con tus propios precios y diseños únicos. Tu cliente te paga a ti primero.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 24px',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-15px', left: '24px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', border: '3px solid var(--bg-dark-2)' }}>
              2
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '10px', marginBottom: '12px' }}>Nos mandas el Pedido</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
              Subes el diseño de tu cliente en nuestra web y nos pagas el precio especial de distribuidor (ahorrando hasta un 45%).
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px 24px',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-15px', left: '24px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', border: '3px solid var(--bg-dark-2)' }}>
              3
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '10px', marginBottom: '12px' }}>Optimización IA y Envío</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
              Mejoramos tu diseño con IA gratis, sublimamos en 24 horas y enviamos en caja neutra sin logos de Smartist. Tu marca brilla ante tu cliente.
            </p>
          </div>
        </div>

        {/* Pricing Table & Partner Form Grid */}
        <div style={{
          display: 'grid',
          gap: '50px',
          alignItems: 'start'
        }} className="grid md:grid-cols-2">
          
          {/* Partners Price List (Col 1) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
                Tus márgenes de ganancia como Distribuidor
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                Como socio de Smartist, obtienes precios mayoristas competitivos desde la primera unidad. Sin compras mínimas mensuales, pagando solo por lo que vendes.
              </p>
            </div>

            {/* Price Table Card */}
            <div style={{
              background: 'var(--bg-dark-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign className="text-indigo-400" size={18} />
                <span style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  Precios Exclusivos de Socio
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Item 1 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Taza Blanca 11oz</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Precio Público: S/. 15.00</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-emerald)' }}>S/. 8.00</div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 600 }}>Ahorro: 46%</div>
                  </div>
                </div>

                {/* Item 2 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Taza Mágica Cambiante</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Precio Público: S/. 25.00</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-emerald)' }}>S/. 14.00</div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 600 }}>Ahorro: 44%</div>
                  </div>
                </div>

                {/* Item 3 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Padmouse Premium Standard</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Precio Público: S/. 18.00</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-emerald)' }}>S/. 10.00</div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 600 }}>Ahorro: 44%</div>
                  </div>
                </div>

                {/* Item 4 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Polo Blanco Sublimado (A4)</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Precio Público: S/. 30.00</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-emerald)' }}>S/. 18.00</div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 600 }}>Ahorro: 40%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note alert */}
            <div style={{
              background: 'rgba(99,102,241,0.04)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'start'
            }}>
              <PackageOpen className="text-indigo-400" size={24} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                <strong>Empaque Neutro Asegurado:</strong> Despachamos todos los pedidos en cajas de cartón kraft sin cinta impresa ni publicidad de Smartist. Tus facturas se envían de forma electrónica directo a tu correo, nunca dentro del paquete.
              </p>
            </div>
          </div>

          {/* Form (Col 2) */}
          <div>
            <ResellerRegisterForm />
          </div>

        </div>

        {/* FAQs Accordion Section */}
        <div style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '60px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '40px', fontFamily: 'var(--font-heading)' }}>
            Preguntas Frecuentes de Emprendedores
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>¿Hay un pedido mínimo para mantener el precio de distribuidor?</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                No. Una vez aprobada tu afiliación al programa, puedes comprar desde 1 unidad y siempre se te aplicará el precio preferencial de distribuidor.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>¿Cuánto demora la producción de un pedido personalizado?</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                La producción estándar es de 24 horas hábiles una vez confirmado el pago y el diseño. Para despachos urgentes en el mismo día, coordinamos de forma directa vía WhatsApp del taller.
              </p>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>¿Cómo se realizan los envíos a provincia?</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                Realizamos envíos diarios a nivel nacional mediante Shalom y Olva Courier. Tú nos indicas la agencia y el destinatario, y te proporcionamos el número de remito para que hagas el seguimiento.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
