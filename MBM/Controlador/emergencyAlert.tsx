import {
    acceptEmergencyAlert as svcAcceptEmergencyAlert,
    getPendingArrivalAlerts as svcGetPendingEmergencies,
    mapEmergencyPointName as svcMapEmergencyPointName,
    subscribeToPendingArrivalAlerts as svcSubscribePendingEmergencies,
} from "@/services/emergencyService";

export const getPendingEmergencies = async () => {
    try {
        return await svcGetPendingEmergencies();
    } catch (error) {
        return [];
    }
};

export const acceptEmergencyAlert = async (id: number) => {
    try {
        return await svcAcceptEmergencyAlert(id);
    } catch (error) {
        return null;
    }
};

export const subscribeToPendingEmergencies = async (
    callback: (change: any) => void
): Promise<() => void> => {
    return svcSubscribePendingEmergencies(callback as any);
};

export const obtainEmergencyAlertName = async (alert: any): Promise<string> => {
    try {
        if (alert.customName && alert.customName.trim().length > 0) {
            return alert.customName;
        }
        return await svcMapEmergencyPointName(Number(alert.localizationID));
    } catch (error) {
        return "Unknown Location";
    }
};


export const getTimeSinceAlert = (alertDate: string, timeAlert: string): string => {
    const parseDate = (input: string | Date): Date => {
        if (input instanceof Date) return input;
        const s = String(input).trim();
        const re = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d+))?)?)?\s*\.?\s*$/;
        const m = re.exec(s);
        if (m) {
            const year = Number(m[1]);
            const month = Number(m[2]);
            const day = Number(m[3]);
            const hour = Number(m[4] ?? 0);
            const minute = Number(m[5] ?? 0);
            const second = Number(m[6] ?? 0);
            const frac = m[7] ?? '';
            const ms = Number((frac + '000').slice(0, 3));
            return new Date(year, month - 1, day, hour, minute, second, ms);
        }

        try {
            return new Date(s);
        } catch (e) {
            return new Date(NaN);
        }
    };

    const isDateOnly = (s: string) => /^\s*\d{4}-\d{1,2}-\d{1,2}\s*$/.test(s);
    const isTimeOnly = (s: string) => /^\s*\d{1,2}:\d{1,2}(?::\d{1,2}(?:\.\d+)?)?\s*$/.test(s);

    let a = parseDate(alertDate);
    let t = parseDate(timeAlert);

    if (typeof alertDate === 'string' && typeof timeAlert === 'string') {
        const ad = alertDate.trim();
        const ta = timeAlert.trim();
        if (isDateOnly(ad) && isTimeOnly(ta)) {
            t = parseDate(`${ad}T${ta}`);
            a = new Date();
        } else if (isTimeOnly(ad) && isDateOnly(ta)) {
            t = parseDate(`${ta}T${ad}`);
            a = new Date();
        }
    }

    let diffInMs = a.getTime() - t.getTime();
    if (isNaN(diffInMs)) diffInMs = 0;
    const diffInMinutes = Math.max(0, Math.floor(diffInMs / 60000));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    if (hours > 0) {
        return `${hours}h y ${minutes}m`;
    }
    return `${minutes}m`;
}