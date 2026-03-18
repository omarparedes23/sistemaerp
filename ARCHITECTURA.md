# Arquitectura Técnica
## Tech Stack
Frontend: Next.js 15 (App Router).
Lenguaje: TypeScript (Tipado estricto).
Backend/Base de Datos: Supabase (PostgreSQL).
UI: Tailwind CSS + shadcn/ui.
Validación: Zod (para esquemas de datos y formularios).
Estado/Datos: - Server Components: Para carga inicial de datos (listados de productos, stocks).
Server Actions: Para todas las mutaciones (crear producto, registrar ingreso).
TanStack Query: Solo para estados complejos en el cliente (ej: búsqueda de productos en tiempo real en el formulario de ventas).

## Estructura de Datos (Lógica de Almacén)
inventory_movements: Registro histórico inmutable de cada entrada/salida.
stock_levels: Tabla de "saldos" para consulta rápida.
Triggers: Automatización en PostgreSQL para asegurar que cada movimiento actualice el saldo correspondiente de forma atómica.
Estructura de Carpetas (Jerarquía Modular)
/app: Rutas y páginas de la aplicación.
/components/ui: Componentes atómicos de shadcn.

/components/shared: Componentes reutilizables en varios módulos (ej: Selector de almacén).

/components/modules/[nombre]: Componentes específicos (ej: /inventory, /sales).

/actions: Funciones de Server Actions para manejar la lógica de servidor.

/lib/supabase: Configuración del cliente de Supabase.

/hooks: Hooks personalizados para lógica de cliente.

/types: Definiciones de interfaces de TypeScript y tipos de la DB.

/schemas: Definiciones de Zod para validación de formularios.