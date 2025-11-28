# Sistema de Resiliencia Offline-First con SQLite y Supabase

## 📋 Descripción General

Este sistema implementa una arquitectura **offline-first** que permite que la aplicación MBM funcione sin conexión a internet y sincronice automáticamente los datos cuando se restaure la conexión.

### Características Principales:

✅ **Detección automática de conectividad** - Monitorea el estado de conexión en tiempo real
✅ **Almacenamiento local en SQLite** - Persistencia de datos cuando no hay internet
✅ **Sincronización automática** - Envía datos a Supabase cuando se conecta a internet
✅ **Manejo de conflictos** - Reintentos inteligentes con límite de intentos
✅ **Estadísticas de sincronización** - Seguimiento de qué se sincronizó y qué falló
✅ **Soporta múltiples entidades** - Logs, Profiles, Emergencias, Arrival Alerts

---

## 🏗️ Arquitectura

### Capas del Sistema:

```
┌─────────────────────────────────────────────┐
│         Componentes de la UI                │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│   Servicios Resilientes (Nuevos)            │
│  - resilientLogService                      │
│  - resilientAuthService                     │
│  - resilientProfileService                  │
│  - resilientEmergencyService                │
│  - resilientArrivalAlertService             │
│  - resilientPinsService                     │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼─────┐    ┌─────▼──────────┐
│ Connection │    │  SyncManager   │
│  Manager   │    │                │
└────────────┘    └────────┬───────┘
       │                   │
       │          ┌────────┴──────┐
       │          │               │
┌──────▼───┐  ┌───▼───┐  ┌──────▼─┐
│ NetInfo  │  │SQLite │  │Supabase│
│(Detect)  │  │(Local)│  │(Server)│
└──────────┘  └───────┘  └────────┘
```

---

## 📦 Archivos Principales

### 1. **connectionManager.ts**
Gestiona la detección de conectividad.

```typescript
// Inicializar al arrancar la app
await initializeConnectionManager();

// Verificar estado actual
const online = isOnline();

// Escuchar cambios
onConnectionChange((isOnline) => {
  console.log('Conectado:', isOnline);
});
```

**Funciones:**
- `initializeConnectionManager()` - Inicia el monitoreo
- `isOnline()` - Comprueba el estado actual
- `checkConnection()` - Fuerza una verificación
- `onConnectionChange(listener)` - Suscribirse a cambios
- `stopConnectionManager()` - Detiene el monitoreo

---

### 2. **localdatabase.ts** (Mejorado)
Base de datos SQLite local con nuevas tablas.

**Tablas agregadas:**
- `profiles` - Para datos de usuario
- `pending_emergencies` - Para alertas de emergencia
- `pending_arrival_alerts` - Para alertas de llegada

**Funciones nuevas:**
- `saveProfileLocally(profile)` - Guarda perfil
- `getProfileLocally(userId)` - Obtiene perfil local
- `getPendingProfiles()` - Obtiene pendientes
- `saveEmergencyLocally(emergency)` - Guarda emergencia
- `getPendingEmergencies()` - Obtiene emergencias pendientes
- `saveArrivalAlertLocally(alert)` - Guarda alerta
- `getPendingArrivalAlerts()` - Obtiene alertas pendientes

---

### 3. **Servicios Resilientes**

#### **resilientLogService.ts**
```typescript
// Crear log con fallback automático
const log = await createUserLogResilient({
  userID: 'user123',
  name: 'Diego',
  logDate: '2025-01-01',
  ingressTime: '08:00',
  exitTime: '17:00',
  description: 'Jornada laboral'
});

// Obtener todos los logs
const logs = await getAllUserLogsResilient();

// Obtener logs del usuario
const userLogs = await getUserLogsResilient('user123');
```

---

#### **resilientAuthService.ts**
```typescript
// Autenticación con caché offline
const auth = await signInResilient('email@test.com', 'password');

// Crear perfil con fallback
const profile = await createProfileResilient({
  id: 'user123',
  email: 'email@test.com',
  name: 'Diego'
});

// Cerrar sesión
await signOutResilient();

// Obtener usuario actual
const user = await getCurrentUserResilient();
```

