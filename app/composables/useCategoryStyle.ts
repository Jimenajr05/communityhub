interface CategoryStyle {
    className: string;
    label: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
    talleres: { className: 'cover--talleres', label: 'Taller' },
    deportes: { className: 'cover--deportes', label: 'Deporte' },
    arte: { className: 'cover--arte', label: 'Arte' },
    networking: { className: 'cover--networking', label: 'Networking' },
    voluntariado: { className: 'cover--voluntariado', label: 'Voluntariado' },
};

const DEFAULT_STYLE: CategoryStyle = { className: 'cover--default', label: 'Comunidad' };

export function useCategoryStyle(categoryName?: string | null): CategoryStyle {
    if (!categoryName) return DEFAULT_STYLE;
    const key = categoryName.trim().toLowerCase();
    return CATEGORY_STYLES[key] ?? DEFAULT_STYLE;
}