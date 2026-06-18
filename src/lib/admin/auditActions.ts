export const ADMIN_AUDIT_ACTIONS = {
  PRODUCT_UPDATE: "product_update",
  PRODUCT_MODERATION: "product_moderation",
  PRODUCT_RESTORE: "product_restore",
  USER_BAN: "user_ban",
  USER_ROLE: "user_role_change",
  USER_LOCALE: "user_locale_change",
  ORDER_STATUS: "order_status_change",
  ORDER_PAYMENT: "order_payment_confirm",
  ORDER_REFUND: "order_refund",
  DISPUTE_CREATE: "dispute_create",
  DISPUTE_RESOLVE: "dispute_resolve",
  REVIEW_DELETE: "review_delete",
  COUNTRY_CURRENCY: "country_currency_update",
  TICKET_REPLY: "ticket_reply",
  TICKET_STATUS: "ticket_status_change",
  CATEGORY_MUTATION: "category_mutation",
} as const;

export type AdminAuditAction =
  (typeof ADMIN_AUDIT_ACTIONS)[keyof typeof ADMIN_AUDIT_ACTIONS];

export const ADMIN_AUDIT_ACTION_LABELS: Record<AdminAuditAction, string> = {
  product_update: "Producto editado",
  product_moderation: "Moderación de producto",
  product_restore: "Producto restaurado",
  user_ban: "Ban de usuario",
  user_role_change: "Cambio de rol",
  user_locale_change: "País/moneda de usuario",
  order_status_change: "Estado de pedido",
  order_payment_confirm: "Pago confirmado",
  order_refund: "Reembolso procesado",
  dispute_create: "Disputa creada",
  dispute_resolve: "Disputa resuelta",
  review_delete: "Reseña eliminada",
  country_currency_update: "Moneda de país",
  ticket_reply: "Respuesta de soporte",
  ticket_status_change: "Estado de ticket",
  category_mutation: "Categoría",
};
