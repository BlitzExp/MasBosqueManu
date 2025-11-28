/**
 * EJEMPLO DE IMPLEMENTACIÓN DEL SISTEMA DE RESILIENCIA
 * 
 * Este archivo muestra cómo integrar el sistema offline-first en tu aplicación
 */

// ============================================================
// 1. INICIALIZACIÓN DE LA APP (app/_layout.tsx o App.tsx)
// ============================================================

import { getConnectionState, initializeConnectionManager, isOnline, onConnectionChange, stopConnectionManager } from '@/services/connectionManager';
import { syncManager } from '@/services/syncManager';
import { useEffect } from 'react';

// ============================================================
// 2. EJEMPLO 1: CREAR Y LISTAR LOGS (con resiliencia)
// ============================================================

import {
    createUserLogResilient,
    getAllUserLogsResilient
} from '@/services/resilientLogService';


// ============================================================
// 3. EJEMPLO 2: AUTENTICACIÓN OFFLINE (con caché)
// ============================================================

import {
    signInResilient,
    signOutResilient
} from '@/services/resilientAuthService';

// ============================================================
// 4. EJEMPLO 3: GESTIÓN DE PERFILES (Offline-first)
// ============================================================

import {
    getProfileResilient,
    updateProfileResilient
} from '@/services/resilientProfileService';

// ============================================================
// 5. EJEMPLO 4: MONITOREAR ESTADO DE CONEXIÓN
// ============================================================



// ============================================================
// 6. EJEMPLO 5: CREAR ALERTA DE EMERGENCIA (Offline)
// ============================================================

import { createEmergencyResilient } from '@/services/resilientEmergencyService';

// ============================================================
// 7. EJEMPLO 6: DASHBOARD DE SINCRONIZACIÓN
// ============================================================



export default function RootLayout() {
  useEffect(() => {
    // Inicializar el gestor de conexión
    console.log('📱 Inicializando sistema de resiliencia...');
    initializeConnectionManager();
    
    // Iniciar sincronización automática en background
    syncManager.start();
    
    // Limpieza al desmontar
    return () => {
      console.log('🛑 Deteniendo sistema de resiliencia...');
      syncManager.stop();
      stopConnectionManager();
    };
  }, []);

  return (
    // Tu estructura de app aquí
    <NavigationContainer>
      {/* Stack Navigator */}
    </NavigationContainer>
  );
}

