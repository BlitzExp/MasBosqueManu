import { Alert } from 'react-native';
import { router, useRouter } from 'expo-router';

export default class Authenticate {
    private router = useRouter();
    
    handleLogin(user: string, password: string) {
        if (user === 'admin' && password === '1234') {
            this.router.replace('/mapView');
            return { success: true };
        } else {
            Alert.alert('Error', 'Usuario o contraseña incorrectos.');
            return { success: false };
        }
    }

    goToRegister() {
        this.router.replace('/register');
    }
}

