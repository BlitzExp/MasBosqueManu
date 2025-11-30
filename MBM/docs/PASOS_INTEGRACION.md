# 🔧 PASOS DE INTEGRACIÓN - Qué cambiar en tu código existente

## 📍 Ubicación: Raíz del proyecto MBM

---

## 1️⃣ PASO 1: Inicializar en App.tsx o _layout.tsx

**Busca:** Tu archivo principal de la app

**Cambia:**
```typescript
// ❌ ANTES (Sin resiliencia)
export default function RootLayout() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Navigation */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ✅ DESPUÉS (Con resiliencia)
import { useEffect } from 'react';
import { initializeConnectionManager } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';

export default function RootLayout() {
  useEffect(() => {
    // Inicializar sistema de resiliencia
    console.log('📱 Inicializando sistema de resiliencia...');
    initializeConnectionManager();
    syncManager.start();
    
    // Limpieza al desmontar
    return () => {
      console.log('🛑 Deteniendo sistema de resiliencia...');
      syncManager.stop();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Navigation */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

---

## 2️⃣ PASO 2: Reemplazar servicios en cada archivo

### En archivos que crean/leen logs:

```typescript
// ❌ ANTES
import { 
  createUserLog, 
  getAllUserLogs, 
  getUserLogs 
} from '@/services/logService';

// ✅ DESPUÉS
import { 
  createUserLogResilient, 
  getAllUserLogsResilient, 
  getUserLogsResilient 
} from '@/services/resilientLogService';
```

**Luego reemplaza las llamadas:**
```typescript
// ❌ ANTES
const log = await createUserLog(data);
const logs = await getAllUserLogs();
const userLogs = await getUserLogs(userID);

// ✅ DESPUÉS
const log = await createUserLogResilient(data);
const logs = await getAllUserLogsResilient();
const userLogs = await getUserLogsResilient(userID);
```

---

### En archivos de autenticación:

```typescript
// ❌ ANTES
import { signIn, signUp, getCurrentUser } from '@/services/authenticateService';

// ✅ DESPUÉS
import { 
  signInResilient, 
  signUpResilient, 
  getCurrentUserResilient 
} from '@/services/resilientAuthService';
```

**Reemplaza llamadas:**
```typescript
// ❌ ANTES
const auth = await signIn(email, password);
const user = await getCurrentUser();

// ✅ DESPUÉS
const auth = await signInResilient(email, password);
const user = await getCurrentUserResilient();
```

---

### En archivos de perfiles:

```typescript
// ❌ ANTES
import { getProfileById, createProfile } from '@/services/authenticateService';

// ✅ DESPUÉS
import { 
  getProfileResilient, 
  createProfileResilient 
} from '@/services/resilientProfileService';
```

**Reemplaza llamadas:**
```typescript
// ❌ ANTES
const profile = await getProfileById(userId);
await createProfile(profileData);

// ✅ DESPUÉS
const profile = await getProfileResilient(userId);
await createProfileResilient(profileData);
```

---

### En archivos de emergencias:

```typescript
// ❌ ANTES
import { 
  getPendingArrivalAlerts, 
  createEmergency 
} from '@/services/emergencyService';

// ✅ DESPUÉS
import { 
  getPendingArrivalAlertsResilient,
  createEmergencyResilient 
} from '@/services/resilientEmergencyService';
```

---

### En archivos de alertas de llegada:

```typescript
// ❌ ANTES
import { createArrivalAlert } from '@/services/arrivalAlertService';

// ✅ DESPUÉS
import { createArrivalAlertResilient } from '@/services/resilientArrivalAlertService';
```

---

### En archivos de pines/mapa:

```typescript
// ❌ ANTES
import { getAllMapPins } from '@/services/pinsService';

// ✅ DESPUÉS
import { getAllMapPinsResilient } from '@/services/resilientPinsService';
```

---

## 3️⃣ PASO 3: (Opcional) Monitorear estado

En cualquier pantalla donde quieras mostrar si está online/offline:

```typescript
import { View, Text } from 'react-native';
import { isOnline, onConnectionChange } from '@/services/connectionManager';

