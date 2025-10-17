import { useState } from 'react';
import { Button } from 'antd';
import { downloadOutputs } from '../../utils/aws';
import { JOB_STATUS } from '../../constants/aws';
import './style.css';
import ErrorLogs from '../ErrorLogs';

interface StatusBarProps {
    jobStatus: string;
    runTime: number;
    jobId: string;
    errorLogs: string;
    getLogs: () => Promise<void>;
}

const StatusBar = (props: StatusBarProps): JSX.Element => {
    const { jobStatus, runTime, jobId, errorLogs, getLogs } = props;
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadResults = async (jobId: string) => {
        setIsDownloading(true);
        await downloadOutputs(jobId);
        setIsDownloading(false);
    };

    const jobSucceeded = jobStatus == JOB_STATUS.DONE;

    return (
        <>
            <div className='status-container status-bar'>
                <div>
                    <b>Status</b> {jobStatus}
                </div>
                {jobSucceeded && runTime > 0 && (
                    <div>
                        <b>Run time</b> {runTime} sec
                    </div>
                )}
            </div>
            {jobSucceeded && (
                <Button
                    onClick={() => downloadResults(jobId)}
                    loading={isDownloading}
                    color='primary'
                    variant='filled'
                    className='download-button'
                >
                    Download Packing Result
                </Button>
            )}
            {errorLogs && <ErrorLogs errorLogs={errorLogs} getLogs={getLogs} />}
        </>
    );
};

export default StatusBar;
