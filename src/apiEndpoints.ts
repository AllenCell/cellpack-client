export const BASE_URL = "https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing";
export const SUBMIT_PACKING = `${BASE_URL}/submit-packing`;

export const packingStatusUrl = (jobId: string) => `${BASE_URL}/packing-status?jobId=${jobId}`;
export const getLogsUrl = (logStreamName: string) => `${BASE_URL}/logs?logStreamName=${logStreamName}`;