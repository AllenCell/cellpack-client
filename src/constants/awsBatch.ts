//api endpoints
const BASE_URL = "https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing";
const SUBMIT_PACKING_BASE = `${BASE_URL}/submit-packing`;
const SUBMIT_PACKING_ECS = "https://bda21vau5c.execute-api.us-west-2.amazonaws.com/staging/pack";
const PACKING_STATUS_BASE = `${BASE_URL}/packing-status`;
const GET_LOGS_BASE = `${BASE_URL}/logs`;

export const getSubmitPackingUrl = (
    recipe: string,
    config?: string,
    useECS: boolean = false
) => {
    const baseURL = useECS ? SUBMIT_PACKING_ECS : SUBMIT_PACKING_BASE;
    let url = `${baseURL}?recipe=${recipe}`;
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