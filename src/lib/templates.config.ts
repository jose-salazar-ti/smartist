export interface DedicationTemplate {
  id: string;
  name: string;
  category: string;
  themeColor: string; // Clases de degradado CSS para la tarjeta
  textColor: string;   // Clases de color para el texto
  defaultMessage: string;
  defaultPatronKey: string; // Clave de icono de fondo (heart, gift, sparkles, laptop, etc.)
  spotifyUri?: string;
}

export const DEDICATION_TEMPLATES: DedicationTemplate[] = [
  {
    id: "amor-aniversario",
    name: "Amor & Aniversario 💖",
    category: "Amor",
    themeColor: "from-pink-500/20 to-purple-600/20 border-pink-100/30 dark:border-pink-500/20",
    textColor: "text-purple-950 dark:text-purple-100",
    defaultMessage: "Feliz Aniversario mi vida, gracias por cada momento juntos. ❤️",
    defaultPatronKey: "cats-hearts",
    spotifyUri: "spotify:track:0tgVpDi06FyKpA1z0VMD4v" // Perfect - Ed Sheeran
  },
  {
    id: "cumpleanos-festivo",
    name: "Feliz Cumpleaños 🎂",
    category: "Cumpleaños",
    themeColor: "from-amber-400/15 to-rose-500/20 border-amber-100/30 dark:border-amber-500/20",
    textColor: "text-rose-950 dark:text-rose-100",
    defaultMessage: "¡Feliz Cumpleaños! Que pases un día increíble lleno de alegrías. 🎂✨",
    defaultPatronKey: "gift"
  },
  {
    id: "amistad-gracias",
    name: "Amistad & Agradecimiento 🤝",
    category: "Amistad",
    themeColor: "from-emerald-400/15 to-teal-600/20 border-emerald-100/30 dark:border-emerald-500/20",
    textColor: "text-teal-950 dark:text-teal-100",
    defaultMessage: "Gracias por tu amistad incondicional y por estar siempre ahí. ¡Eres el/la mejor! 🌟",
    defaultPatronKey: "sparkles"
  },
  {
    id: "corporativo-detalle",
    name: "Corporativo & Oficina 💼",
    category: "Corporativo",
    themeColor: "from-blue-500/15 to-indigo-600/20 border-blue-100/30 dark:border-blue-500/20",
    textColor: "text-indigo-950 dark:text-indigo-100",
    defaultMessage: "Valoramos mucho tu dedicación y esfuerzo en el equipo. ¡Gracias por tu compromiso! 💼",
    defaultPatronKey: "laptop"
  }
];
