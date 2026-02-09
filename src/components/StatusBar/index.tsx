import { useState } from "react";
import { Button } from "antd";
import { downloadOutputs } from "../../utils/aws";
import { JOB_STATUS } from "../../constants/aws";
import "./style.css";
import ErrorLogs from "../ErrorLogs";

const DownloadIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>
    </svg>
);

const ShareIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3.8"/><circle cx="18" cy="19" r="3"/>
        <line x1="9.5" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="9.5" y1="6.51" y2="10.49"/>
    </svg>
);

interface StatusBarProps {
    jobStatus: string;
    runTime: number;
    jobId: string;
    outputDir: string;
    errorLogs: string;
    shareUrl: string;
    onShareClick: () => void;
}

const StatusBar = (props: StatusBarProps): JSX.Element => {
    const { jobStatus, runTime, jobId, errorLogs, outputDir, shareUrl, onShareClick } = props;

    const [isDownloading, setIsDownloading] = useState(false);

    const downloadResults = async (jobId: string) => {
        setIsDownloading(true);
        await downloadOutputs(jobId, outputDir);
        setIsDownloading(false);
    };

    const jobSucceeded = jobStatus == JOB_STATUS.DONE;

    return (
        <>
            <div className="status-container status-bar">
                <div>
                    <b>Status</b> {jobStatus}
                </div>
                {jobSucceeded && runTime > 0 && (
                    <div>
                        <b>Run time</b> {runTime} sec
                    </div>
                )}
            </div>
            <div className="status-bar-actions">
                <Button
                    onClick={() => downloadResults(jobId)}
                    loading={isDownloading}
                    disabled={!jobSucceeded}
                    color="primary"
                    variant="filled"
                    style={{ width: 263, height: 30, borderRadius: 4 }}
                    icon={<DownloadIcon />}
                >
                    Download packing result
                </Button>
                <Button
                    onClick={onShareClick}
                    disabled={!shareUrl}
                    color="primary"
                    variant="filled"
                    style={{ width: 122, height: 30, borderRadius: 4 }}
                    icon={<ShareIcon />}
                >
                    Share
                </Button>
            </div>
            {errorLogs && <ErrorLogs errorLogs={errorLogs} />}
        </>
    );
};

export default StatusBar;