export function LogsScreen() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Cargar logs (online o offline)
  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAllUserLogsResilient();
      setLogs(data);
      console.log(`✓ Cargados ${data.length} logs`);
    } catch (error) {
      console.error('❌ Error al cargar logs:', error);
      alert('No se pudieron cargar los logs');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo log
  const createLog = async (logData) => {
    try {
      console.log('📝 Creando log...');
      const newLog = await createUserLogResilient({
        userID: 'user123',
        name: 'Diego',
        logDate: new Date().toISOString().split('T')[0],
        ingressTime: '08:00',
        exitTime: '17:00',
        description: logData.description,
        image: logData.image,
      });

      // Actualizar UI inmediatamente
      setLogs([newLog, ...logs]);
      
      // Mostrar estado
      const pending = await syncManager.getPendingCount();
      if (pending.total > 0) {
        console.log(`⚠️ ${pending.total} items pendientes de sincronizar`);
      } else {
        console.log('✓ Log sincronizado correctamente');
      }
    } catch (error) {
      console.error('❌ Error al crear log:', error);
      alert('No se pudo crear el log');
    }
  };

  // Forzar sincronización manual
  const handleSync = async () => {
    setSyncing(true);
    try {
      console.log('🔄 Sincronizando...');
      await syncManager.triggerSync();
      
      const status = syncManager.getStatus();
      console.log('✓ Sincronización completada:', status.stats);
      alert('Datos sincronizados correctamente');
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      alert('Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Logs</Text>
      
      <Button 
        title={syncing ? "Sincronizando..." : "Sincronizar Ahora"}
        onPress={handleSync}
        disabled={syncing}
      />

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={logs}
          renderItem={({ item }) => (
            <View style={styles.logItem}>
              <Text style={styles.logName}>{item.name}</Text>
              <Text>{item.logDate} - {item.ingressTime} a {item.exitTime}</Text>
              <Text style={styles.logDesc}>{item.description}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        />
      )}
    </View>
  );
}

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('🔐 Intentando login...');
      const { user } = await signInResilient(email, password);
      
      console.log(`✓ Login exitoso: ${user?.email}`);
      // Navegar a pantalla principal
      navigation.navigate('Home');
    } catch (error) {
      console.error('❌ Error en login:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión...');
      await signOutResilient();
      console.log('✓ Sesión cerrada');
      // Navegar a login
      navigation.navigate('Login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button 
        title={loading ? "Cargando..." : "Iniciar Sesión"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}

export function ProfileEditScreen({ userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      console.log('👤 Cargando perfil...');
      const data = await getProfileResilient(userId);
      setProfile(data);
      setPhone(data?.phone || '');
      console.log('✓ Perfil cargado');
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      console.log('📝 Actualizando perfil...');
      const updated = await updateProfileResilient(userId, {
        phone: phone,
      });
      setProfile(updated);
      console.log('✓ Perfil actualizado');
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('❌ Error al actualizar:', error);
      alert('Error al actualizar el perfil');
    }
  };

  if (loading) return <ActivityIndicator />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      <TextInput
        placeholder="Teléfono"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <Button title="Guardar Cambios" onPress={updateProfile} />
    </View>
  );
}

export function StatusBar() {
  const [online, setOnline] = useState(isOnline());
  const [connectionType, setConnectionType] = useState('desconocido');

  useEffect(() => {
    // Obtener estado inicial
    getConnectionState().then((state) => {
      setConnectionType(state.type || 'desconocido');
    });

    // Escuchar cambios
    const unsubscribe = onConnectionChange((isOnline) => {
      setOnline(isOnline);
      console.log(`🔌 Conexión: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.statusBar}>
      <View style={[
        styles.indicator,
        { backgroundColor: online ? '#4CAF50' : '#FF5252' }
      ]} />
      <Text>
        {online ? '🟢 En línea' : '🔴 Sin conexión'} ({connectionType})
      </Text>
    </View>
  );
}

export function EmergencyScreen() {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const sendEmergency = async () => {
    setLoading(true);
    try {
      console.log('🚨 Reportando emergencia...');
      const emergency = await createEmergencyResilient({
        timeAlert: new Date().toISOString(),
        location: location,
        description: description,
        date: new Date().toISOString().split('T')[0],
      });

      console.log('✓ Emergencia reportada:', emergency.id);
      alert('¡Emergencia reportada! Se sincronizará cuando tenga conexión.');
      
      // Limpiar formulario
      setLocation('');
      setDescription('');
    } catch (error) {
      console.error('❌ Error al reportar:', error);
      alert('No se pudo reportar la emergencia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportar Emergencia</Text>
      <TextInput
        placeholder="Ubicación"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, { height: 100 }]}
      />
      <Button 
        title={loading ? "Enviando..." : "Enviar Reporte"}
        onPress={sendEmergency}
        disabled={loading}
      />
    </View>
  );
}

export function SyncDashboard() {
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    const updateStatus = async () => {
      const syncStatus = syncManager.getStatus();
      const pendingCount = await syncManager.getPendingCount();
      
      setStatus(syncStatus);
      setPending(pendingCount);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Actualizar cada 5s

    return () => clearInterval(interval);
  }, []);

  if (!status || !pending) return null;

  return (
    <View style={styles.dashboard}>
      <Text style={styles.title}>Estado de Sincronización</Text>
      
      <View style={styles.statItem}>
        <Text>🔄 Estado: {status.isRunning ? 'Activo' : 'Inactivo'}</Text>
        <Text>⏳ Sincronizando: {status.isSyncing ? 'Sí' : 'No'}</Text>
      </View>

      <View style={styles.statItem}>
        <Text>📊 Logs: {status.stats.logsSync.success}/{status.stats.logsSync.total} ✓</Text>
        <Text>👤 Perfiles: {status.stats.profilesSync.success}/{status.stats.profilesSync.total} ✓</Text>
        <Text>🚨 Emergencias: {status.stats.emergenciesSync.success}/{status.stats.emergenciesSync.total} ✓</Text>
        <Text>📬 Alertas: {status.stats.arrivalAlertsSync.success}/{status.stats.arrivalAlertsSync.total} ✓</Text>
      </View>

      <View style={styles.pendingItems}>
        <Text>Pendientes de sincronizar: {pending.total}</Text>
        {pending.logs > 0 && <Text>  • Logs: {pending.logs}</Text>}
        {pending.profiles > 0 && <Text>  • Perfiles: {pending.profiles}</Text>}
        {pending.emergencies > 0 && <Text>  • Emergencias: {pending.emergencies}</Text>}
        {pending.arrivalAlerts > 0 && <Text>  • Alertas: {pending.arrivalAlerts}</Text>}
      </View>

      <Button title="Sincronizar Ahora" onPress={() => syncManager.triggerSync()} />
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  logItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  logName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  logDesc: {
    marginTop: 5,
    color: '#666',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fafafa',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dashboard: {
    padding: 20,
    backgroundColor: '#fff',
  },
  statItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  pendingItems: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 5,
  },
});
