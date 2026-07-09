# Respaldo de Colores Originales (Violeta / Indigo)

Este archivo contiene el respaldo de las variables de color originales de la aplicación web (estilo violeta/índigo) definidas en [globals.css](file:///c:/Users/User/Documents/Sublimacion/sublimacion/src/app/globals.css). Si deseas regresar a esta versión de color, puedes restaurar estos valores.

## Variables CSS Originales (:root)

```css
--primary: #6366f1;
--primary-light: #818cf8;
--primary-dark: #4f46e5;
--accent-violet: #8b5cf6;
--accent-rose: #f43f5e;
--accent-amber: #f59e0b;
--accent-emerald: #10b981;
--accent-cyan: #06b6d4;

--text-accent: #c7d2fe;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
--gradient-text: linear-gradient(135deg, #c7d2fe, #e0e7ff, #818cf8);

/* Shadows */
--shadow-glow: 0 0 60px rgba(99, 102, 241, 0.15);
```

## Clases de Utilidad y Efectos Asociados

En el archivo original [globals.css](file:///c:/Users/User/Documents/Sublimacion/sublimacion/src/app/globals.css), los botones e indicadores de sección tienen estilos vinculados a estas variables:

*   `.btn-primary`: Usa `var(--gradient-primary)` y una sombra `rgba(99, 102, 241, 0.3)`.
*   `.section-label`: Usa un fondo `rgba(99, 102, 241, 0.1)` y borde `rgba(99, 102, 241, 0.2)`.
