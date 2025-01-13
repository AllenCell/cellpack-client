import { useEffect, useState } from "react";
import "./App.css";
import { queryFirebase, getLocationDict } from "./firebase";
import {
    getSubmitPackingUrl,
    packingStatusUrl,
    getLogsUrl,
} from "./constants/apiEndpoints";
import {
    AWSBatchJobsResponse,
    CloudWatchLogsResponse,
    StringDict,
} from "./types";

function App() {
    const [recipes, setRecipes] = useState<StringDict>({});
    const [configs, setConfigs] = useState<StringDict>({});
    const [selectedRecipe, setSelectedRecipe] = useState("");
    const [selectedConfig, setSelectedConfig] = useState("");
    const [jobId, setJobId] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [logStreamName, setLogStreamName] = useState(
        ""
    );
    const [jobLogs, setJobLogs] = useState<string[]>([]);
    const [resultUrl, setResultUrl] = useState<string>("https://simularium.allencell.org/embed?trajFileName=endocytosis.simularium");

    const submitRecipe = async () => {
        const url = getSubmitPackingUrl(selectedRecipe, selectedConfig);
        const request: RequestInfo = new Request(url, {
            method: "POST",
        });
        const response = await fetch(request);
        const data = await response.json();
        setJobId(data.jobId);
        return data.jobId;
    };

    const getRecipes = async () => {
        const recipeDict = await getLocationDict("example_recipes");
        return recipeDict;
    };

    useEffect(() => {
        const fetchRecipes = async () => {
            const recipeDict = await getRecipes();
            setRecipes(recipeDict);
        };
        fetchRecipes();
    }, []);


    const getConfigs = async () => {
        const configDict = await getLocationDict("configs");
        return configDict;
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
        const url = packingStatusUrl(id);
        const request: RequestInfo = new Request(
            url,
            {
                method: "GET",
            }
        );
        let localJobStatus = "";
        while (localJobStatus !== "SUCCEEDED" && localJobStatus !== "FAILED") {
            const response = await fetch(request);
            const data: AWSBatchJobsResponse = await response.json();
            if (localJobStatus !== data.jobs[0].status) {
                localJobStatus = data.jobs[0].status;
                setJobStatus(data.jobs[0].status);
            }
            setLogStreamName(data.jobs[0].container.logStreamName);
        }
    };

    const fetchResultUrl = async () => {
        const url = await queryFirebase(jobId);
        setResultUrl("https://simularium.allencell.org/viewer?trajUrl=" + url);
    };

    const getLogs = async () => {
        const url = getLogsUrl(logStreamName);
        const request: RequestInfo = new Request(
            url,
            {
                method: "GET",
            }
        );
        const response = await fetch(request);
        const data: CloudWatchLogsResponse = await response.json();
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
                                width: "1000px",
                                height: "600px",
                                border: "1px solid black",
                            }}
                        ></iframe>
                    </div>
                )
            }
        </div>
    );
}

export default App;


