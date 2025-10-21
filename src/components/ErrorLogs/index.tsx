import { useState } from "react";
import { Button, Drawer } from "antd";
import "./style.css";

interface ErrorLogsProps {
    errorLogs: string;
}

const ErrorLogs = (props: ErrorLogsProps): JSX.Element => {
    const { errorLogs } = props;
    const [viewErrorLogs, setViewErrorLogs] = useState<boolean>(true);

    const toggleLogs = () => {
        setViewErrorLogs(!viewErrorLogs);
    };

    return (
        <>
            <Button color="primary" variant="filled" onClick={toggleLogs}>
                Logs
            </Button>
            <Drawer
                title="Logs"
                placement="right"
                closable={true}
                onClose={toggleLogs}
                open={viewErrorLogs}
            >
                <div className="log-box">
                    <pre>{errorLogs}</pre>
                </div>
            </Drawer>
        </>
    );
};

export default ErrorLogs;
