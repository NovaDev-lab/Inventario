"use client";

import { useState } from "react";
import { useDbReady } from "@/lib/hooks/useDbReady";
import { useInventory } from "@/lib/hooks/useInventory";
import { useSales } from "@/lib/hooks/useSales";
import { useSettings } from "@/lib/hooks/useSettings";
import { Card } from "@/components/ui/Card";
import { SaleForm } from "@/components/ventas/SaleForm";
import { SalesHistory } from "@/components/ventas/SalesHistory";
import { SaleTicketPreview } from "@/components/ventas/SaleTicketPreview";
import { downloadTicketPdf } from "@/lib/pdf/ticket-pdf";
import type { Sale } from "@/lib/domain/types";

export default function VentasPage() {
  const { ready, error } = useDbReady();
  const { settings } = useSettings(ready);
  const { products } = useInventory(ready);
  const { sales, registerSale } = useSales(ready);

  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [autoTicket, setAutoTicket] = useState(true);
  const [adminMode, setAdminMode] = useState(false);

  if (error) {
    return (
      <Card title="Error">
        <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
      </Card>
    );
  }

  if (!ready || !settings) {
    return (
      <Card title="Cargando…">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Abriendo base de datos local.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ventas</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Registra ventas, descarga tickets PDF y revisa el historial.</p>
      </div>

      <Card
        title="Registrar venta"
        subtitle="El stock se descuenta automáticamente al guardar."
        actions={
          <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={autoTicket} onChange={(e) => setAutoTicket(e.target.checked)} />
              Generar ticket PDF al guardar
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={adminMode} onChange={(e) => setAdminMode(e.target.checked)} />
              Modo admin (mostrar ganancia neta en ticket)
            </label>
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SaleForm
              products={products}
              settings={settings}
              onSubmit={async (input) => {
                const sale = await registerSale(input);
                setLastSale(sale);
                if (autoTicket) {
                  downloadTicketPdf(sale, settings, { includeAdminProfit: adminMode });
                }
              }}
            />
          </div>
          <div>
            <SaleTicketPreview sale={lastSale} settings={settings} />
          </div>
        </div>
      </Card>

      <Card title="Historial reciente" subtitle="Últimas 50 ventas">
        <SalesHistory
          sales={sales}
          settings={settings}
          onTicket={(sale) => {
            downloadTicketPdf(sale, settings, { includeAdminProfit: adminMode });
          }}
        />
      </Card>
    </div>
  );
}
