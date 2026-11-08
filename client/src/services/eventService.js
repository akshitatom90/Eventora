
import api from "./api";

export const getEvents = async () => {
    const response = await api.get("/events");

    const data = response.data;

    return Array.isArray(data) ? data : data.events || [];
};
