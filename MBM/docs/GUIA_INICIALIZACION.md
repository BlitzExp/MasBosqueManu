# 🚀 GUÍA DE INICIALIZACIÓN - Sistema Offline-First

## ¿Dónde Inicializar?

El sistema offline-first necesita ser inicializado cuando la app arranca. Hay varias opciones:

---

## ✅ Opción 1: En `loadScreen.tsx` (RECOMENDADO)

Este archivo ya inicializa la base de datos y carga las fuentes. Es el lugar perfecto.

### Código Actual
```typescript
import * as Font from 'expo-font';
import { initDatabase } from '../services/localdatabase';

export const loadScreen = async (router: any, minDelayMs = 2000): Promise<void> => {
  const start = Date.now();
  await Font.loadAsync({
    'Jura-Regular': require('../assets/Fonts/Jura-Regular.ttf'),
    'BebasNeue-Regular': require('../assets/Fonts/BebasNeue-Regular.ttf'),
    'Jura-Bold': require('../assets/Fonts/Jura-Bold.ttf'),
  });
  await initDatabase();

  const elapsed = Date.now() - start;
  const remaining = minDelayMs - elapsed;
  if (remaining > 0) {
    await new Promise((res) => setTimeout(res, remaining));
  }

  try {
    router.replace('/mapView');
  } catch (err) {
    console.error('Navigation failed in loadScreen controller', err);
    throw err;
  }
};
```

### Código Mejorado (Agregar esto)
```typescript
import * as Font from 'expo-font';
import { initDatabase } from '../services/localdatabase';
import { initializeConnectionManager } from '../services/connectionManager';  // ✅ AGREGAR
import { syncManager } from '../services/syncManager';  // ✅ AGREGAR

export const loadScreen = async (router: any, minDelayMs = 2000): Promise<void> => {
  const start = Date.now();
  
  try {
    // Cargar fuentes
    await Font.loadAsync({
      'Jura-Regular': require('../assets/Fonts/Jura-Regular.ttf'),
      'BebasNeue-Regular': require('../assets/Fonts/BebasNeue-Regular.ttf'),
      'Jura-Bold': require('../assets/Fonts/Jura-Bold.ttf'),
    });
    
    // Inicializar base de datos
    await initDatabase();
    
    // ✅ NUEVAS LÍNEAS - Inicializar sistema offline
    console.log('🔌 Inicializando sistema de conectividad...');
    await initializeConnectionManager();
    
    console.log('🔄 Iniciando sincronización automática...');
    syncManager.start();
    
    console.log('✅ Sistema offline-first listo');

    const elapsed = Date.now() - start;
    const remaining = minDelayMs - elapsed;
    if (remaining > 0) {
      await new Promise((res) => setTimeout(res, remaining));
    }

    router.replace('/mapView');
  } catch (err: any) {
    console.error('❌ Error en loadScreen:', err);
    throw err;
  }
};
```

---

## ✅ Opción 2: En el archivo de entrada principal

Si tienes un archivo `App.tsx` o `_layout.tsx` en `app/`:

### Código para `app/_layout.tsx`
```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initializeConnectionManager } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🔌 Inicializando conectividad...');
        await initializeConnectionManager();
        
        console.log('🔄 Iniciando sync...');
        syncManager.start();
        
        console.log('✅ App lista');
      } catch (err) {
        console.error('❌ Error inicializando app:', err);
      }
    };

    initializeApp();

    // Limpiar al desmontar
    return () => {
      syncManager.stop();
    };
  }, []);

  return <Stack />;
}
```

---

## ✅ Opción 3: En un `useEffect` global

Si tienes un proveedor global o contexto:

```typescript
useEffect(() => {
  // Inicializar una sola vez
  const init = async () => {
    await initializeConnectionManager();
    syncManager.start();
  };
  
  init().catch(console.error);
  
  return () => syncManager.stop();
}, []);
```

---

## 📋 Checklist de Inicialización

Asegúrate de que tienes:

- [ ] `@react-native-community/netinfo` instalado
  ```bash
  npm install @react-native-community/netinfo
  ```

- [ ] `expo-sqlite` instalado
  ```bash
  npm install expo-sqlite
  ```

- [ ] Imports correctos en tu archivo de inicialización:
  ```typescript
  import { initializeConnectionManager } from '@/services/connectionManager';
  import { syncManager } from '@/services/syncManager';
  ```

- [ ] `initializeConnectionManager()` se llama **una sola vez** al inicio
  ```typescript
  await initializeConnectionManager();
  ```

