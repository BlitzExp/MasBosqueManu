import { MapPin } from '@/Modelo/MapPins';
import {
    getPinsLocations,
    initDatabase,
} from '@/services/localdatabase';
import { getAllMapPinsResilient } from '@/services/resilientPinsService';
import { LoggingService } from '@/services/loggingService';

export async function fetchMapPins(): Promise<MapPin[]> {
    try {
        console.log('Obteniendo pines del mapa');
        await initDatabase();
        const mapPins = await getAllMapPinsResilient();
        return mapPins;
    } catch (error) {
        LoggingService.error('Error al obtener pines del mapa:', error);
        try {
            console.log('Intentando cargar desde la cache local...');
            await initDatabase();
            const cached = await getPinsLocations();
            if (cached && cached.length > 0) {
                return cached;
            }
            return [];
        } catch (localErr) {
            LoggingService.error('Error al leer la cache local:', localErr);
            return [];
        }
    }
}