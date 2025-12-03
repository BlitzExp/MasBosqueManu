import {
    createArrivalAlert,
    acceptArrivalAlert as svcAcceptArrivalAlert,
    getPendingArrivalAlerts as svcGetPendingArrivalAlerts,
    subscribeToPendingArrivalAlerts as svcSubscribeToPendingArrivalAlerts,
} from "@/services/arrivalAlertService";
import { getUserName } from "@/services/localdatabase";
import { LoggingService } from "@/services/loggingService";

import { Alert } from "react-native";

type SendArrivalOpts = {
    userID?: string;
    name?: string;
    arrivalTime?: string;
    exitTime?: string | null;
};

export async function sendArrivalAlert(opts: SendArrivalOpts = {}) {
    try {
        let { userID, name, arrivalTime, exitTime } = opts;
        const getTimeInTimeZone = (timeZone: string) => {
            try {
                return new Intl.DateTimeFormat("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                    timeZone,
                }).format(new Date());
            } catch (e) {
                LoggingService.error("Error al formatear la hora en la zona horaria:", e);
                return new Date().toTimeString().split(" ")[0];
            }
        };

        arrivalTime = arrivalTime ?? getTimeInTimeZone("America/Mexico_City");
        exitTime = typeof exitTime !== "undefined" ? exitTime : null;

        if (!name) {
            name = (await getUserName()) ?? "Usuario sin nombre";
        }

        const dto = {
            ...(typeof userID !== "undefined" ? { userID } : {}),
            name,
            arrivalTime,
            exitTime,
        };

        const alert = await createArrivalAlert(dto as any);

        Alert.alert("La alerta de llegada ha sido enviada correctamente.");
        LoggingService.info("Arrival alert sent successfully:", dto);

        return alert;
    } catch (error) {
        LoggingService.error("Error al enviar la alerta de llegada:", error);
        Alert.alert("Error al enviar la alerta de llegada.");
        throw error;
    }
}

export const getPendingArrivalAlerts = async () => {
    try {
        return await svcGetPendingArrivalAlerts();
    } catch (error) {
        LoggingService.error("Error al obtener las alertas de llegada pendientes:", error);
        return [];
    }
};

export const acceptArrivalAlert = async (id: number) => {
    try {
        return await svcAcceptArrivalAlert(id);
    } catch (error) {
        LoggingService.error("Error al aceptar la alerta de llegada:", error);
        return null;
    }
};
export const subscribeToPendingArrivalAlerts = async (
    callback: (change: any) => void
): Promise<() => void> => {
    return svcSubscribeToPendingArrivalAlerts(callback as any);
};
