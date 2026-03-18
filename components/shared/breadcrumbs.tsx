"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Mapa de segmentos de ruta → etiquetas en español
const LABELS: Record<string, string> = {
  almacenes: "Almacenes",
  productos: "Productos",
  stocks: "Existencias",
  ingresos: "Ingresos",
  configuracion: "Configuración",
  marcas: "Marcas",
  categorias: "Categorías",
  unidades: "Unidades",
  nuevo: "Nuevo",
  editar: "Editar",
};

function toLabel(segment: string): string {
  return LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Inicio</span>
      </Link>

      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        // Ignorar segmentos que son IDs numéricos (para rutas dinámicas futuras)
        const isId = /^\d+$/.test(segment);

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            {isLast || isId ? (
              <span
                className={cn(
                  "font-medium",
                  isLast ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isId ? `#${segment}` : toLabel(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors"
              >
                {toLabel(segment)}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
