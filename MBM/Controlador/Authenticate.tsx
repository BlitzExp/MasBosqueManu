import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useStoredDataController } from './storedDataController';

export function useAuthController() {
    const router = useRouter();

    const handleLogin = (user: string, password: string) => {
        if (user === 'admin' && password === '1234') {
            const storedDataController = useStoredDataController();
            storedDataController.setStoredData('userType', 'admin');
            router.replace('/mapView');
            return { success: true };
        }else if (user === 'medic' && password === '1234') {
            const storedDataController = useStoredDataController();
            storedDataController.setStoredData('userType', 'medic');
            router.replace('/mapView');
            return { success: true };
        } else {
            Alert.alert('Error', 'Usuario o contraseña incorrectos.');
            return { success: false };
        }
    }

    const goToRegister = () => {
        router.replace('/register');
    }

    return {
        handleLogin,
        goToRegister
    }
}

