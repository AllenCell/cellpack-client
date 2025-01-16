import { useEffect, useState } from "react";
import "./App.css";
import { queryFirebase, getLocationDict, getDocById } from "./firebase";
import {
    getSubmitPackingUrl,
    packingStatusUrl,
    getLogsUrl,
    JobStatus,
} from "./constants/awsBatch";
import {
    FIRESTORE_COLLECTIONS
} from "./constants/firebaseConstants";
import { SIMULARIUM_EMBED_URL } from "./constants/urls";
import {
    AWSBatchJobsResponse,
    CloudWatchLogsResponse,
    FirebaseDict,
} from "./types";

function App() {
    const [recipes, setRecipes] = useState<FirebaseDict>({});
    const [configs, setConfigs] = useState<FirebaseDict>({});
    const [selectedRecipe, setSelectedRecipe] = useState("");
    const [selectedConfig, setSelectedConfig] = useState("");
    const [jobId, setJobId] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [logStreamName, setLogStreamName] = useState(
        ""
    );
    const [jobLogs, setJobLogs] = useState<string[]>([]);
    const [resultUrl, setResultUrl] = useState<string>("");

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
        const recipeDict = await getLocationDict(FIRESTORE_COLLECTIONS.EXAMPLE_RECIPES);
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
        const configDict = await getLocationDict(FIRESTORE_COLLECTIONS.CONFIGS);
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
        const id = jobIdFromSubmit || jobId;
        const url = packingStatusUrl(id);
        const request: RequestInfo = new Request(
            url,
            {
                method: "GET",
            }
        );
        let localJobStatus = "";
        while (localJobStatus !== JobStatus.SUCCEEDED && localJobStatus !== JobStatus.FAILED) {
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
        setResultUrl(SIMULARIUM_EMBED_URL + url);
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

    const selectRecipe = async (recipe: string) => {
        setSelectedRecipe(recipe);
        // Determine the firebaseId for this recipe
        let firebaseId = "unknown"
        for (let name in recipes) {
            let path = recipes[name]["path"];
            if (path == recipe) {
                firebaseId = recipes[name]["firebaseId"]
            }
        }
        console.log("firebase id: ", firebaseId);
        const recipeStr = await getDocById(FIRESTORE_COLLECTIONS.EXAMPLE_RECIPES, firebaseId);
        console.log(recipeStr);
    }

    const jobSucceeded = jobStatus == JobStatus.SUCCEEDED;
    const showLogButton = jobSucceeded || jobStatus == JobStatus.FAILED;

    return (
        <div className="app">
            <h1>Welcome to cellPACK</h1>
            <div className="input-container">
                <select
                    value={selectedRecipe}
                    onChange={(e) => selectRecipe(e.target.value)}
                >
                    <option value="" disabled>
                        Select a recipe
                    </option>
                    {Object.entries(recipes).map(([key, value]) => (
                        <option key={key} value={value["path"]}>
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
                        <option key={key} value={value["path"]}>
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
            {showLogButton && (
                <div>
                    <button onClick={getLogs}>Logs</button>
                    {jobLogs.length > 0 && (
                        <div className="logs-container">
                            {jobLogs.map((log, index) => (
                                <div key={index} className="log-entry">
                                    <span>{log}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;