// Definición de estilos visuales asociados a categorías de actividades
export interface CategoryStyle {
  className: string; // Clase CSS para tema de color y aura
  label: string;     // Nombre formateado en español
  accentColor: string; // Color hex principal para gráficos/bordes
}

// Mapa de estilos con colores intencionales por categoría
const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  talleres: { className: 'cover--talleres', label: 'Taller', accentColor: '#7c5cfc' },
  taller: { className: 'cover--talleres', label: 'Taller', accentColor: '#7c5cfc' },
  deportes: { className: 'cover--deportes', label: 'Deporte', accentColor: '#06b6d4' },
  deporte: { className: 'cover--deportes', label: 'Deporte', accentColor: '#06b6d4' },
  arte: { className: 'cover--arte', label: 'Arte y Cultura', accentColor: '#f43f5e' },
  cultura: { className: 'cover--arte', label: 'Arte y Cultura', accentColor: '#f43f5e' },
  networking: { className: 'cover--networking', label: 'Networking', accentColor: '#8b5cf6' },
  comunidad: { className: 'cover--default', label: 'Comunidad', accentColor: '#f59e0b' },
  voluntariado: { className: 'cover--voluntariado', label: 'Voluntariado', accentColor: '#10b981' },
  social: { className: 'cover--voluntariado', label: 'Impacto Social', accentColor: '#10b981' },
  tecnologia: { className: 'cover--talleres', label: 'Tecnología', accentColor: '#6366f1' },
  musica: { className: 'cover--arte', label: 'Música', accentColor: '#ec4899' },
  educacion: { className: 'cover--talleres', label: 'Educación', accentColor: '#3b82f6' },
};

// Estilo por defecto cuando no coincide ninguna categoría
const DEFAULT_STYLE: CategoryStyle = {
  className: 'cover--default',
  label: 'Comunidad',
  accentColor: '#f59e0b',
};

/**
 * Devuelve el estilo visual correspondiente para la categoría indicada.
 * @param categoryName Nombre de la categoría
 */
export function useCategoryStyle(categoryName?: string | null): CategoryStyle {
  if (!categoryName) return DEFAULT_STYLE;
  const key = categoryName.trim().toLowerCase();
  return CATEGORY_STYLES[key] ?? DEFAULT_STYLE;
}
