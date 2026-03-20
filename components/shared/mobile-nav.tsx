"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Package,
  BarChart3,
  ArrowDownToLine,
  Tag,
  Layers,
  Warehouse,
  Ruler,
  ChevronDown,
  Building2,
  ShoppingCart,
  Users,
  FilePlus2,
  Hash,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type NavItem = { label: string; href: string; icon: React.ElementType };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] };

const navigation: NavGroup[] = [
  {
    label: "Ventas",
    icon: ShoppingCart,
    items: [
      { label: "Comprobantes", href: "/ventas", icon: ClipboardList },
      { label: "Nueva Venta", href: "/ventas/nueva", icon: FilePlus2 },
      { label: "Clientes", href: "/ventas/clientes", icon: Users },
      { label: "Correlativos", href: "/ventas/correlativos", icon: Hash },
    ],
  },
  {
    label: "Almacenes",
    icon: Warehouse,
    items: [
      { label: "Productos", href: "/almacenes/productos", icon: Package },
      { label: "Existencias", href: "/almacenes/stocks", icon: BarChart3 },
      { label: "Ingresos", href: "/almacenes/ingresos", icon: ArrowDownToLine },
    ],
  },
  {
    label: "Configuración",
    icon: Layers,
    items: [
      { label: "Marcas", href: "/configuracion/marcas", icon: Tag },
      { label: "Categorías", href: "/configuracion/categorias", icon: Layers },
      { label: "Almacenes", href: "/configuracion/almacenes", icon: Building2 },
      { label: "Unidades", href: "/configuracion/unidades", icon: Ruler },
    ],
  },
];

function MobileNavGroup({
  group,
  onClose,
}: {
  group: NavGroup;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const isGroupActive = group.items.some((item) =>
    pathname.startsWith(item.href)
  );
  const [open, setOpen] = useState(isGroupActive);
  const GroupIcon = group.icon;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
        <GroupIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="ml-3 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
          {group.items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <ItemIcon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa — solo visible en móvil */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar border-r border-sidebar-border md:hidden transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Cabecera del drawer */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
              <Package className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground leading-tight">
                ERP Modular
              </span>
              <span className="text-[10px] text-sidebar-foreground/50 leading-tight">
                Gestión de Inventarios
              </span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((group) => (
              <MobileNavGroup
                key={group.label}
                group={group}
                onClose={() => setOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Pie */}
        <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
          <p className="px-3 text-[10px] text-sidebar-foreground/30">
            v0.3.0 — Fase 3
          </p>
        </div>
      </aside>
    </>
  );
}