---

#### **resilientProfileService.ts**
```typescript
// Crear perfil
const profile = await createProfileResilient(profileData);

// Obtener perfil
const profile = await getProfileResilient(userId);

// Actualizar perfil
const updated = await updateProfileResilient(userId, {
  phone: '123456789'
});

// Obtener pendientes para sincronizar
const pending = await getPendingProfiles();
```

---

#### **resilientEmergencyService.ts**
```typescript
// Crear emergencia
const emergency = await createEmergencyResilient({
  timeAlert: '2025-01-01T08:00:00Z',
  location: 'Zona A',
  description: 'Emergencia en bosque'
});

// Obtener emergencias pendientes
const pending = await getPendingArrivalAlertsResilient();

// Aceptar alerta
const accepted = await acceptEmergencyAlertResilient(emergencyId);

// Suscribirse a cambios
const unsubscribe = await subscribeToPendingEmergenciesResilient((change) => {
  console.log('Cambio:', change);
});
```

---

#### **resilientArrivalAlertService.ts**
```typescript
// Crear alerta de llegada
const alert = await createArrivalAlertResilient({
  name: 'Juan',
  arrivalTime: '08:00',
  exitTime: '17:00'
});

// Obtener alertas pendientes
const alerts = await getPendingArrivalAlertsResilient();

// Aceptar alerta
const accepted = await acceptArrivalAlertResilient(alertId);
```

---

#### **resilientPinsService.ts**
```typescript
// Obtener todos los pines
const pins = await getAllMapPinsResilient();

// Crear nuevo pin
const pin = await createMapPinResilient({
  name: 'Entrada Principal',
  latitude: 4.7110,
  longitude: -74.0721
});

// Obtener caché local
const cachedPins = await getCachedMapPins();
```

---

### 4. **syncManager.ts** (Mejorado)
Sincroniza automáticamente los datos pendientes.

```typescript
// Iniciar sincronización automática en background
syncManager.start();

// Detener sincronización
syncManager.stop();

// Forzar sincronización manual
await syncManager.triggerSync();

// Obtener estado
const status = syncManager.getStatus();
// {
//   isRunning: true,
//   isSyncing: false,
//   stats: {
//     logsSync: { success: 5, failed: 0, total: 5 },
//     profilesSync: { success: 1, failed: 0, total: 1 },
//     ...
//   }
// }

// Contar pendientes
const pending = await syncManager.getPendingCount();
// { logs: 2, profiles: 0, emergencies: 1, arrivalAlerts: 0, total: 3 }

// Resetear estadísticas
syncManager.resetStats();
```

---

## 🔄 Flujo de Operación

### Escenario 1: Usuario Online

```
Usuario → Acción
  ↓
Servicio Resiliente
  ↓
Intenta Supabase Online
  ↓
✓ Éxito → Cachea en SQLite
  ↓
Retorna datos al usuario
```

### Escenario 2: Usuario Offline

```
Usuario → Acción
  ↓
Servicio Resiliente
  ↓
Detecta sin conexión
  ↓
Guarda en SQLite local
  ↓
Retorna dato con ID local
  ↓
Usuario puede continuar trabajando
```

### Escenario 3: Recuperación de Conexión

```
App detecta conexión
  ↓
ConnectionManager notifica
  ↓
SyncManager inicia sincronización
  ↓
Por cada pendiente:
  - Intenta enviar a Supabase
  - Si éxito: marca como sincronizado
  - Si falla: reintenta (máx 5 veces)
  ↓
Reporte de estadísticas
```

---

## 🚀 Implementación en la App

### 1. Inicializar en el arranque

En tu componente principal (App.tsx o similar):

```typescript
import { initializeConnectionManager } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';

export default function App() {
  useEffect(() => {
    // Iniciar monitoreo de conexión
    initializeConnectionManager();
    
    // Iniciar sincronización automática
    syncManager.start();
    
    return () => {
      syncManager.stop();
    };
  }, []);

  return <YourApp />;
}
```

