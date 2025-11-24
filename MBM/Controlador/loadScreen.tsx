import * as Font from 'expo-font';
import { initDatabase } from '../services/localdatabase';

export const loadScreen = async (router: any, minDelayMs = 2000): Promise<void> => {
  const start = Date.now();
  await Font.loadAsync({
    'Jura-Regular': require('../assets/Fonts/Jura-Regular.ttf'),
    'BebasNeue-Regular': require('../assets/Fonts/BebasNeue-Regular.ttf'),
    'Jura-Bold': require('../assets/Fonts/Jura-Bold.ttf'),
  });
  await initDatabase();

  const elapsed = Date.now() - start;
  const remaining = minDelayMs - elapsed;
  if (remaining > 0) {
    await new Promise((res) => setTimeout(res, remaining));
  }

  try {
    router.replace('/mapView');
  } catch (err) {
    console.error('Navigation failed in loadScreen controller', err);
    throw err;
  }
};