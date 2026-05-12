import jsPDF from "jspdf";
import type { AppSettings, Sale } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/domain/money";
import { PAYMENT_METHOD_LABELS } from "@/lib/domain/constants";

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function downloadTicketPdf(
  sale: Sale,
  settings: AppSettings,
  options?: { includeAdminProfit?: boolean },
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [80, 200] });
  let y = 8;
  doc.setFontSize(11);
  doc.text(settings.businessName, 40, y, { align: "center" });
  y += 6;
  doc.setFontSize(8);
  if (settings.address) {
    doc.text(settings.address, 40, y, { align: "center", maxWidth: 72 });
    y += 4;
  }
  if (settings.phone) {
    doc.text(`Tel: ${settings.phone}`, 40, y, { align: "center" });
    y += 4;
  }
  doc.text("TICKET DE VENTA", 40, y, { align: "center" });
  y += 5;
  doc.setFontSize(7.5);
  doc.text(`Folio: ${sale.id.slice(0, 8)}`, 4, y);
  y += 4;
  doc.text(`Fecha: ${fmtDate(sale.createdAt)}`, 4, y);
  y += 4;
  doc.text(`Pago: ${PAYMENT_METHOD_LABELS[sale.paymentMethod]}`, 4, y);
  y += 5;
  doc.line(4, y, 76, y);
  y += 4;

  doc.setFontSize(7.5);
  for (const line of sale.items) {
    const header = `${line.qty} x ${line.productNameSnapshot}`;
    doc.text(header, 4, y, { maxWidth: 72 });
    y += 4;
    doc.text(`${formatCurrency(line.unitPrice, settings)} c/u`, 4, y, {
      maxWidth: 72,
    });
    y += 4;
    doc.text(`Subtotal: ${formatCurrency(line.lineSubtotal, settings)}`, 4, y);
    y += 5;
    if (y > 185) {
      doc.addPage();
      y = 8;
    }
  }

  doc.line(4, y, 76, y);
  y += 5;
  doc.setFontSize(8);
  doc.text(`Subtotal: ${formatCurrency(sale.subtotal, settings)}`, 4, y);
  y += 4;
  if (sale.discountGlobal > 0) {
    doc.text(`Descuento: -${formatCurrency(sale.discountGlobal, settings)}`, 4, y);
    y += 4;
  }
  if (sale.taxAmount > 0) {
    doc.text(`Impuesto (${(sale.taxRate * 100).toFixed(2)}%): ${formatCurrency(sale.taxAmount, settings)}`, 4, y);
    y += 4;
  }
  doc.setFontSize(9);
  doc.text(`TOTAL: ${formatCurrency(sale.total, settings)}`, 4, y);
  y += 5;
  if (options?.includeAdminProfit) {
    doc.setFontSize(7.5);
    doc.text(`Ganancia neta (admin): ${formatCurrency(sale.grossProfit, settings)}`, 4, y);
    y += 6;
  }

  if (sale.customerName) {
    doc.text(`Cliente: ${sale.customerName}`, 4, y);
    y += 4;
  }
  if (sale.customerPhone) {
    doc.text(`Tel cliente: ${sale.customerPhone}`, 4, y);
    y += 4;
  }
  if (sale.notes) {
    doc.text(`Notas: ${sale.notes}`, 4, y, { maxWidth: 72 });
  }

  doc.save(`ticket-${sale.id.slice(0, 8)}.pdf`);
}
