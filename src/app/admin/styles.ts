/**
 * Shared card styles for admin dashboard and pages.
 * Keeps card design consistent: subtle shadow, border, rounded corners.
 */
export const ADMIN_CARD_SHADOW = "0 1px 3px rgba(0,0,0,0.06)";

export const ADMIN_CARD_SX = {
  borderRadius: 2,
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: ADMIN_CARD_SHADOW,
} as const;
