import { UserLog } from '@/Modelo/UserLog';
import { isOnline } from '@/services/connectionManager';
import { getCurrentUserResilient } from '@/services/resilientAuthService';
import { getUserLogsResilient } from '@/services/resilientLogService';
import { router } from 'expo-router';

export function showLogsController() {

    const startScreen = async (): Promise<UserLog[] | undefined> => {
        try {
            
            const userLogs = await fetchLogs();
            return userLogs;
        } catch (err) {
            console.error('Error loading logs:', err);
            return;
        }
    };

    const fetchLogs = async (): Promise<UserLog[]> => {
        try {
            console.log("📝 Fetching user logs...");
            const user = await getCurrentUserResilient();
            if (!user) {
                console.warn('❌ No user found, redirecting to login');
                router.replace('/logIn');
                return [];
            }
            const userId = (user as any)?.id || (user as any)?.email;
            const logs = await getUserLogsResilient(userId);
            const connectionStatus = isOnline() ? '✓ En línea' : '⚠️ Modo offline';
            console.log(`📊 Logs loaded (${connectionStatus}):`, logs.length);
            return logs;
        } catch (err: any) {
            console.error('❌ Error fetching logs:', err);
            return [];
        }
    };

    const filterLogsBy = async (fromDate: string, toDate: string): Promise<UserLog[]> => {
        try {
            const allLogs = await fetchLogs();
            const from = parseDateInput(fromDate);
            const to = parseDateInput(toDate);
            const filtered = allLogs.filter((log) => {
                if (!log || !log.logDate) return false;
                const ld = new Date(String(log.logDate));
                if (isNaN(ld.getTime())) return false;
                if (from && ld < from) return false;
                if (to && ld > to) return false;
                return true;
            });
            return filtered;
        } catch (err) {
            console.error('Error filtering logs by name:', err);
            return [];
        }
        
    };

    const parseDateInput = (s: string): Date | null => {
        if (!s) return null;
        const d = new Date(s);
        if (!isNaN(d.getTime())) return d;
        const parts = s.split(/[-/]/).map((p) => p.trim());
        if (parts.length === 3) {
        const [a, b, c] = parts;
        if (a.length === 4) return new Date(`${a}-${b}-${c}`);
        return new Date(`${c}-${b}-${a}`);
        }
        return null;
    };

    return {
        startScreen,
        fetchLogs,
        filterLogsBy,
    };
}