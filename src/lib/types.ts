export type Station = {
    id: string; // station id (e.g., KJFK)
    name?: string;
    city?: string;
    state?: string;
    latitude: number;
    longitude: number;
    elevation?: number | null;
    [k: string]: unknown;
};
    
    
export type HistoricalRecord = {
    timestamp: string; // ISO
    temperature?: number | null; // °C or °F depending on API (we just display unitless label)
    wind_speed?: number | null; // knots or m/s depending on API
    wind_gust?: number | null;
    pressure?: number | null; // hPa/mb
    precip?: number | null; // mm or inches
    [k: string]: unknown;
};
    
    
export type HistoricalPayload = {
    data: HistoricalRecord[];
    warnings?: string[];
};