import { createArrivalAlert } from "@/services/arrivalAlertService";
import { getUserName } from "@/services/localdatabase";

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
                return new Date().toTimeString().split(" ")[0];
            }
        };

        arrivalTime = arrivalTime ?? getTimeInTimeZone("America/Mexico_City");
        exitTime = typeof exitTime !== "undefined" ? exitTime : null;

        // Ensure we have a name (try local DB) and let the service resolve userID if not provided
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

        return alert;
    } catch (error) {
        console.error("Error al enviar la alerta de llegada:", error);
        Alert.alert("Error al enviar la alerta de llegada.");
        throw error;
    }
}
