# Don Cándido Finanzas

**Sistema Contable Automático para Venta de Electrodomésticos**

Sistema de gestión financiera y contable con generación automática de asientos de doble partida, gestión de stock y control de terceros (clientes/proveedores).

---

## 🚀 Características Principales

- ✅ **Contabilidad Automática**: Asientos de doble partida generados automáticamente
- ✅ **Gestión de Stock**: Control de inventario con entrada/salida de mercadería
- ✅ **Terceros**: Gestión de clientes y proveedores con saldos automáticos
- ✅ **Multi-Tenancy**: Sistema de organizaciones con roles y permisos
- ✅ **Operaciones Financieras**: Ingresos, gastos, compras, pagos
- ✅ **Trazabilidad**: Cada asiento vinculado a su operación original

---

## 📦 Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Frontend  | Next.js 14, React 18, TypeScript |
| Backend   | Firebase (Firestore, Auth) |
| Estilos   | Tailwind CSS, shadcn/ui |
| Contabilidad | Sistema de doble partida automático |

---

## 🛠️ Instalación y Configuración

### 1. Clonar e instalar

```bash
git clone <repo-url> don-candido-finanzas
cd don-candido-finanzas
npm install
```

### 2. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password)
3. Crear base de datos Firestore
4. Generar claves de Service Account

### 3. Variables de entorno

Crear `.env.local`:

```env
# Firebase Client SDK (público)
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin SDK (privado)
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Crear Super Admin

```bash
node scripts/create-super-admin.js
```

Usuario de prueba:
- Email: `sergio@empresa.com`
- Password: `Sergio123`

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```
don-candido-finanzas/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Login/Register
│   │   ├── (dashboard)/         # Páginas protegidas
│   │   │   ├── operaciones/     # Formularios de operaciones
│   │   │   ├── movimientos/     # Historial de asientos
│   │   │   ├── terceros/        # Clientes/Proveedores
│   │   │   └── productos/       # Gestión de productos
│   │   └── api/                 # API Routes
│   ├── components/
│   │   ├── operaciones/         # Modales de operaciones
│   │   ├── terceros/            # Componentes de terceros
│   │   ├── stock/               # Componentes de stock
│   │   ├── stock/               # Componentes de stock
│   │   ├── landing/             # Componentes de Landing Page [NUEVO]
│   │   └── ui/                  # Componentes base
│   ├── services/
│   │   └── accounting/          # Lógica contable
│   │       ├── asientos-auto.ts
│   │       ├── terceros.ts
│   │       ├── cuentas-bancarias.ts
│   │       └── stock.ts
│   └── types/
│       ├── contabilidad-auto.ts # Tipos contables
│       ├── stock.ts             # Tipos de stock
│       └── products.ts          # Tipos de productos
├── ultimas-tareas.md            # Resumen de trabajo realizado
└── README.md
```

---

## 💰 Sistema Contable

### Operaciones Implementadas

| Operación | Estado | Asiento Generado |
|-----------|--------|------------------|
| **Ingreso de Dinero** | ✅ | Debe: Caja/Banco → Haber: Ingreso |
| **Gasto/Pago** | ✅ | Debe: Gasto → Haber: Caja/Banco |
| **Entrada de Mercadería** | ✅ | Debe: Compras → Haber: Proveedores + Stock |
| **Compra a Crédito** | ✅ | Debe: Gasto → Haber: Proveedores |
| **Pago de Deuda** | ✅ | Debe: Proveedores → Haber: Caja/Banco |
| Venta de Producto | ⏳ | Debe: Clientes → Haber: Ventas - Stock |
| Cobro de Cliente | ⏳ | Debe: Caja/Banco → Haber: Clientes |
| Transferencia | ⏳ | Debe: Cuenta Destino → Haber: Cuenta Origen |

### Plan de Cuentas Simplificado

```
ACTIVO
├── Caja
├── Bancos
├── Clientes
└── Stock de Mercadería

PASIVO
└── Proveedores

PATRIMONIO NETO
└── Capital

RESULTADOS
├── Ingresos
│   ├── Ventas
│   └── Otros Ingresos
└── Gastos
    ├── Compras de Mercadería
    ├── Servicios
    ├── Alquileres
    └── Gastos Varios
```

### Colecciones Firestore

```
/organizations/{orgId}
  /asientos_auto/          ← Asientos contables
  /terceros/               ← Clientes/Proveedores
  /movimientos_terceros/   ← Historial de movimientos
  /cuentas_bancarias/      ← Caja/Bancos
  /movimientos_caja_banco/ ← Historial de movimientos
  /products/               ← Productos
  /facturas_compra/        ← Facturas de compra
  /movimientos_stock/      ← Movimientos de stock
```

---

## 🎯 Flujo de Operaciones

```
Usuario → Formulario de Operación
    ↓
generarAsientoAutomatico()
    ↓
├── Genera Líneas de Asiento (Debe/Haber)
├── Valida Doble Partida
├── Actualiza Colecciones Auxiliares
│   ├── Terceros (saldos)
│   ├── Cuentas Bancarias (saldos)
│   └── Stock (cantidades)
└── Guarda Asiento en Firestore
```

---

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo

# Build
npm run build            # Build de producción
npm run start            # Servidor de producción

# Calidad de código
npm run lint             # ESLint
npm run type-check       # TypeScript

# Utilidades
node scripts/create-super-admin.js  # Crear usuario admin
```

---

## 📊 Tareas Pendientes

Ver roadmap completo en: [docs-9001app](http://localhost:3001/roadmaps)  
Filtrar por proyecto: **don-candido-finanzas**

### Prioridad Alta
- [ ] Venta de Productos con Stock
- [ ] Cobro de Cliente
- [ ] Dashboard Financiero
- [ ] Validación de Totales Contables

### Prioridad Media
- [ ] Transferencia entre Cuentas
- [ ] Reportes Básicos
- [ ] Cargar Proveedores Reales en Modales
- [ ] Testing E2E

### Prioridad Baja
- [ ] Índices de Firestore
- [ ] Sistema de Tarjetas de Crédito (App Separada)

---

## 📚 Documentación

- [Resumen de Últimas Tareas](./ultimas-tareas.md)
- [Walkthrough Completo](file:///C:/Users/Usuario/.gemini/antigravity/brain/9f2701e2-561f-48c8-8fcd-1226cf03f7b0/walkthrough.md)
- [Plan de Implementación](file:///C:/Users/Usuario/.gemini/antigravity/brain/9f2701e2-561f-48c8-8fcd-1226cf03f7b0/implementation_plan.md)

---

## 🔗 Proyectos Relacionados

- **docs-9001app**: Sistema de roadmap centralizado (puerto 3001)
- **sig-agro**: Proyecto de referencia para contabilidad automática

---

## 👥 Contexto del Negocio

**Tipo de Negocio:** Venta de Electrodomésticos (Retail)

**Características:**
- Gestión de stock de productos
- Compra a proveedores con factura
- Venta a clientes (efectivo y cuenta corriente)
- Control de caja y bancos
- Gestión de deudas y cobros

---

## 📄 Licencia

Privado - Todos los derechos reservados

---

**Última actualización:** 19 de Diciembre de 2024
