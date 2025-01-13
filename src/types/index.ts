export interface Document {
    name?: string;
    original_location?: string;
}

export type FirestoreDoc = Document & {
    id: string;
};

export interface AWSBatchJobsResponse {
    jobs: Array<{
        status: string;
        container: {
            logStreamName: string;
        };
    }>;
}

export interface CloudWatchLogsResponse {
    events: Array<{
        message: string;
    }>;
}

export type StringDict = {
    [key: string]: string;
};