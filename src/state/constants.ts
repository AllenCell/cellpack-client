import { EditableField, PackingResults } from "../types";

// stable/frozen empty array to prevent re-renders
export const EMPTY_FIELDS: readonly EditableField[] = Object.freeze([]);
export const EMPTY_PACKING_RESULTS: PackingResults = Object.freeze({
    jobId: "",
    jobLogs: "",
    resultUrl: "",
    runTime: -1,
    outputDir: "",
});
