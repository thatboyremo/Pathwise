import api from "./axios";

export async function getScholarships() {
    const response = await api.get("scholarships/");
    return response.data;
}