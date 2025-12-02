import { MapPin } from '@/Modelo/MapPins';
import {
    getPinsLocations,
    initDatabase,
} from '@/services/localdatabase';
import { getAllMapPinsResilient } from '@/services/resilientPinsService';

export async function fetchMapPins(): Promise<MapPin[]> {
    try {
        console.log('📍 Starting fetchMapPins...');
        await initDatabase();

        const mapPins = await getAllMapPinsResilient();
        console.log(`✓ Fetched ${mapPins.length} map pins successfully`);
        return mapPins;
    } catch (error) {
        console.error('❌ Error fetching map pins:', error);
        try {
            console.log('📍 Attempting to load from local cache...');
            await initDatabase();
            const cached = await getPinsLocations();
            if (cached && cached.length > 0) {
                console.log(`✓ Loaded ${cached.length} pins from local cache`);
                return cached;
            }
            console.warn('⚠️ No cached map pins found');
            return [];
        } catch (localErr) {
            console.error('❌ Error reading local cache:', localErr);
            return [];
        }
    }
}