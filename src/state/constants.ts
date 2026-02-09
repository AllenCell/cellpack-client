import { EditableField, PackingResult } from "../types";

// stable/frozen empty array to prevent re-renders
export const EMPTY_FIELDS: readonly EditableField[] = Object.freeze([]);
export const EMPTY_PACKING_RESULT: PackingResult = Object.freeze({
    jobId: "",
    resultUrl: "",
    runTime: 0,
    outputDir: "",
    edits: {},
});
