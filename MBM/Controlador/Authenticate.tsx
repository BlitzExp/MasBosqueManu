import { getUser, saveUser } from '@/services/localdatabase';
import {
  createProfileResilient,
  getCurrentUserResilient,
  getProfileByIdResilient,
  signInResilient,
  signUpResilient
} from '@/services/resilientAuthService';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export function useAuthController() {
  const router = useRouter();

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor llena todos los campos.");
      return { success: false };
    }

    try {
      const { user } = (await signInResilient(email, password)) ?? {};

      console.log('Logged user:', user);

      await storeUserData();

      router.replace('/mapView');
      return { success: true };
    } catch (err: any) {
      Alert.alert('Error', err.message);
      return { success: false };
    }
  };

  const storeUserData = async () => {
    try {
      const user = await getCurrentUserResilient();
      const local = await getUser();

      let profile: any = null;
      if (user && 'id' in user && user.id) {
        profile = await getProfileByIdResilient(user.id).catch(() => null);
      }

      const finalId = (user && 'id' in user ? user.id : null) ?? local?.userId ?? '';
      const finalName = profile?.name ?? local?.name ?? '';
      const finalNvisits =
        profile?.nvisits !== undefined && profile?.nvisits !== null
          ? String(profile.nvisits)
          : local?.nvisits ?? '0';
      const finalDateRegistered = profile?.dateRegistered ?? local?.dateRegistered ?? '';
      const finalLastVisit = profile?.lastVisit ?? local?.lastVisit ?? '';
      const finalRole = profile?.role ?? local?.role ?? 'user';

      if (finalId) {
        await saveUser(finalId, finalName, finalNvisits, finalDateRegistered, finalLastVisit, finalRole);
      } else {
        console.warn('storeUserData: no user id available to persist locally');
      }
    } catch (err) {
      console.error('storeUserData error', err);
    }
  }

const register = async (email: string, password: string, userType: string, nameInput: string) => {
  if (!email || !password || !userType || !nameInput) {
    Alert.alert("Error", "Por favor llena todos los campos.");
    return { success: false };
  }

  if (password.length < 6) {
    Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
    return { success: false };
  }

  try {
    const signUpData = await signUpResilient(email, password);
    let user = (signUpData as any)?.user;

    // If no session was created, try to sign in (user must confirm email first in many setups)
    if (!((signUpData as any)?.session)) {
      try {
        const signInData = await signInResilient(email, password);
        user = (signInData as any)?.user;
      } catch (signInErr: any) {
        Alert.alert(
          'Registro creado',
          'Cuenta creada. Confirma tu correo para continuar (profile will be created after confirmation).'
        );
        router.replace('/logIn');
        return { success: true };
      }
    }

    if (!user) throw new Error('No se pudo obtener el usuario tras el registro.');

    await createProfileResilient({
      id: user.id,
      name: nameInput,
      role: userType,
      nvisits: 0,
      dateRegistered: new Date().toISOString(),
      lastVisit: null,
    });

    Alert.alert('Registro exitoso', 'Cuenta y perfil creados.');
    await storeUserData();
    router.replace('/mapView');
    return { success: true };
  } catch (err: any) {
    Alert.alert('Error', err.message);
    return { success: false };
  }
};




  const goToRegister = () => {
    router.replace("/register");
  };

  const goToLogin = () => {
    router.replace("/logIn");
  };

  return {
    login,
    register,
    goToRegister,
    goToLogin,
  };
}
