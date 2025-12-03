import { UserLog } from '@/Modelo/UserLog';
import * as localdatabase from '@/services/localdatabase';
import { LoggingService } from '@/services/loggingService';
import { getAllUserLogsResilient } from '@/services/resilientLogService';

export function showLogsController() {

    const startScreen = async (): Promise<UserLog[] | undefined> => {
        try {
            const userLogs = await fetchLogs();
            LoggingService.info('Admin logs cargados:', userLogs);
            return userLogs;
        } catch (err) {
            LoggingService.error('Error al cargar los logs:', err);
            return;
        }
    };

    const fetchLogs = async (): Promise<UserLog[]> => {
        const logs = await getAllUserLogsResilient();
        
        LoggingService.info(`Guardando ${logs.length} admin logs localmente...`);
        for (const log of logs) {
            try {
                await localdatabase.saveSyncedLog(log);
            } catch (error) {
                LoggingService.warn(`Error al guardar el log ${log.id}:`, error);
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
            LoggingService.error('Error al filtrar los logs por nombre:', err);
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