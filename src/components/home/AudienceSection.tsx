import Link from "next/link";

export default function AudienceSection() {
  return (
    <section className="audience" id="empresas">
      <div className="container">

        <div className="audience-block reveal">
          <div className="audience-image">
            <img src="/img/secciones/empresas.png" alt="Kits corporativos personalizados" />
            <div className="audience-image-badge emerald">🏢 Desde 20 unidades</div>
          </div>
          <div className="audience-content">
            <div className="section-label" style={{background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.2)", color: "#34d399"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              Para Empresas
            </div>
            <h2 className="section-title">
              Potencia tu <span className="gradient-text">marca</span> con merchandising premium
            </h2>
            <p className="section-subtitle">
              Desde regalos corporativos hasta uniformes de equipo. Precios especiales por volumen y diseño incluido.
            </p>
            <div className="audience-features">
              <div className="audience-feature">
                <div className="audience-feature-icon emerald">📦</div>
                <div className="audience-feature-text">
                  <h4>Pedidos por volumen</h4>
                  <p>Desde 20 unidades con descuentos escalonados del 15% al 35%.</p>
                </div>
              </div>
              <div className="audience-feature">
                <div className="audience-feature-icon emerald">🎨</div>
                <div className="audience-feature-text">
                  <h4>Diseño corporativo incluido</h4>
                  <p>Adaptamos tu logo y manual de marca a cada producto sin costo extra.</p>
                </div>
              </div>
              <div className="audience-feature">
                <div className="audience-feature-icon emerald">📄</div>
                <div className="audience-feature-text">
                  <h4>Facturación electrónica</h4>
                  <p>Emitimos factura, boleta y guía de remisión. RUC verificado por SUNAT.</p>
                </div>
              </div>
            </div>
            <Link href="/empresas" className="btn btn-glass-emerald" style={{marginTop: "28px"}}>
              Solicitar Cotización Corporativa →
            </Link>
          </div>
        </div>

        <div className="audience-block reverse reveal" id="emprendedores">
          <div className="audience-image">
            <img src="/img/tshirt.png" alt="Marca personal para emprendedores" />
            <div className="audience-image-badge purple">🚀 Tu marca, tus reglas</div>
          </div>
          <div className="audience-content">
            <div className="section-label" style={{background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.2)", color: "#fbbf24"}}>
              🚀 Para Emprendedores
            </div>
            <h2 className="section-title">
              Crea tu propia línea de <span className="gradient-text">productos</span>
            </h2>
            <p className="section-subtitle">
              Lanza tu marca de merchandising sin invertir en maquinaria. Nosotros producimos, tú vendes.
            </p>
            <div className="audience-features">
              <div className="audience-feature">
                <div className="audience-feature-icon purple">💡</div>
                <div className="audience-feature-text">
                  <h4>Sin inversión inicial</h4>
                  <p>Produce bajo demanda. No necesitas stock ni almacén.</p>
                </div>
              </div>
              <div className="audience-feature">
                <div className="audience-feature-icon purple">🏷️</div>
                <div className="audience-feature-text">
                  <h4>Marca blanca disponible</h4>
                  <p>Empacamos con TU marca. El cliente nunca ve nuestro nombre.</p>
                </div>
              </div>
              <div className="audience-feature">
                <div className="audience-feature-icon purple">📊</div>
                <div className="audience-feature-text">
                  <h4>Márgenes atractivos</h4>
                  <p>Precios de productor desde S/ 8.00 por taza. Tú defines tu precio de venta.</p>
                </div>
              </div>
            </div>
            <Link href="/emprendedores" className="btn btn-glass-amber" style={{marginTop: "28px"}}>
              Quiero Emprender →
            </Link>
          </div>
        </div>

        <div className="audience-block reveal" id="enamorados">
          <div className="audience-image">
            <img src="/img/secciones/regalos.png" alt="Regalos Especiales" />
            <div className="audience-image-badge rose">🎁 El regalo perfecto</div>
          </div>
          <div className="audience-content">
            <div className="section-label" style={{background: "rgba(244,63,94,0.1)", borderColor: "rgba(244,63,94,0.2)", color: "#fb7185"}}>
              🎁 Regalos Especiales
            </div>
            <h2 className="section-title">
              Regala algo <span className="gradient-text">único e irrepetible</span>
            </h2>
            <p className="section-subtitle">
              Sorprende con regalos personalizados llenos de emoción. Perfectos para cumpleaños, aniversarios, familiares y amigos.
            </p>
            <div className="audience-features">
              <div className="audience-feature">
                <div className="audience-feature-icon rose">🎁</div>
                <div className="audience-feature-text">
                  <h4>Packaging premium de regalo</h4>
                  <p>Caja decorativa, lazo de seda y tarjeta personalizada incluida.</p>
                </div>
              </div>
              <div className="audience-feature">
                <div className="audience-feature-icon rose">💌</div>
                <div className="audience-feature-text">
                  <h4>Mensaje secreto</h4>
                  <p>Agrega un mensaje oculto que solo se revela con agua caliente (taza mágica).</p>
                </div>
              </div>
              <div className="audience-feature">
                <div className="audience-feature-icon rose">📅</div>
                <div className="audience-feature-text">
                  <h4>Entrega programada</h4>
                  <p>Elige la fecha exacta de entrega. Ideal para sorprender en su día.</p>
                </div>
              </div>
            </div>
            <Link href="/regalos" className="btn btn-glass-rose" style={{marginTop: "28px"}}>
              Crear Regalo Personalizado →
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
