import { useState } from "react";
import "./App.css";
import {queryFirebase} from "./firebase";

function App() {
    const [recipe, setRecipe] = useState("examples/recipes/v2/one_sphere.json");
    const [jobId, setJobId] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [resultUrl, setResultUrl] = useState("");
    const [logStreamName, setLogStreamName] = useState(
        "cellpack-test-job-definition/default/49c7ae8009714e189bf7e1bdd9674912"
    );
    const [jobLogs, setJobLogs] = useState("");

    const submitRecipe = async () => {
        console.log("recipe", recipe);
        const request: RequestInfo = new Request(
            'https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing/submit-packing?recipe=' + recipe,
            {
                method: 'POST',
            }
        )
        const response = await fetch(request);
        const data = await response.json();
        console.log("data", data);
        setJobId(data.jobId)
        console.log("jobId", jobId);
    };

    const checkStatus = async () => {
        const request: RequestInfo = new Request(
            "https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing/packing-status?jobId=" +
            jobId,
            {
                method: "GET",
            }
        );
        let localJobStatus = "nothing yet!";
        while (localJobStatus !== "SUCCEEDED") {
            const response = await fetch(request);
            const data = await response.json();
            if (localJobStatus !== data.jobs[0].status) {
                console.log("new status!");
                localJobStatus = data.jobs[0].status;
                setJobStatus(data.jobs[0].status);
            }
            setLogStreamName(data.jobs[0].container.logStreamName);
        }
    };

    const fetchResultUrl = async () => {
        const url = await queryFirebase(jobId);
        setResultUrl(url);
    };

    const getLogs = async () => {
        const request: RequestInfo = new Request(
            "https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing/logs?logStreamName=" +
            logStreamName,
            {
                method: "GET",
            }
        );
        const response = await fetch(request);
        const data = await response.json();
        const logs = data.events.map((event: { message: string }) => event.message);
        setJobLogs(logs);
    };

    return (
        <div className="app">
            <h1>Welcome to cellPACK</h1>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Enter a recipe"
                    value={recipe}
                    onChange={(e) => setRecipe(e.target.value)}
                />
                <button onClick={submitRecipe}>Pack</button>
            </div>
            <div>
                <button onClick={checkStatus}>Check Status</button>
                Job Status: {jobStatus}
            </div>
            <div>
                <button onClick={fetchResultUrl}>Query Firebase</button>
                Result URL: {resultUrl}
            </div>
            <div>
                <button onClick={getLogs}>Logs</button>
                {jobLogs}
            </div>
        </div>
    );
}

export default App;
