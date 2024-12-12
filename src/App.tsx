import { useEffect, useState } from "react";
import "./App.css";
import { queryFirebase, getLocationDict } from "./firebase";

function App() {
    const [recipes, setRecipes] = useState<{ [key: string]: string }>({});
    const [configs, setConfigs] = useState<{ [key: string]: string }>({});
    const [selectedRecipe, setSelectedRecipe] = useState("");
    const [selectedConfig, setSelectedConfig] = useState("");
    const [jobId, setJobId] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [logStreamName, setLogStreamName] = useState(
        // "cellpack-test-job-definition/default/49c7ae8009714e189bf7e1bdd9674912"
        ""
    );
    const [jobLogs, setJobLogs] = useState("");
    const [resultUrl, setResultUrl] = useState<string>("");

    const submitRecipe = async () => {
        const baseUrl =
            "https://ng44ddk8v1.execute-api.us-west-2.amazonaws.com/testing/submit-packing";
        let url = `${baseUrl}?recipe=${selectedRecipe}`;
        if (selectedConfig) {
            url += `&config=${selectedConfig}`;
        }
        const request: RequestInfo = new Request(url, {
            method: "POST",
        });
        console.log("recipe", selectedRecipe);
        const response = await fetch(request);
        const data = await response.json();
        setJobId(data.jobId);
        console.log(`jobId: ${data.jobId}`);
        return data.jobId;
    };

    const getRecipes = async () => {
        const recipeDict = await getLocationDict("available_recipes");
        return recipeDict;
    };

    useEffect(() => {
        const fetchRecipes = async () => {
            const recipeDict = await getRecipes();
            setRecipes(recipeDict);
        };
        fetchRecipes();
    }, []);

    // currently hardcoded, but could be a function that fetches from firebase
    const getConfigs = async () => {
        return {
            default: "examples/packing-configs/run.json",
            debug: "examples/packing-configs/debug.json",
            sparse: "examples/packing-configs/sparse-packing.json",
        };
    };

    useEffect(() => {
        const fetchConfigs = async () => {
            const configDict = await getConfigs();
            setConfigs(configDict);
        };
        fetchConfigs();
    }, []);

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
        while (localJobStatus !== "SUCCEEDED" && localJobStatus !== "FAILED") {
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
        // window.open("https://simularium.allencell.org/viewer?trajUrl="+url);
        setResultUrl("https://simularium.allencell.org/viewer?trajUrl=" + url);
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
        submitRecipe().then((jobIdFromSubmit) => checkStatus(jobIdFromSubmit));
    };

    const jobSucceeded = jobStatus == "SUCCEEDED";
    const showLogButton = jobSucceeded || jobStatus == "FAILED";

    return (
        <div className="app">
            <h1>Welcome to cellPACK</h1>
            <div className="input-container">
                <select
                    value={selectedRecipe}
                    onChange={(e) => setSelectedRecipe(e.target.value)}
                >
                    <option value="" disabled>
                        Select a recipe
                    </option>
                    {Object.entries(recipes).map(([key, value]) => (
                        <option key={key} value={value}>
                            {key}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedConfig}
                    onChange={(e) => setSelectedConfig(e.target.value)}
                >
                    <option value="" disabled>
                        Select a config
                    </option>
                    {Object.entries(configs).map(([key, value]) => (
                        <option key={key} value={value}>
                            {key}
                        </option>
                    ))}
                </select>
                <button onClick={runPacking} disabled={!selectedRecipe}>
                    Pack
                </button>
            </div>
            <div>Job Status: {jobStatus}</div>
            {jobSucceeded && (
                <div>
                    <button onClick={fetchResultUrl}>View result</button>
                </div>
            )}
            {showLogButton && (
                <div>
                    <button onClick={getLogs}>Logs</button>
                    {jobLogs}
                </div>
            )}
            {
                resultUrl && (
                    <div>
                        <iframe
                            src={resultUrl}
                            style={{
                                width: "100%",
                                height: "500px",
                                border: "1px solid black",
                            }}
                        ></iframe>
                        {/* this is too small to display results, maybe a modal? */}
                    </div>
                )
            }
        </div>
    );
}

export default App;


