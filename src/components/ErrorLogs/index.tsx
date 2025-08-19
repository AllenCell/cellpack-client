import { useState } from "react";
import { Button } from "antd";
import "./style.css";

interface ErrorLogsProps {
    errorLogs: string;
    getLogs: () => Promise<void>;
}

const ErrorLogs = (props: ErrorLogsProps): JSX.Element => {
    const { errorLogs, getLogs } = props;
    const [viewErrorLogs, setViewErrorLogs] = useState<boolean>(true);

    const toggleLogs = async () => {
        if (errorLogs.length === 0) {
            await getLogs();
        } else {
            setViewErrorLogs(!viewErrorLogs);
        }
    }
    return (
        <div>
            <Button className="collapsible" onClick={toggleLogs}>Logs</Button>
            {viewErrorLogs && errorLogs.length > 0 && (
                <div className="log-box">
                    <pre>{errorLogs}</pre>
                </div>
            )}
        </div>
    );
};

export default ErrorLogs;