import { getUserType } from '../services/localdatabase';

export async function userType(): Promise<string> {
    try {
        return await getUserType();
    } catch (e) {
        console.error('navBar.userType error', e);
        return 'user';
    }
}