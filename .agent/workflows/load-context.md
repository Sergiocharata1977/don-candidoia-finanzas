---
description: Load project context for efficient work sessions
---

# Context Loading Workflow

Este workflow carga el contexto del proyecto al inicio de cada sesión de trabajo.

## Fuentes de Contexto

### 1. Archivos Locales

Leer estos archivos para contexto rápido:

- `README.md` - Descripción general del proyecto
- Archivos `.md` en la raíz - Documentación adicional

### 2. Estructura del Proyecto

// turbo

```bash
# Ver estructura principal
Get-ChildItem -Path "." -Directory -Name | Select-Object -First 10
```

// turbo

```bash
# Ver archivos de configuración
Get-ChildItem -Path "." -Filter "*.json" -Name
```

## Pasos para Cargar Contexto

1. **Leer README.md** - Para entender el proyecto
2. **Revisar estructura** - Para conocer la organización
3. **Verificar dependencias** - package.json si existe

## Notas

- Usa `/autodiagnostico` si hay problemas
- Este workflow es genérico y debe adaptarse al proyecto específico

// turbo-all
