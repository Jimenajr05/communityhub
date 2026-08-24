// Forma del estilo visual asociado a una categoría de evento
interface CategoryStyle {
    className: string; // Clase CSS a aplicar (por ejemplo, para la imagen de portada)
    label: string; // Etiqueta legible para mostrar al usuario
}

// Mapa de estilos predefinidos por cada categoría conocida
const CATEGORY_STYLES: Record<string, CategoryStyle> = {
    talleres: { className: 'cover--talleres', label: 'Taller' },
    deportes: { className: 'cover--deportes', label: 'Deporte' },
    arte: { className: 'cover--arte', label: 'Arte' },
    networking: { className: 'cover--networking', label: 'Networking' },
    voluntariado: { className: 'cover--voluntariado', label: 'Voluntariado' },
};

// Estilo por defecto usado cuando la categoría no existe o no se especifica
const DEFAULT_STYLE: CategoryStyle = { className: 'cover--default', label: 'Comunidad' };

/**
 * Composable que devuelve el estilo visual (clase CSS y etiqueta) correspondiente
 * a una categoría de evento dada.
 * @param categoryName Nombre de la categoría (puede venir en cualquier capitalización)
 * @returns El objeto CategoryStyle correspondiente, o el estilo por defecto si no coincide
 */
export function useCategoryStyle(categoryName?: string | null): CategoryStyle {
    if (!categoryName) return DEFAULT_STYLE;
    const key = categoryName.trim().toLowerCase();
    return CATEGORY_STYLES[key] ?? DEFAULT_STYLE;
}
