import { getUserType } from '../services/localdatabase';
import { LoggingService } from '@/services/loggingService';

export async function userType(): Promise<string> {
    try {
        return await getUserType();
    } catch (e) {
        LoggingService.error('navBar.userType error', e);
        return 'user';
    }
}