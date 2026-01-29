---
name: Standard ABM Development
description: Guía unificada para crear interfaces de gestión (ABM/CRUD) en Don Cándido Finanzas.
---

# Standard ABM Development Skill

Esta habilidad define el estándar de interfaz de usuario para **Don Cándido Finanzas**.

## 1. La "Regla del Kanban" 🚦

El criterio fundamental para decidir las vistas de una entidad:

> **¿La entidad tiene un campo de "Estado" o "Fase"?**
> (Ej: Pendiente/Aprobado, Nuevo/En Proceso/Finalizado)

- **SÍ TIENE ESTADO:**
  - ✅ **Vista Lista (Table):** Para gestión detallada y bulk actions.
  - ✅ **Vista Grid (Cards):** Para visualización rápida.
  - ✅ **Vista Kanban (Board):** OBLIGATORIA. Agrupada por el campo de estado.

- **NO TIENE ESTADO:**
  - ✅ **Vista Lista (Table):** Predeterminada.
  - ✅ **Vista Grid (Cards):** Secundaria.
  - ❌ **Vista Kanban:** No se implementa.

## 2. Estructura Visual (UI Layout)

Todas las pantallas de administración deben seguir este layout exacto:

```tsx
<div className="space-y-6">
  {/* Header & Controls Container */}
  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border">
    {/* Search Bar */}
    <div className="relative w-full max-w-md">
      <Search /> <Input placeholder="Buscar..." />
    </div>

    {/* Actions & View Toggles */}
    <div className="flex items-center gap-2">
      <Button onClick={openCreateModal}>Nuevo +</Button>
      <div className="bg-muted p-1 rounded-lg">
        <ButtonToggle icon={List} />
        <ButtonToggle icon={Grid} />
        {hasState && <ButtonToggle icon={Kanban} />}
      </div>
    </div>
  </div>

  {/* Content Area */}
  <CurrentViewComponent data={filteredData} />
</div>
```

## 3. Modales para Formularios (Dialogs)

> **REGLA IMPORTANTE:** Todos los ingresos de datos (Create/Update) deben hacerse mediante **Modales (Dialogs)**, nunca en páginas separadas.

### Patrón de Implementación:
1.  Crear componente `[Entidad]Dialog.tsx` en `src/components/[entidad]/`.
2.  Usar `Dialog` de `shadcn/ui`.
3.  Controlar estado `open` desde la página padre.
4.  El formulario debe recibir `onSuccess` para recargar datos o cerrar.

```tsx
export function EntidadDialog({ open, onOpenChange, onSuccess }: Props) {
  // ... form logic
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Crear Entidad</DialogTitle></DialogHeader>
        <Form ... />
      </DialogContent>
    </Dialog>
  )
}
```

## 4. Stack Tecnológico Estándar

- **Componentes:** `shadcn/ui` (Dialog, Card, Table, Button, Input, Select).
- **Iconos:** `lucide-react`.
- **Estilos:** `Tailwind CSS`.
