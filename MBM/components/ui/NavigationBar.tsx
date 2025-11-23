import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { userType as fetchUserType } from '../../Controlador/navBar';

import { useRouter } from 'expo-router';
import styles from '../../Styles/styles';

export default function NavigationBar({ currentTab } : { currentTab: string }) {
    const [userType, setUserType] = useState<string>('user');
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        fetchUserType()
            .then((t) => {
                if (mounted && t) setUserType(t);
            })
            .catch((err) => {
                console.error('NavigationBar: fetchUserType failed', err);
            });
        return () => { mounted = false; };
    }, []);

    const isAdmin = userType === 'admin' || userType === 'administrador';
    const isMedic = userType === 'medic' || userType === 'medico';
    const isUser = userType === 'user';

    const mapView = currentTab === 'mapView';
    const create = currentTab === 'create';
    const history = currentTab === 'history';
    const profile = currentTab === 'profile';

    const alert = currentTab === 'alert';

    return (
        <View style={styles.navBarWrapper}>
            {isAdmin && (
                <View style={styles.navBar}>
                    <TouchableOpacity style={[styles.navItem, mapView && styles.activeNavItemMap]} onPress={() => router.replace('/mapView')}>
                        <MaterialCommunityIcons name="map" style={[styles.navIcon, mapView && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, mapView && styles.activeText]}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, alert && styles.activeNavItem]} onPress={() => router.replace('/adminNotifications')}>
                        <MaterialCommunityIcons name="alert" style={[styles.navIcon, alert && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, alert && styles.activeText]}>Alertas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, history && styles.activeNavItem]} onPress={() => router.replace('/recordsAdmin')}>
                        <MaterialCommunityIcons name="history" style={[styles.navIcon, history && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, history && styles.activeText]}>Historial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, profile && styles.activeNavItemProfile]} onPress={() => router.replace('/editProfile')}>
                        <MaterialCommunityIcons name="account" style={[styles.navIcon, profile && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, profile && styles.activeText]}>Perfil</Text>
                    </TouchableOpacity>
                </View>
            )}
            {isMedic && (
                <View style={styles.navBar}>
                    <TouchableOpacity style={[styles.navItem, mapView && styles.activeNavItemMap]} onPress={() => router.replace('/mapView')}>
                        <MaterialCommunityIcons name="map" style={[styles.navIcon, mapView && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, mapView && styles.activeText]}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, create && styles.activeNavItem]} onPress={() => router.replace('/dailyJournal')}>
                        <MaterialCommunityIcons name='plus' style={[styles.navIcon, create && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, create && styles.activeText]}>Crear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, history && styles.activeNavItem]} onPress={() => router.replace('/recordsParamedic')}>
                        <MaterialCommunityIcons name="history" style={[styles.navIcon, history && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, history && styles.activeText]}>Historial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, profile && styles.activeNavItemProfile]} onPress={() => router.replace('/editProfile')}>
                        <MaterialCommunityIcons name="account" style={[styles.navIcon, profile && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, profile && styles.activeText]}>Perfil</Text>
                    </TouchableOpacity>
                </View>
            )}
            {isUser && (
                <View style={styles.navBar}>
                    <TouchableOpacity style={[styles.navItem, mapView && styles.activeNavItemMap]} onPress={() => router.replace('/mapView')}>
                        <MaterialCommunityIcons name="map" style={[styles.navIcon, mapView && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, mapView && styles.activeText]}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, profile && styles.activeNavItemProfile]} onPress={() => router.replace('/logIn')}>
                        <MaterialCommunityIcons name="account" style={[styles.navIcon, profile && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, profile && styles.activeText]}>Perfil</Text>
                    </TouchableOpacity>
                </View>
            )} 
        </View>
    );
}