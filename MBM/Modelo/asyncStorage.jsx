import AsyncStorage from '@react-native-async-storage/async-storage';

export const storedData = {
    async getItem(key) {
        try {
            const value = await AsyncStorage.getItem(key);
            return value;
        } catch (error) {
            console.error("Error accessing the data", error);
            return null;
        }
    },
    async setItem(key, value) {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error("Error setting the data", error);
        }
    },
    async removeAll() {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error("Error clearing the data", error);
        }
    },
};

