import { useState } from "react";
import { Button } from "antd";
import { downloadOutputs } from "../../utils/aws";
import { JOB_STATUS } from "../../constants/aws";
import "./style.css";
import ErrorLogs from "../ErrorLogs";
import DownloadIcon from "../../assets/download.svg?react";
import ShareIcon from "../../assets/share.svg?react";

const statusBarButtonProps = {
    color: "primary" as const,
    variant: "filled" as const,
    className: "status-bar-button",
};

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
                    {...statusBarButtonProps}
                    onClick={() => downloadResults(jobId)}
                    loading={isDownloading}
                    disabled={!jobSucceeded}
                    icon={<DownloadIcon width={18} height={18} />}
                >
                    Download packing result
                </Button>
                <Button
                    {...statusBarButtonProps}
                    onClick={onShareClick}
                    disabled={!shareUrl}
                    icon={<ShareIcon width={18} height={18} />}
                >
                    Share
                </Button>
            </div>
            {errorLogs && <ErrorLogs errorLogs={errorLogs} />}
        </>
    );
};

export default StatusBar;
