import jsPDF from "jspdf";
import type { AppSettings, Product } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/domain/money";

function getImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  const source = dataUrl.toLowerCase();
  if (source.startsWith("data:image/png")) return "PNG";
  if (source.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

export function downloadCatalogPdf(
  products: Product[],
  settings: AppSettings,
  options?: { onlyInStock?: boolean },
): void {
  const onlyInStock = options?.onlyInStock ?? false;

  const rows = products
    .filter((p) => (onlyInStock ? p.stock > 0 : true))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginX = 12;
  const gapX = 6;
  const gapY = 8;
  const columns = 2;
  const cardWidth = (pageWidth - marginX * 2 - gapX * (columns - 1)) / columns;
  const cardHeight = 88;
  const imageHeight = 48;
  const topStartY = 34;

  doc.setFillColor(220, 252, 231);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setTextColor(22, 101, 52);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.text(settings.businessName, pageWidth / 2, 18, { align: "center" });

  if (!rows.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text("No hay productos para mostrar en el catálogo.", pageWidth / 2, 36, {
      align: "center",
    });
    doc.save(`catalogo-${new Date().toISOString().slice(0, 10)}.pdf`);
    return;
  }

  rows.forEach((p, idx) => {
    const localIndex = idx % 6;
    const col = localIndex % columns;
    const row = Math.floor(localIndex / columns);

    if (idx > 0 && idx % 6 === 0) {
      doc.addPage();
      doc.setFillColor(220, 252, 231);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      doc.setTextColor(22, 101, 52);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text(settings.businessName, pageWidth / 2, 18, { align: "center" });
    }

    const x = marginX + col * (cardWidth + gapX);
    const y = topStartY + row * (cardHeight + gapY);

    doc.setDrawColor(34, 197, 94);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "FD");

    const imageX = x + 3;
    const imageY = y + 3;
    const imageWidth = cardWidth - 6;
    doc.setFillColor(187, 247, 208);
    doc.roundedRect(imageX, imageY, imageWidth, imageHeight, 2, 2, "F");

    if (p.imageDataUrl) {
      try {
        doc.addImage(
          p.imageDataUrl,
          getImageFormat(p.imageDataUrl),
          imageX,
          imageY,
          imageWidth,
          imageHeight,
        );
      } catch {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(22, 101, 52);
        doc.text("Imagen no disponible", x + cardWidth / 2, y + 28, { align: "center" });
      }
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(22, 101, 52);
      doc.text("Sin imagen", x + cardWidth / 2, y + 28, { align: "center" });
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(21, 128, 61);
    doc.text(p.name, x + cardWidth / 2, y + 58, {
      align: "center",
      maxWidth: cardWidth - 8,
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text(p.brand || "Sin marca", x + cardWidth / 2, y + 64, {
      align: "center",
      maxWidth: cardWidth - 8,
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(22, 163, 74);
    doc.text(formatCurrency(p.price, settings), x + cardWidth / 2, y + 74, {
      align: "center",
    });
  });

  doc.save(`catalogo-${new Date().toISOString().slice(0, 10)}.pdf`);
}
