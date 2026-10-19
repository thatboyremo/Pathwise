import api from "./axios";

export async function getJobs() {
    const response = await api.get("jobs/");
    return response.data;
}

export async function applyToJob(jobId: number) {
    const response = await api.post(`jobs/${jobId}/apply/`);
    return response.data;
}