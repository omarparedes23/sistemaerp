import Link from "next/link";
import { Package, BarChart3, ArrowDownToLine, Warehouse } from "lucide-react";

const tarjetas = [
  {
    titulo: "Productos",
    descripcion: "Total de artículos en el catálogo",
    icono: Package,
    valor: "—",
    href: "/almacenes/productos",
    iconoBg: "bg-blue-50",
    iconoColor: "text-blue-600",
    acento: "border-t-blue-500",
  },
  {
    titulo: "Almacenes",
    descripcion: "Puntos de almacenamiento activos",
    icono: Warehouse,
    valor: "—",
    href: "/configuracion/almacenes",
    iconoBg: "bg-emerald-50",
    iconoColor: "text-emerald-600",
    acento: "border-t-emerald-500",
  },
  {
    titulo: "Movimientos hoy",
    descripcion: "Ingresos registrados",
    icono: ArrowDownToLine,
    valor: "—",
    href: "/almacenes/ingresos",
    iconoBg: "bg-amber-50",
    iconoColor: "text-amber-600",
    acento: "border-t-amber-500",
  },
  {
    titulo: "Stock bajo",
    descripcion: "Productos con existencias críticas",
    icono: BarChart3,
    valor: "—",
    href: "/almacenes/stocks",
    iconoBg: "bg-red-50",
    iconoColor: "text-red-600",
    acento: "border-t-red-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel Principal</h2>
        <p className="text-muted-foreground">
          Resumen general del sistema de inventarios
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono;
          return (
            <Link
              key={tarjeta.titulo}
              href={tarjeta.href}
              className={`group rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-t-2 ${tarjeta.acento}`}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${tarjeta.iconoBg}`}>
                  <Icono className={`h-5 w-5 ${tarjeta.iconoColor}`} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">{tarjeta.valor}</p>
              <p className="mt-1 text-sm font-medium">{tarjeta.titulo}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{tarjeta.descripcion}</p>
            </Link>
          );
        })}
      </div>

      {/* Actividad reciente */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">Actividad Reciente</h3>
          <Link
            href="/almacenes/ingresos"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver todo →
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            <ArrowDownToLine className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Sin actividad reciente</p>
          <p className="text-xs text-muted-foreground mt-1">
            Los movimientos de inventario aparecerán aquí
          </p>
        </div>
      </div>
    </div>
  );
}
