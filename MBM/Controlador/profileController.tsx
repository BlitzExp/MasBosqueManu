import { Profile } from '../Modelo/Profile';
import { ensureAdmin } from '../services/authorization';
import { clearUserData, getUser as getLocalUser, saveUser as saveLocalUser } from '../services/localdatabase';
import { cleanupRealtimeSubscriptions } from '../services/realtimeSubscriptions';
import { supabase } from '../services/supabase';

export async function fetchCurrentUserProfile(): Promise<Profile | null> {

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

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

        const { data: profile, error } = await supabase
            .from('Profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.warn('Supabase profile query failed', error);
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
                user.id,
                profile.name ?? '',
                profile.nvisits?.toString() ?? '0',
                profile.dateRegistered ?? '',
                profile.lastVisit ?? '',
                profile.role ?? ''
            );
        } catch (saveErr) {
            console.warn('Failed to save profile', saveErr);
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
        console.warn('fetchCurrentUserProfile remote error', e);
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
            console.error('Failed to read local user after remote error', localErr);
            return null;
        }
    }
}

export async function logoutCurrentUser(): Promise<void> {
    try {
        try {
            const isAdmin = await ensureAdmin();
            if (isAdmin) {
                try {
                    cleanupRealtimeSubscriptions();
                } catch (e) {
                    console.warn('Failed to cleanup realtime subscriptions before logout', e);
                }
            }
        } catch (e) {
        }

        const { error } = await supabase.auth.signOut();
        if (error) console.warn('supabase.signOut returned error', error);
    } catch (e) {
        console.warn('supabase.signOut failed', e);
    }

    try {
        await clearUserData();
    } catch (e) {
        console.error('Failed to logout', e);
        throw e;
    }
}

