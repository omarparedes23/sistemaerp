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

3.1 Planificación y Base de Datos
[x] Definir tablas: clients, sales_header, sales_items en DATABASE.sql.
[x] Crear migration_phase3_ventas.sql con ENUMs, tablas y trigger fn_create_movement_on_sale.
[x] Documentar lógica de negocio en SPEC.md (OUT/SALE y NC/RETURN automáticos).
[x] Actualizar TASKS.md con el roadmap completo de Fase 3.

3.2 Gestión de Clientes
[x] Actualizar types/database.ts: añadir Client, SalesHeader, SalesItem y tipos Database.
[x] Crear schemas/clients.ts con validación Zod (type, number, name, address, email, phone).
[x] Crear actions/clients.ts: getClients, createClient, updateClient, deleteClient.
[x] Crear components/modules/ventas/client-dialog.tsx (Dialog create/edit con useActionState).
[x] Crear app/(dashboard)/ventas/clientes/page.tsx (Server Component, tabla con acciones).
[x] Agregar grupo "Ventas" con ítem "Clientes" al Sidebar.

3.3 Emisión de Comprobantes
[ ] Crear app/(dashboard)/ventas/nueva/page.tsx: Formulario Maestro-Detalle (Factura/Boleta).
    [ ] Selección de cliente (búsqueda por RUC/DNI o nombre).
    [ ] Selección de almacén de salida.
    [ ] Selección de tipo de comprobante (Factura / Boleta), serie y número correlativo.
    [ ] Tabla de ítems: buscador de productos, cantidad, precio unitario, total_line.
    [ ] Cálculo en tiempo real de subtotal, IGV (18%) y total.
    [ ] Validación de stock disponible antes de guardar.
    [ ] Al guardar: insertar sales_header + sales_items (el trigger genera los movimientos OUT).
[ ] Crear actions/sales.ts: createSale (transacción: cabecera + ítems).

3.4 Gestión de Correlativos
[ ] Crear tabla series_config (doc_type, series, last_number) — migración adicional.
[ ] CRUD de series en /ventas/correlativos.
[ ] Al emitir, auto-incrementar el correlativo y pre-rellenar el campo number.

3.5 Anulación / Notas de Crédito
[ ] Botón "Anular" en el listado de ventas.
[ ] Cambia status a 'Annulled' y elimina sales_items (trigger devuelve stock con IN/SALE NC:).

3.6 Listado de Ventas
[ ] Crear app/(dashboard)/ventas/page.tsx: tabla con filtros por fecha, cliente y estado.

## Fase 4: Auditoría y Kardex
[ ] Kardex: Ver la "historia" de un solo producto (Entró 10 por compra, salió 2 por venta, saldo 8).

[ ] Historial General: Ver todos los movimientos del sistema en orden cronológico.