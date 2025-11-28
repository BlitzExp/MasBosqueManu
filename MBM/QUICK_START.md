# ⚡ QUICK START - Sistema de Resiliencia

## 🚀 Comienza en 5 minutos

### Paso 1: Inicializa la App (App.tsx o _layout.tsx)

```typescript
import { useEffect } from 'react';
import { initializeConnectionManager } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';

export default function App() {
  useEffect(() => {
    // 1. Iniciar monitoreo de conexión
    initializeConnectionManager();
    
    // 2. Iniciar sincronización automática
    syncManager.start();
    
    // 3. Limpiar al desmontar
    return () => {
      syncManager.stop();
    };
  }, []);

  return (
    <YourApp />
  );
}
```

---

### Paso 2: Importa los servicios resilientes

```typescript
// ✅ Usa estos en lugar de los servicios normales:
import { createUserLogResilient, getAllUserLogsResilient } from '@/services/resilientLogService';
import { signInResilient } from '@/services/resilientAuthService';
import { getProfileResilient, updateProfileResilient } from '@/services/resilientProfileService';
import { createEmergencyResilient } from '@/services/resilientEmergencyService';
import { createArrivalAlertResilient } from '@/services/resilientArrivalAlertService';
import { getAllMapPinsResilient } from '@/services/resilientPinsService';
```

---

### Paso 3: Úsalos como funciones normales

```typescript
// Crear un log (funciona offline o online)
const log = await createUserLogResilient({
  userID: 'user123',
  name: 'Diego',
  logDate: '2025-01-28',
  ingressTime: '08:00',
  exitTime: '17:00',
  description: 'Trabajando en el campo'
});

// Login con caché local
const auth = await signInResilient('email@test.com', 'password');

// Obtener perfil (usa caché si está offline)
const profile = await getProfileResilient('user123');

// Crear emergencia (se sincroniza cuando tenga conexión)
const emergency = await createEmergencyResilient({
  timeAlert: new Date().toISOString(),
  location: 'Zona A',
  description: 'Emergencia reportada'
});

// Obtener pines del mapa (con caché local)
const pins = await getAllMapPinsResilient();
```

---

### Paso 4: (Opcional) Monitorea el estado

```typescript
import { isOnline, onConnectionChange } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';

// Verificar si está online
if (isOnline()) {
  console.log('🟢 Conectado a internet');
} else {
  console.log('🔴 Sin conexión - usando modo offline');
}

// Escuchar cambios de conexión
onConnectionChange((isOnline) => {
  console.log(isOnline ? '🔌 Conectado' : '📡 Desconectado');
});

// Ver estado de sincronización
const status = syncManager.getStatus();
console.log('Sincronizados:', status.stats.logsSync.success);

// Contar pendientes
const pending = await syncManager.getPendingCount();
console.log(`${pending.total} items esperando sincronización`);
```

---

## 📝 Ejemplo Completo: Crear un Log

```typescript
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, FlatList } from 'react-native';
import { createUserLogResilient, getAllUserLogsResilient } from '@/services/resilientLogService';
import { isOnline } from '@/services/connectionManager';

export function LogsScreen() {
  const [logs, setLogs] = useState([]);
  const [description, setDescription] = useState('');

  // Cargar logs al montar
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getAllUserLogsResilient();
      setLogs(data);
    } catch (error) {
      console.error('Error cargando logs:', error);
    }
  };

  const createLog = async () => {
    try {
      // Crear log (online o offline)
      const newLog = await createUserLogResilient({
        userID: 'user123',
        name: 'Diego',
        logDate: new Date().toISOString().split('T')[0],
        ingressTime: '08:00',
        exitTime: '17:00',
        description: description,
      });

      // Actualizar lista
      setLogs([newLog, ...logs]);
      setDescription('');

      // Mostrar estado
      const status = isOnline() ? '✓ Sincronizado' : '⚠️ Esperando conexión';
      console.log(`Log creado: ${status}`);
    } catch (error) {
      console.error('Error creando log:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Mis Logs</Text>
      
      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />
      
      <Button title="Crear Log" onPress={createLog} />

      <FlatList
        data={logs}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>{item.logDate}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      />
    </View>
  );
}
```

---

## 🧪 Cómo Probar Offline

### En Emulador Android:
1. Abre Android Emulator Control
2. Red → Desactiva Internet
3. Realiza acciones en la app
4. Verifica que se guardan localmente
5. Activa internet
6. Observa la sincronización en los logs

### En Dispositivo Real:
1. Modo Avión (desactiva wifi + datos)
2. Realiza acciones
3. Desactiva Modo Avión
4. Sincronización automática

### En Navegador (Web):
1. DevTools → Network → Offline
2. Realiza acciones
3. Vuelve a Online
4. Sincronización automática

---

## 🔍 Debugging

### Ver logs de sincronización
```typescript
syncManager.getStatus()
// {
//   isRunning: true,
//   isSyncing: false,
//   stats: {
//     logsSync: { success: 5, failed: 0, total: 5 },
//     profilesSync: { success: 1, failed: 0, total: 1 },
//     ...
//   }
// }
```

### Forzar sincronización manual
```typescript
await syncManager.triggerSync()
```

### Ver items pendientes
```typescript
const pending = await syncManager.getPendingCount();
console.log(`Pendientes: ${pending.total}`);
// { logs: 2, profiles: 0, emergencies: 1, arrivalAlerts: 0, total: 3 }
```

### Ver estado de conexión
```typescript
import { isOnline, getConnectionState } from '@/services/connectionManager';

console.log('Online:', isOnline());

const state = await getConnectionState();
console.log('Tipo:', state.type); // wifi, cellular, none
```

---

## ⚙️ Configuración Común

### Cambiar intervalo de sincronización
**Archivo:** `services/syncManager.ts` (línea 12)
```typescript
const RETRY_INTERVAL = 60000; // 60 segundos (default: 30)
```

### Cambiar máximo de reintentos
**Archivo:** `services/syncManager.ts` (línea 13)
```typescript
const MAX_RETRIES = 10; // Más reintentos (default: 5)
```

---

## ✅ Checklist Rápido

- [ ] Importé `initializeConnectionManager` en App.tsx
- [ ] Importé `syncManager.start()` en App.tsx
- [ ] Cambié las importaciones de servicios a versiones resilientes
- [ ] Probé offline/online
- [ ] Verifiqué que la sincronización funciona
- [ ] Revisé los logs en la consola

---

## 📚 Más Información

- **Guía Completa:** Ver `RESILIENCE_GUIDE.md`
- **Resumen Ejecutivo:** Ver `RESUMEN_EJECUTIVO.md`
- **Ejemplos de Código:** Ver `IMPLEMENTATION_EXAMPLES.tsx`
- **Archivos Creados:** Ver `ARCHIVOS_CREADOS.md`

---

## 🎉 ¡Listo!

Tu aplicación ahora funciona:
- ✅ Sin internet (modo offline)
- ✅ Con sincronización automática
- ✅ Detecta conexión en tiempo real
- ✅ Guarda todo localmente en SQLite
- ✅ Nunca pierde datos

¡Que disfrutes del sistema de resiliencia! 🚀
