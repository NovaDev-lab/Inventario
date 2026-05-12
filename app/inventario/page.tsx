"use client";

import { useState } from "react";
import { useDbReady } from "@/lib/hooks/useDbReady";
import { useInventory } from "@/lib/hooks/useInventory";
import { useSettings } from "@/lib/hooks/useSettings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProductForm } from "@/components/inventario/ProductForm";
import { ProductTable } from "@/components/inventario/ProductTable";
import type { Product } from "@/lib/domain/types";
import { downloadCatalogPdf } from "@/lib/pdf/catalog-pdf";

export default function InventarioPage() {
  const { ready, error } = useDbReady();
  const { settings } = useSettings(ready);
  const { products, save, remove, refresh } = useInventory(ready);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventario</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Productos, stock y exportación de catálogo a PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => downloadCatalogPdf(products, settings, { onlyInStock: false })}
          >
            Catálogo PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => downloadCatalogPdf(products, settings, { onlyInStock: true })}
          >
            Catálogo (solo con stock)
          </Button>
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            Nuevo producto
          </Button>
        </div>
      </div>

      <Card title="Catálogo" subtitle={`${products.length} productos`} actions={<Button onClick={() => void refresh()}>Actualizar</Button>}>
        <ProductTable
          products={products}
          settings={settings}
          onEdit={(p) => {
            setEditing(p);
            setOpen(true);
          }}
          onDelete={(p) => void remove(p.id)}
        />
      </Card>

      <Modal
        open={open}
        title={editing ? "Editar producto" : "Nuevo producto"}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      >
        <ProductForm
          key={editing?.id ?? "new"}
          initial={editing}
          onCancel={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={async (values) => {
            await save(values);
            setOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}
