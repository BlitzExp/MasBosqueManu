import { MapPin } from '@/Modelo/MapPins';
import { getAllMapPins } from '@/services/pinsService';
import {
    initDatabase,
    addPinsLocations,
    getPinsLocations,
} from '@/services/localdatabase';

export async function fetchMapPins(): Promise<MapPin[]> {
    try {
        await initDatabase();
        const mapPins = await getAllMapPins();

        try {
            await addPinsLocations(mapPins);
        } catch (cacheErr) {
            console.warn('Failed to cache map pins locally:', cacheErr);
        }

        return mapPins;
    } catch (error) {
        console.error('Error fetching map pins from remote, falling back to local DB:', error);
        try {
            await initDatabase();
            const cached = await getPinsLocations();
            if (cached && cached.length > 0) {
                console.info('Loaded map pins from local database.');
                return cached;
            }
            console.warn('No cached map pins found in local DB.');
            return [];
        } catch (localErr) {
            console.error('Error reading map pins from local DB:', localErr);
            throw error;
        }
    }
}