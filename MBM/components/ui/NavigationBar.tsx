import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import { Text, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';
import styles from '../../Styles/styles';

export default function NavigationBar({ userType, currentTab } : { userType: 'admin' | 'medic' | 'user'; currentTab: string }) {
    const isAdmin = userType === 'admin';
    const isMedic = userType === 'medic';
    const isUser = userType === 'user';

    const mapView = currentTab === 'mapView';
    const create = currentTab === 'create';
    const history = currentTab === 'history';
    const profile = currentTab === 'profile';

    const alert = currentTab === 'alert';

    return (
        <View>
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
                    <TouchableOpacity style={[styles.navItem, history && styles.activeNavItemProfile]} onPress={() => router.replace('/recordsAdmin')}>
                        <MaterialCommunityIcons name="history" style={[styles.navIcon, history && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, history && styles.activeText]}>Historial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/editProfile')}>
                        <MaterialCommunityIcons name="account" style={[styles.navIcon, profile && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, profile && styles.activeText]}>Perfil</Text>
                    </TouchableOpacity>
                </View>
            )}
            {isMedic && (
                <TouchableOpacity style={styles.navItem}>
                    <MaterialCommunityIcons name="stethoscope" style={styles.navIcon} />
                    <Text>Medic</Text>
                </TouchableOpacity>
            )}
            {isUser && (
                <View style={styles.navBar}>
                    <TouchableOpacity style={[styles.navItem, mapView && styles.activeNavItemMap]} onPress={() => router.replace('/mapView')}>
                        <MaterialCommunityIcons name="map" style={[styles.navIcon, mapView && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, mapView && styles.activeText]}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, profile && styles.activeNavItemProfile]} onPress={() => router.replace('/LogIn')}>
                        <MaterialCommunityIcons name="account" style={[styles.navIcon, profile && styles.activeNavIcon]} />
                        <Text style={[styles.navtext, profile && styles.activeText]}>Perfil</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}