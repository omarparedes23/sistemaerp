# Roadmap de Desarrollo
# TASKS.md (Roadmap ERP Modular)
## Fase 1: Configuración Inicial e Infraestructura UI
[ ] 1.1 Setup de Proyecto: Inicializar Next.js 15 (App Router) con TypeScript y Tailwind. (Sin build/compile).

[ ] 1.2 UI Core: Instalar shadcn/ui y configurar el componente de Sidebar (Menú lateral).

[ ] 1.3 Conexión Supabase: Crear el archivo /lib/supabase.ts (Client/Server) para que la app sepa conectarse a tu proyecto ya configurado.

[ ] 1.4 Layout Base: Crear el layout principal (Dashboard) con el Sidebar funcional, Header para el usuario y Breadcrumbs.

## Fase 2: Módulo de Almacenes (Core)
2.1 Definición de Tipos
[ ] Tipado TypeScript: Crear /types/database.ts reflejando la estructura exacta que ejecutaste en el SQL (Products, Movements, Stock_levels, etc.).

2.2 Catálogos Maestros (Menú "Configuración")
[ ] CRUD de Tablas Simples: Crear una sección de "Configuración" con vistas para:

[ ] Categorías: Listar, crear y editar.

[ ] Marcas: Listar, crear y editar.

[ ] Unidades de Medida: Listar, crear y editar.

[ ] Almacenes: Listar y crear los puntos físicos (Tienda, Depósito, etc.).

2.3 Gestión de Productos (Menú "Inventario")
[ ] Listado de Productos: Tabla con TanStack Table (paginación server-side y filtros por SKU o nombre).

[ ] Formulario de Producto: Pantalla para crear/editar productos vinculándolos a los maestros (Categoría, Marca, Unidad).

2.4 Movimientos y Stocks (Menú "Movimientos")
[ ] Ingreso de Mercadería (Compras/Importación):

[ ] Formulario Maestro-Detalle: Cabecera (Documento: Factura/Guía, Almacén destino, Motivo) + Detalle (Buscador de productos y cantidades).

[ ] Botón "Procesar": Inserta en inventory_movements.

[ ] Ajuste de Stock: Interfaz para "Sincerar stock" (cuando hay desfase en inventario).

[ ] Reporte de Stocks: Vista tipo tabla dinámica: Producto | Almacén | Stock Actual con filtros por almacén.

## Fase 3: Módulo de Ventas (Facturación)
3.1 Gestión de Clientes
[ ] Clientes: CRUD completo (RUC/DNI, Razón Social, Dirección).

3.2 Emisión de Comprobantes
[ ] Nueva Venta: Formulario para emitir Factura/Boleta.

[ ] Selección de cliente y almacén de salida.

[ ] Selección de productos (Validar stock disponible en tiempo real).

[ ] Al guardar: Generar movimiento 'OUT' motivo 'SALE'.

[ ] Gestión de Correlativos: Tabla para controlar el número de factura que sigue (ej: F001-00045).

## Fase 4: Auditoría y Kardex
[ ] Kardex: Ver la "historia" de un solo producto (Entró 10 por compra, salió 2 por venta, saldo 8).

[ ] Historial General: Ver todos los movimientos del sistema en orden cronológico.