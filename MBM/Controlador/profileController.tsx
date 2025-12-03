import { Profile } from '../Modelo/Profile';
import { clearUserData, getUser as getLocalUser, saveUser as saveLocalUser } from '../services/localdatabase';
import { getCurrentUserResilient, getProfileByIdResilient, signOutResilient } from '../services/resilientAuthService';
import { LoggingService } from '@/services/loggingService';

export async function fetchCurrentUserProfile(): Promise<Profile | null> {

    try {
        const user = await getCurrentUserResilient();

        if (!user) {
            const local = await getLocalUser();
            LoggingService.warn('No se encontró usuario actual en el servidor, usando base de datos local');
            if (!local) return null;
            return {
                id: local.userId,
                name: local.name ?? '',
                nVisits: local.nvisits ?? '0',
                dateRegistered: local.dateRegistered ?? null,
                lastVisit: local.lastVisit ?? null,
                role: local.role ?? null,
            } as Profile;
        }

        const userId = (user as any)?.id;
        if (!userId) {
            const local = await getLocalUser();
            if (!local) return null;
            return {
                id: local.userId,
                name: local.name ?? '',
                nVisits: local.nvisits ?? '0',
                dateRegistered: local.dateRegistered ?? null,
                lastVisit: local.lastVisit ?? null,
                role: local.role ?? null,
            } as Profile;
        }

        const profile = await getProfileByIdResilient(userId).catch(error => {
            LoggingService.warn('Error al obtener el perfil del usuario:', error);
            return null;
        });

        if (!profile) {
            LoggingService.warn('Perfil no encontrado en el servidor');
            const local = await getLocalUser();
            if (!local) return null;
            return {
                id: local.userId,
                name: local.name ?? '',
                nVisits: local.nvisits ?? '0',
                dateRegistered: local.dateRegistered ?? null,
                lastVisit: local.lastVisit ?? null,
                role: local.role ?? null,
            } as Profile;
        }

        try {
            await saveLocalUser(
                userId,
                profile.name ?? '',
                profile.nvisits?.toString() ?? '0',
                profile.dateRegistered ?? '',
                profile.lastVisit ?? '',
                profile.role ?? ''
            );
        } catch (saveErr) {
            LoggingService.warn('Error al guardar el perfil localmente:', saveErr);
        }

        return {
            id: profile.id,
            name: profile.name ?? '',
            nVisits: profile.nvisits?.toString() ?? '0',
            dateRegistered: profile.dateRegistered ?? null,
            lastVisit: profile.lastVisit ?? null,
            role: profile.role ?? null,
            startSessionTime: profile.startSessionTime ?? null,
        } as Profile;
    } catch (e) {
        LoggingService.warn('fetchCurrentUserProfile error:', e);
        try {
            const local = await getLocalUser();
            if (!local) return null;
            return {
                id: local.userId,
                name: local.name ?? '',
                nVisits: local.nvisits ?? '0',
                dateRegistered: local.dateRegistered ?? null,
                lastVisit: local.lastVisit ?? null,
                role: local.role ?? null,
            } as Profile;
        } catch (localErr) {
            LoggingService.error('Error al leer el usuario local después de un error:', localErr);
            return null;
        }
    }
}

export async function logoutCurrentUser(): Promise<void> {
    try {
        LoggingService.info('Cerrando sesion...');
        await signOutResilient();
        LoggingService.info('Se cerro sesion correctamente');
    } catch (e) {
        LoggingService.warn('Error al cerrar sesion:', e);
    }

    try {
        await clearUserData();
        LoggingService.info('Datos de usuario borrados correctamente');
    } catch (e) {
        LoggingService.error('Error al borrar los datos de usuario:', e);
        throw e;
    }
}