- [ ] `syncManager.start()` se llama **después de inicializar la conexión**
  ```typescript
  syncManager.start();
  ```

- [ ] `syncManager.stop()` se llama al cerrar la app (opcional pero recomendado)
  ```typescript
  syncManager.stop();
  ```

- [ ] La base de datos ya se inicializa en `loadScreen`
  ```typescript
  await initDatabase(); // Ya existe
  ```

---

## 🔍 Verificar que Funciona

Después de inicializar, deberías ver en los logs:

```
🔌 Inicializando conectividad...
✅ ConnectionManager initialized

🔄 Iniciando sync...
🚀 SyncManager started
✓ Sync check interval started

✅ App lista
```

---

## 🐛 Si No Funciona

### Problema: No se inicializa la conexión
**Solución:** Asegúrate de que `initializeConnectionManager()` se llama en el orden correcto
```typescript
await initializeConnectionManager();  // Primero
syncManager.start();                  // Después
```

### Problema: El sync no arranca
**Solución:** Verifica que `syncManager.start()` se llama **después** de `initializeConnectionManager()`

### Problema: Errores de imports
**Solución:** Verifica que la ruta sea correcta:
```typescript
import { initializeConnectionManager } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';
```

### Problema: La app se bloquea en el splash
**Solución:** Agrega un timeout o usa try-catch:
```typescript
try {
  await initializeConnectionManager();
  syncManager.start();
} catch (err) {
  console.warn('⚠️ No critical error:', err);
  // La app sigue funcionando
}
```

---

## 📊 Secuencia de Inicialización

```
1. App arranca
   ↓
2. loadScreen() se ejecuta
   ├─ Carga fuentes
   ├─ Inicializa SQLite
   ├─ Inicializa ConnectionManager ✅ AGREGAR
   ├─ Inicia SyncManager ✅ AGREGAR
   └─ Espera tiempo mínimo (2 sec)
   ↓
3. Navega a mapView
   ↓
4. ConnectionManager activo (detectando cambios)
   ↓
5. SyncManager activo (sincronizando cada 30 seg)
   ↓
6. App funcional (online y offline)
```

---

## 💾 Guardando el Usuario

Si quieres mantener al usuario logueado, puedes agregar esto:

```typescript
useEffect(() => {
  const loadUser = async () => {
    try {
      const user = await getCurrentUserResilient();
      if (user) {
        console.log('✅ Usuario recuperado:', user.email);
        setCurrentUser(user);
      }
    } catch (err) {
      console.warn('No user session');
    }
  };

  loadUser();
}, []);
```

---

## 🔄 Sincronización Manual

En cualquier pantalla, puedes forzar una sincronización:

```typescript
import { syncManager } from '@/services/syncManager';

export function MyComponent() {
  const handleSync = async () => {
    console.log('🔄 Sincronizando manualmente...');
    await syncManager.triggerSync();
    
    const status = syncManager.getStatus();
    console.log('📊 Status:', {
      pending_logs: status.pending_logs,
      pending_profiles: status.pending_profiles,
      pending_emergencies: status.pending_emergencies,
      pending_alerts: status.pending_alerts,
    });
  };

  return (
    <Button 
      title="Sincronizar Ahora" 
      onPress={handleSync}
    />
  );
}
```

---

## 📱 Testing Offline After Init

Una vez inicializado, puedes probar:

### Test 1: Verificar conexión
```typescript
import { isOnline } from '@/services/connectionManager';

console.log('Online?', isOnline()); // true o false
```

### Test 2: Ver logs de sync
```typescript
import { syncManager } from '@/services/syncManager';

const status = syncManager.getStatus();
console.log(status);
```

### Test 3: Crear dato sin conexión
1. Desactiva WiFi + datos
2. Abre la app
3. Crea un log
4. Verifica que se guarda en SQLite
5. Activa conexión
6. Espera 30 segundos
7. Verifica en Supabase

---

## 🎯 Resumen

Para habilitar el sistema offline-first en tu app:

1. **Ubica el punto de inicialización** (`loadScreen.tsx` es ideal)
2. **Agrega 2 líneas de código:**
   ```typescript
   await initializeConnectionManager();
   syncManager.start();
   ```
3. **Opcionalmente, detén en cleanup:**
   ```typescript
   syncManager.stop();
   ```
4. **Listo.** La app ahora funciona offline + online automáticamente.

No necesitas hacer más nada. Todos los controladores ya usan los servicios resilientes.

✅ **Eso es todo.** El sistema está listo.

