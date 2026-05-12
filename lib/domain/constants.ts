import type { PaymentMethod } from "./types";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  transferencia: "Transferencia",
  otro: "Otro",
};

export const GENDER_LABELS = {
  unisex: "Unisex",
  femenino: "Femenino",
  masculino: "Masculino",
} as const;
