//api endpoints
export const BASE_URL = "https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing";
export const SUBMIT_PACKING_BASE = `${BASE_URL}/submit-packing`;
export const PACKING_STATUS_BASE = `${BASE_URL}/packing-status`;
export const GET_LOGS_BASE = `${BASE_URL}/logs`;

export const getSubmitPackingUrl = (recipe: string, config?: string) => {
    let url = `${SUBMIT_PACKING_BASE}?recipe=${recipe}`;
    if (config) {
        url += `&config=${config}`;
    }
    return url;
}

export const packingStatusUrl = (jobId: string) => `${PACKING_STATUS_BASE}?jobId=${jobId}`;
export const getLogsUrl = (logStreamName: string) => `${GET_LOGS_BASE}?logStreamName=${logStreamName}`;

//job status
export enum JobStatus {
    SUBMITTED = "SUBMITTED",
    PENDING = "PENDING",
    RUNNABLE = "RUNNABLE",
    STARTING = "STARTING",
    RUNNING = "RUNNING",
    SUCCEEDED = "SUCCEEDED",
    FAILED = "FAILED",
}