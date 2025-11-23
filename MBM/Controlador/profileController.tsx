import { Profile } from '../Modelo/Profile';
import { supabase } from '../services/supabase';
import { clearUserData } from '../services/localdatabase';

export async function fetchCurrentUserProfile(): Promise<Profile | null> {
	

    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) return null;
        const { data: profile, error } = await supabase
		.from('Profiles')
		.select('*')
		.eq('id', user.id)
		.single();
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
        console.error('fetchCurrentUserProfile error', e);
        return null;
    }	
}

export async function logoutCurrentUser(): Promise<void> {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
	await clearUserData();
}

