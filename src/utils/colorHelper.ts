/**
 * Utility to ensure text readability on dynamic background colors.
 * Used for League Custom Branding (Phase 29).
 */

export const getContrastColor = (hexcolor: string): 'text-white' | 'text-black' => {
    // If no hex provided, default to white
    if (!hexcolor || hexcolor === 'transparent') return 'text-white';

    // Remove # if present
    const hex = hexcolor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate YIQ brightness (standard formula)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // If brightness is > 128, return black text, else white
    return yiq >= 128 ? 'text-black' : 'text-white';
};
