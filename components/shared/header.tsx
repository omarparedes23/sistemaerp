import { Bell, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileNav } from "@/components/shared/mobile-nav";

interface HeaderProps {
  titulo?: string;
}

export function Header({ titulo }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 md:px-6">
      {/* Lado izquierdo: hamburguesa (móvil) + logo (móvil) + título (desktop) */}
      <div className="flex items-center gap-3">
        <MobileNav />

        {/* Logo visible solo en móvil cuando el sidebar está oculto */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary">
            <Package className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-sidebar-foreground">
            ERP Modular
          </span>
        </div>

        {titulo && (
          <h1 className="hidden md:block text-lg font-semibold text-sidebar-foreground">
            {titulo}
          </h1>
        )}
      </div>

      {/* Acciones del usuario */}
      <div className="flex items-center gap-2">
        {/* Notificaciones — ocultas en móvil */}
        <Button variant="ghost" size="icon" className="relative hidden md:inline-flex text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {/* Menú de usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-sidebar-accent">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium">
                  US
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Usuario</p>
                <p className="text-xs leading-none text-muted-foreground">
                  usuario@empresa.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
