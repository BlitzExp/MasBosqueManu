import { UserLog } from '@/Modelo/UserLog';
import * as localdatabase from '@/services/localdatabase';
import { getAllUserLogsResilient } from '@/services/resilientLogService';

export function showLogsController() {

    const startScreen = async (): Promise<UserLog[] | undefined> => {
        try {
            const userLogs = await fetchLogs();
            console.log('Admin logs loaded:', userLogs);
            return userLogs;
        } catch (err) {
            console.error('Error loading logs:', err);
            return;
        }
    };

    const fetchLogs = async (): Promise<UserLog[]> => {
        const logs = await getAllUserLogsResilient();
        
        // 💾 Save all logs to local DB for offline access
        console.log(`💾 Caching ${logs.length} admin logs locally...`);
        for (const log of logs) {
            try {
                await localdatabase.saveSyncedLog(log);
            } catch (error) {
                console.warn(`⚠️ Error caching log ${log.id}:`, error);
            }
        }
        
        return logs;
    };

    const filterLogsBy = async (fromDate: string, toDate: string, name: string): Promise<UserLog[]> => {
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
                if (name && !log.name?.toLowerCase().includes(name.toLowerCase())) return false;
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