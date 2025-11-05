import { useState } from "react";
import { Collapse } from "antd";
import { usePackingData } from "../../state/store";
import { JOB_STATUS } from "../../constants/aws";
import "./style.css";

const ErrorLogs = (): JSX.Element => {
    const [viewErrorLogs, setViewErrorLogs] = useState<boolean>(true);
    const {jobStatus, jobLogs: errorLogs} = usePackingData();

    const toggleLogs = async () => {
        setViewErrorLogs(!viewErrorLogs);
    };

    const items = [{
        key: "1",
        label: "Logs",
        children: (
            <div className="log-box">
                <pre>{errorLogs}</pre>
            </div>
        )
    }];

    if (jobStatus !== JOB_STATUS.FAILED) {
        return <></>
    };

    return (
        <div>
            <Collapse
                items={items}
                activeKey={viewErrorLogs && errorLogs.length > 0 ? ["1"] : []}
                onChange={toggleLogs}
            />
        </div>
    );
};

export default ErrorLogs;
