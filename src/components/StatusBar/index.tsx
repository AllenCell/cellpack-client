import { useEffect, useState } from "react";
import { Button, ButtonProps, Input, Popover, Space } from "antd";
import { downloadOutputs } from "../../utils/aws";
import { JOB_STATUS } from "../../constants/aws";
import "./style.css";
import ErrorLogs from "../ErrorLogs";
import { DownloadOutlined, ShareAltOutlined } from "@ant-design/icons";

const statusBarButtonProps: Pick<ButtonProps, "color" | "variant" | "className"> = {
    color: "primary",
    variant: "filled",
    className: "status-bar-button",
};

interface StatusBarProps {
    jobStatus: string;
    runTime: number;
    jobId: string;
    outputDir: string;
    errorLogs: string;
    shareUrl: string;
}

const StatusBar = (props: StatusBarProps): JSX.Element => {
    const { jobStatus, runTime, jobId, errorLogs, outputDir, shareUrl } = props;

    const [isDownloading, setIsDownloading] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Listen for window blur to handle cases where clicking inside an
    // iframe shifts focus away from the parent window
    useEffect(() => {
        if (!isShareOpen) return;
        const onBlur = () => setIsShareOpen(false);
        window.addEventListener("blur", onBlur);
        return () => window.removeEventListener("blur", onBlur);
    }, [isShareOpen]);

    const downloadResults = async (jobId: string) => {
        setIsDownloading(true);
        await downloadOutputs(jobId, outputDir);
        setIsDownloading(false);
    };

    const jobSucceeded = jobStatus == JOB_STATUS.DONE;

    const shareResultUrl = (
        <Space.Compact style={{ display: "flex", width: 400 }}>
            <Input value={shareUrl} readOnly style={{ flex: 1 }} />
            <Button
                type="primary"
                onClick={() => navigator.clipboard.writeText(shareUrl)}
            >
                Copy
            </Button>
        </Space.Compact>
    );

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
                    icon={<DownloadOutlined style={{ fontSize: 18 }} />}
                >
                    Download packing result
                </Button>
                <Popover
                    content={shareResultUrl}
                    title="Share packing result"
                    trigger="click"
                    placement="topRight"
                    open={isShareOpen}
                    onOpenChange={setIsShareOpen}
                >
                    <Button
                        {...statusBarButtonProps}
                        disabled={!shareUrl}
                        icon={<ShareAltOutlined style={{ fontSize: 18 }} />}
                    >
                        Share
                    </Button>
                </Popover>
            </div>
            {errorLogs && <ErrorLogs errorLogs={errorLogs} />}
        </>
    );
};

export default StatusBar;
