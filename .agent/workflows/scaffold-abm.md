---
description: Generar un ABM Estándar (Service + UI Views) aplicando la Regla Kanban
---

# Scaffold Standard ABM

Usa este workflow para crear nuevas secciones de administración que cumplan con el estándar visual del workspace.

## Pasos

1.  **Análisis de Requisitos**
    *   Entidad: `[NombreEntidad]` (ej: Ticket, Paciente, Inversión)
    *   ¿Tiene Estados?: `[Sí/No]` (Define si se crea Kanban)

2.  **Generar Tipos**
    *   Crear `types/[entidad].ts`.
    *   Incluir campo `status` o `state` si aplica.

3.  **Generar Servicio Mock**
    *   Crear `lib/[entidad]/service.ts`.
    *   Crear `mock[Entidades]`: Array con 5-10 items variados.
    *   Funcion `get[Entidades]`: Retornar mock con delay.

4.  **Generar Vistas UI**
    *   Crear directorio `components/[entidad]/`.
    *   **Vista Lista:** `[Entidad]List.tsx` usando `Table` de shadcn.
    *   **Vista Grid:** `[Entidad]Grid.tsx` usando `Card` de shadcn.
    *   **(Condicional) Vista Kanban:** `[Entidad]Kanban.tsx`.
        *   Agrupar datos por estado.
        *   Columnas visuales.

5.  **Generar Contenedor Maestro**
    *   Crear `[Entidad]Views.tsx`.
    *   Implementar `useState<'list' | 'grid' | 'kanban'>('list')`.
    *   Implementar Barra de Búsqueda y Filtros.
    *   Implementar Toggle de Vistas.

6.  **Crear Página**
    *   Ruta: `/dashboard/[entidad_plural]/page.tsx`.
    *   Importar `[Entidad]Views`.

## Ejemplo de Uso
```text
/scaffold-abm "Ticket de Soporte" --state=true
```
Generará:
- `types/ticket.ts` (con `status: 'open' | 'closed'`)
- `lib/tickets/service.ts`
- `components/tickets/TicketList.tsx`
- `components/tickets/TicketGrid.tsx`
- `components/tickets/TicketKanban.tsx` (Porque state=true)
- `components/tickets/TicketViews.tsx`
- `app/dashboard/tickets/page.tsx`
```
