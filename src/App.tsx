import { useState } from "react";
import "./App.css";
import { queryFirebase } from "./firebase";

function App() {
    const [recipe, setRecipe] = useState("examples/recipes/v2/one_sphere.json");
    const [jobId, setJobId] = useState("");
    const [jobStatus, setJobStatus] = useState("");
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
        setJobId(data.jobId);
        console.log(`jobId: ${data.jobId}`);
        return data.jobId;
    };

    const checkStatus = async (jobIdFromSubmit: string) => {
        const id = jobIdFromSubmit ? jobIdFromSubmit : jobId;
        const request: RequestInfo = new Request(
            "https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing/packing-status?jobId=" +
            id,
            {
                method: "GET",
            }
        );
        let localJobStatus = "nothing yet!";
        console.log("going to check status")
        while ((localJobStatus !== "SUCCEEDED") && (localJobStatus !== "FAILED")) {
            const response = await fetch(request);
            const data = await response.json();
            if (localJobStatus !== data.jobs[0].status) {
                localJobStatus = data.jobs[0].status;
                setJobStatus(data.jobs[0].status);
            }
            setLogStreamName(data.jobs[0].container.logStreamName);
        }
    };

    const fetchResultUrl = async () => {
        const url = await queryFirebase(jobId);
        window.open("https://simularium.allencell.org/viewer?trajUrl="+url);
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

    const runPacking = async () => {
        submitRecipe()
            .then((jobIdFromSubmit) => checkStatus(jobIdFromSubmit))
    }

    const jobSucceeded = (jobStatus == "SUCCEEDED");
    const showLogButton = (jobSucceeded || (jobStatus == "FAILED"));

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
                <button onClick={runPacking}>Pack</button>
            </div>
            <div>
                Job Status: {jobStatus}
            </div>
            {jobSucceeded && (<div>
                <button onClick={fetchResultUrl}>View result</button>
            </div>)}
            {showLogButton && (<div>
                <button onClick={getLogs}>Logs</button>
                {jobLogs}
            </div>)}
        </div>
    );
}

export default App;