export function StatusBar() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const unsubscribe = onConnectionChange(setOnline);
    return unsubscribe;
  }, []);

  return (
    <View style={{ 
      padding: 10, 
      backgroundColor: online ? '#4CAF50' : '#FF5252' 
    }}>
      <Text style={{ color: 'white' }}>
        {online ? '🟢 En línea' : '🔴 Sin conexión'}
      </Text>
    </View>
  );
}
```

---

## 4️⃣ PASO 4: (Opcional) Mostrar sincronización

En un dashboard o settings:

```typescript
import { syncManager } from '@/services/syncManager';

export function SyncStatus() {
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const syncStatus = syncManager.getStatus();
      const pendingCount = await syncManager.getPendingCount();
      setStatus(syncStatus);
      setPending(pendingCount);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!status || !pending) return null;

  return (
    <View>
      <Text>
        Sincronización: {status.isSyncing ? 'En progreso...' : 'Completa'}
      </Text>
      <Text>
        Pendientes: {pending.total}
      </Text>
      <Button 
        title="Sincronizar Ahora" 
        onPress={() => syncManager.triggerSync()} 
      />
    </View>
  );
}
```

---

## 📋 CHECKLIST DE CAMBIOS

Marca según completemos:

- [ ] Inicializar en App.tsx / _layout.tsx
- [ ] Reemplazar imports de logService
- [ ] Reemplazar imports de authenticateService
- [ ] Reemplazar imports de emergencyService
- [ ] Reemplazar imports de arrivalAlertService
- [ ] Reemplazar imports de pinsService
- [ ] Actualizar todas las llamadas a funciones
- [ ] Agregar StatusBar (opcional)
- [ ] Agregar SyncStatus (opcional)
- [ ] Probar offline/online
- [ ] Verificar sincronización en logs

---

## 🔍 BUSCAR Y REEMPLAZAR (RÁPIDO)

Si quieres usar "Find and Replace" en VS Code:

### 1. Busca imports de logService:
```
Find: createUserLog\(
Replace: createUserLogResilient(
```

### 2. Busca imports de authenticateService:
```
Find: import \{ signIn, signUp
Replace: import { signInResilient, signUpResilient
```

### 3. Busca imports de emergencyService:
```
Find: import \{ getPendingArrivalAlerts
Replace: import { getPendingArrivalAlertsResilient
```

---

## ⚠️ IMPORTANTE

1. **NO MODIFIQUES** los servicios originales (logService.ts, etc.)
   - Todavía pueden ser útiles como base
   - Los servicios resilientes usan estos internamente

2. **REEMPLAZA SOLO** las importaciones
   - No necesitas cambiar la lógica
   - Las funciones funcionan igual

3. **INICIALIZA SOLO UNA VEZ**
   - En el App.tsx principal
   - No en cada pantalla

4. **PRUEBA DESPUÉS DE CAMBIOS**
   - Verifica que todo funciona online
   - Luego prueba offline
   - Verifica sincronización

---

## 🧪 VALIDAR CAMBIOS

Después de hacer cambios, verifica:

```typescript
// En consola del navegador/emulador:

// 1. Ver si está inicializado
isOnline() // debe retornar true/false

// 2. Ver si sync está corriendo
syncManager.getStatus() // debe retornar objeto con status

// 3. Crear un log offline
// Desactiva internet
await createUserLogResilient({...}) 
// Debe guardarse sin error

// 4. Sincronización
// Activa internet
await syncManager.triggerSync()
// Debe ver "✓ Log sync" en consola
```

---

## ✅ VALIDACIÓN FINAL

Una vez hecho todo:

```
✅ App inicia sin errores
✅ Funciona online normalmente
✅ Funciona offline
✅ Sincroniza cuando conecta
✅ No pierde datos
✅ Logs están claros
```

---

## 🎉 ¡LISTO!

Ya tienes resiliencia offline-first implementada en tu proyecto MBM.

La app ahora:
- 📱 Funciona sin internet
- 🔄 Sincroniza automáticamente
- 📊 Nunca pierde datos
- ⚡ Es más rápida (caché)
- 🛡️ Es más confiable

¡A disfrutar! 🚀
