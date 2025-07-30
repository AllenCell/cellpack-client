import { useState } from "react";
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
            <button className="collapsible" onClick={toggleLogs}>Logs</button>
            {viewErrorLogs && errorLogs.length > 0 && (
                <div className="logBox">
                    <pre>{errorLogs}</pre>
                </div>
            )}
        </div>
    );
};

export default ErrorLogs;