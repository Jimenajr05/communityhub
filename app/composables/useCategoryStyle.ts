interface CategoryStyle {
    className: string;
    emoji: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
    talleres: { className: 'cover--talleres', emoji: '🛠️' },
    deportes: { className: 'cover--deportes', emoji: '⚽' },
    arte: { className: 'cover--arte', emoji: '🎨' },
    networking: { className: 'cover--networking', emoji: '🤝' },
    voluntariado: { className: 'cover--voluntariado', emoji: '🌱' },
};

const DEFAULT_STYLE: CategoryStyle = { className: 'cover--default', emoji: '🎉' };

export function useCategoryStyle(categoryName?: string | null): CategoryStyle {
    if (!categoryName) return DEFAULT_STYLE;
    const key = categoryName.trim().toLowerCase();
    return CATEGORY_STYLES[key] ?? DEFAULT_STYLE;
}