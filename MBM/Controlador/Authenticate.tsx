import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { supabase } from '../services/supabase';

export function useAuthController() {
  const router = useRouter();

  // LOGIN
  const login = async (email: string, password: string) => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor llena todos los campos.");
      return { success: false };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log("Logged user:", data.user);

      router.replace("/mapView");
      return { success: true };

    } catch (err: any) {
      Alert.alert("Error", err.message);
      return { success: false };
    }
  };

// REGISTER
const register = async (email: string, password: string, userType: string, nameInput: string) => {
  if (!email || !password || !userType || !nameInput) {
    Alert.alert("Error", "Por favor llena todos los campos.");
    return { success: false };
  }

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;
    let user = signUpData.user;
    if (!signUpData.session) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        Alert.alert(
          "Registro creado",
          "Cuenta creada. Confirma tu correo para continuar (profile will be created after confirmation)."
        );
        router.replace("/logIn");
        return { success: true };
      }
      user = signInData.user;
    }

    if (!user) throw new Error("No se pudo obtener el usuario tras el registro.");

    const { error: profileError } = await supabase.from("Profiles").insert({
      id: user.id,
      name: nameInput,
      role: userType,
      nvisits: 0,
      dateRegistered: new Date().toISOString(),
      lastVisit: null,
    });

    if (profileError) throw profileError;

    Alert.alert("Registro exitoso", "Cuenta y perfil creados.");
    router.replace("/mapView");
    return { success: true };

  } catch (err: any) {
    Alert.alert("Error", err.message);
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
