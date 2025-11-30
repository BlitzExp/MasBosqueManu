import { Profile } from '../Modelo/Profile';
import { clearUserData, getUser as getLocalUser, saveUser as saveLocalUser } from '../services/localdatabase';
import { getCurrentUserResilient, getProfileByIdResilient, signOutResilient } from '../services/resilientAuthService';

export async function fetchCurrentUserProfile(): Promise<Profile | null> {

    try {
        const user = await getCurrentUserResilient();

        if (!user) {
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
            console.warn('Failed to fetch profile from server:', error);
            return null;
        });

        if (!profile) {
            console.warn('Profile not found on server');
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
            console.warn('Failed to save profile locally:', saveErr);
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
        console.warn('fetchCurrentUserProfile error:', e);
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
            console.error('Failed to read local user after error:', localErr);
            return null;
        }
    }
}

export async function logoutCurrentUser(): Promise<void> {
    try {
        console.log('🚪 Signing out...');
        await signOutResilient();
        console.log('✓ Sign out successful');
    } catch (e) {
        console.warn('Sign out error:', e);
    }

    try {
        await clearUserData();
        console.log('✓ User data cleared');
    } catch (e) {
        console.error('Failed to clear user data:', e);
        throw e;
    }
}

