# Perfumería · Inventario y ventas (local-first)

Aplicación web estática (**Next.js 15 + TypeScript + Tailwind**) para gestionar **inventario**, **ventas**, **reportes con gráficas** y **PDF** (catálogo y tickets), pensada para una **perfumería**. Los datos se guardan **solo en el navegador** con **IndexedDB** (un dispositivo). Incluye **exportar/importar respaldo JSON**.

## Requisitos

- Node.js **20+** (recomendado **22 LTS**)

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Producción / export estático

```bash
npm run build
```

Salida en la carpeta `out/` (lista para GitHub Pages o cualquier hosting estático).

### GitHub Pages y `basePath`

Si publicas en una **subruta** (`https://usuario.github.io/mi-repo/`), define la variable de entorno antes del build:

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_BASE_PATH="/mi-repo"; npm run build

# macOS / Linux
NEXT_PUBLIC_BASE_PATH=/mi-repo npm run build
```

El valor debe ser **`/nombre-del-repo`** (con barra inicial, sin barra final). Para un sitio **en la raíz** (`https://usuario.github.io/` con repositorio `usuario.github.io`), deja `NEXT_PUBLIC_BASE_PATH` vacía.

El workflow [`.github/workflows/deploy-gh-pages.yml`](.github/workflows/deploy-gh-pages.yml) usa por defecto `NEXT_PUBLIC_BASE_PATH=""`: ajústalo si tu despliegue es en subruta.

En GitHub: **Settings → Pages → Build and deployment → GitHub Actions**.

## Uso funcional

1. **Configuración**: nombre del negocio, dirección, teléfono, moneda e impuesto (tasa 0–1, ej. `0.16`).
2. **Inventario**: alta/edición/baja de productos; alertas de stock bajo; exportación de **catálogo PDF** (completo o solo con stock).
3. **Ventas**: líneas con cantidad, precio y descuentos; descuento global; método de pago; cliente opcional. Al guardar se descuenta stock y se calcula **ganancia bruta** (ingreso neto sin impuesto − costo).
4. **Tickets PDF**: desde ventas (auto al guardar opcional) o desde el historial.
5. **Reportes / Inicio**: KPIs y gráfica diaria por rango de fechas.
6. **Respaldo**: exporta/importa JSON (fusionar o reemplazar) en Configuración.

## Estructura principal

- [`app/`](app/) — rutas (App Router), todas estáticas.
- [`components/`](components/) — UI reutilizable y módulos por área.
- [`lib/domain/`](lib/domain/) — tipos, validaciones y utilidades de dinero/fechas.
- [`lib/db/`](lib/db/) — acceso IndexedDB (`idb`).
- [`lib/services/`](lib/services/) — reglas de inventario, ventas y reportes.
- [`lib/pdf/`](lib/pdf/) — generación de PDF con `jspdf` + `jspdf-autotable`.
- [`lib/backup/`](lib/backup/) — exportación/importación de respaldo.

## Licencia

Uso interno / comercial según lo acuerdes con tu cliente. Ajusta esta sección si publicas el código.
