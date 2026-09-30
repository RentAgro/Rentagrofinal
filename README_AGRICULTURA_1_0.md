# RentAgro – Agricultura 1.0

## Avance 2: gestión operativa agrícola
Esta versión agrega una interfaz de trabajo para Agricultura 1.0 sobre Next.js + Supabase.

Incluye:
- Login / registro con Supabase Auth.
- Empresa activa y aislamiento por empresa mediante RLS.
- Maestros: empresas, campañas, campos, lotes, cultivos/variedades, insumos y proveedores.
- Compras y movimientos de stock.
- Stock actual calculado desde movimientos, con alerta de mínimo.
- Plan de siembra.
- Labores y aplicaciones.
- Producción/cosecha.
- Ventas agrícolas.
- Edición y eliminación con confirmación.
- Exportación a Excel.
- Dashboard inicial y reportes.
- Diseño responsive para celular y PC.

## Instalación
1. Crear un proyecto en Supabase.
2. Ejecutar `supabase_agricultura_1_0.sql` en SQL Editor.
3. Configurar `.env.local` usando `.env.example`.
4. Ejecutar `npm install` y luego `npm run dev`.

## Próximo bloque
- Selectores inteligentes para relaciones (campo/lote/cultivo/insumo/proveedor).
- Costos automáticos por hectárea y por cultivo.
- Descuento automático de stock al registrar aplicaciones.
- Calendario agrícola y agenda.
- Historial de cambios.
- Documentos e imágenes con Supabase Storage.
- Roles y permisos por pantalla/acción.
- Reportes avanzados por campaña.

## Paso 3
- Selectores relacionados en formularios: Campo, Campaña, Lote, Cultivo, Insumo, Proveedor y Compra.
- Las aplicaciones calculan costo automáticamente usando dosis × hectáreas × costo de referencia del insumo cuando no se informa costo total.
- Una aplicación nueva genera automáticamente una salida de stock del insumo.
- Reporte de costos por lote: labores + aplicaciones + alquiler y costo por hectárea.
- Los filtros de campaña se aplican al cálculo de costos por lote.


## Paso 4
- Detalle de productos por compra.
- Entrada automática de stock al agregar un producto comprado.
- Actualización del costo de referencia.
- Total de compra recalculado desde sus productos.
- Kardex de movimientos por insumo.
- Vista SQL de stock valorizado y costo promedio de entradas.

## Paso 5 — Costos y rentabilidad
- Rentabilidad por lote y por cultivo.
- Filtros por campaña y lote.
- Costos: labores + aplicaciones + alquiler.
- Ingresos: toneladas vendidas × precio por tonelada.
- Indicadores de costo/ha, ingreso/ha y margen/ha.
- Venta vinculable a lote para trazabilidad económica.
- Importante: para comparar margen, cargar costos e ingresos en una misma moneda base (o previamente convertidos).


## Paso 6 – Dashboard agrícola profesional
- KPIs de superficie, producción, costo/ha, margen/ha, ingresos y margen.
- Rinde promedio y precio promedio de venta.
- Resultado y margen por lote.
- Margen por cultivo con visualización gráfica.
- Comparación entre campañas: hectáreas, producción, rinde, precio, ingresos, costos y margen.
- Alertas por stock mínimo, margen negativo y rindes inferiores al 90% del objetivo.
- Filtros de campaña y lote aplicados al tablero.

Nota: los importes sólo son comparables cuando costos y ventas están expresados en una moneda homogénea.

## Paso 7 — Multimoneda ARS / USD
- Compras, labores, aplicaciones y ventas admiten moneda y tipo de cambio.
- Convención: `tipo_cambio` = cantidad de ARS por 1 USD.
- El tablero, rentabilidad por lote/cultivo y comparación de campañas convierten las operaciones a USD.
- Una operación en ARS sin tipo de cambio queda sin valor USD; se debe completar el TC de la fecha.
- Los costos de stock generados por compras se normalizan a USD para mantener comparable el Kardex.


## Paso 8
- Documentos e imágenes vinculados a empresa, campaña y lote.
- Carga de facturas, recetas agronómicas, análisis de suelo, fotos, remitos y otros archivos mediante Supabase Storage.
- Exportación Excel existente + nuevo reporte PDF económico por lote.
- Ejecutar nuevamente `supabase_agricultura_1_0.sql` en Supabase para crear la tabla `documentos`, políticas RLS y bucket Storage.

## Paso 9 — usuarios, roles y pruebas
Roles implementados: **Dueño**, **Encargado** y **Agrónomo**. El Dueño administra miembros; el Encargado opera los módulos agrícolas/comerciales; el Agrónomo tiene escritura en planificación, labores, aplicaciones, producción y documentos, y lectura del resto.

También se corrigió la migración de `documentos` del Paso 8 y la creación inicial de empresa: ahora el creador queda asociado automáticamente como Dueño mediante trigger. Para invitar a alguien, el Dueño carga su email en la pestaña Usuarios; esa persona debe registrarse en RentAgro con el mismo email.

### Pruebas estáticas realizadas
- estructura ZIP y archivos obligatorios;
- consistencia de tablas usadas por la UI contra el SQL;
- corrección del esquema de `documentos` heredado;
- políticas RLS por empresa/rol;
- flujo de creación de primera empresa y asignación de Dueño;
- revisión de rutas de stock, compras, aplicaciones, reportes y documentos.

La prueba final de integración requiere un proyecto Supabase real (Auth + SQL + Storage) y variables `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No se considera validado el flujo real de red hasta desplegarlo contra ese proyecto.


## Corrección SQL Paso 9
Esta revisión corrige el orden de creación/migración de `documentos`: `campania_id` y `lote_id` se garantizan antes de crear sus índices. Está preparada para instalación limpia del esquema public.
