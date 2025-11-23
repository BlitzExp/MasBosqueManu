import {storedData} from "../Modelo/asyncStorage";

export const useStoredDataController = () => {
    const getStoredData = async (key: string) => {
        const data = await storedData.getItem(key);
        return data;
    }
    const setStoredData = async (key: string, value: any) => {
        await storedData.setItem(key, value);
    }

    const removeAllStoredData = async () => {
        await storedData.removeAll();
    }

    return {
        getStoredData,
        setStoredData,
        removeAllStoredData
    }
}