### 2. Reemplazar servicios en tu código

Cambia las importaciones:

```typescript
// ❌ Antes (sin resiliencia)
import * as logService from '@/services/logService';

// ✅ Después (con resiliencia)
import * as logService from '@/services/resilientLogService';
```

### 3. Usar en componentes

```typescript
import { createUserLogResilient, getAllUserLogsResilient } from '@/services/resilientLogService';

export function MyComponent() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAllUserLogsResilient();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };
    
    fetchLogs();
  }, []);

  const handleCreateLog = async (logData) => {
    try {
      const newLog = await createUserLogResilient(logData);
      setLogs([newLog, ...logs]);
    } catch (error) {
      alert('No se pudo crear el log');
    }
  };

  return (
    // Tu JSX
  );
}
```

---

## 📊 Monitoreo y Debug

### Ver estado de la conexión

```typescript
import { isOnline, getConnectionState } from '@/services/connectionManager';

console.log('Online:', isOnline());

const state = await getConnectionState();
console.log('Detalles:', state);
// {
//   isInternetReachable: true,
//   isConnected: true,
//   type: 'wifi',
//   ...
// }
```

### Ver estado de sincronización

```typescript
import { syncManager } from '@/services/syncManager';

const status = syncManager.getStatus();
console.log('Estado de sync:', status);

const pending = await syncManager.getPendingCount();
console.log('Pendientes:', pending);
```

### Monitoreo en consola

El sistema registra automáticamente:

```
🚀 Starting background sync manager...
✓ Sync manager started
📊 Syncing 5 pending logs...
✓ Log 1 synced (server: server_id_123)
✓ Log sync: 5/5 succeeded
🔌 Connection restored! Triggering sync...
```

---

## ⚙️ Configuración

### Ajustar intervalo de sincronización

En `syncManager.ts`, línea 12:

```typescript
const RETRY_INTERVAL = 30000; // Cambiar a 60000 (1 minuto), etc.
```

### Ajustar máximo de reintentos

En `syncManager.ts`, línea 13:

```typescript
const MAX_RETRIES = 5; // Cambiar a 10, etc.
```

---

## 🐛 Solución de Problemas

### Problema: "No se sincroniza nada"

**Solución:**
1. Verifica que `syncManager.start()` fue llamado
2. Comprueba que `isOnline()` retorna `true`
3. Verifica la consola para errores
4. Llama manualmente: `await syncManager.triggerSync()`

### Problema: "Los datos locales no se cargan"

**Solución:**
1. Asegúrate de llamar `initializeConnectionManager()`
2. Verifica que SQLite está instalado correctamente
3. Comprueba que las funciones de `localdatabase` están disponibles

### Problema: "Sincronización lenta"

**Solución:**
1. Aumenta el delay entre sincronizaciones (modifica `RETRY_INTERVAL`)
2. Optimiza las queries de Supabase
3. Considera sincronizar solo cambios recientes

---

## 📋 Checklist de Implementación

- [ ] Instalar dependencias necesarias (`expo-sqlite`, `@react-native-community/netinfo`)
- [ ] Copiar `connectionManager.ts` a `services/`
- [ ] Copiar/actualizar `localdatabase.ts`
- [ ] Copiar servicios resilientes a `services/`
- [ ] Actualizar `syncManager.ts`
- [ ] Inicializar en la app principal
- [ ] Reemplazar importaciones de servicios
- [ ] Probar offline/online manualmente
- [ ] Verificar logs de sincronización
- [ ] Deploy a producción

---

## 📚 Referencias

- **Expo SQLite**: https://docs.expo.dev/versions/latest/sdk/sqlite/
- **NetInfo**: https://github.com/react-native-netinfo/react-native-netinfo
- **Supabase JS**: https://supabase.com/docs/reference/javascript/introduction
- **Offline-first pattern**: https://www.patterns.dev/posts/offline-first

---

## 👤 Autor

Implementado para MBM - Sistema de Resiliencia Offline-First
Fecha: 2025-01-28
