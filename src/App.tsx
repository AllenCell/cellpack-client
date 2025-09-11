import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Layout, Typography, Button } from "antd";
import "./App.css";
import { getResultPath, getDocById, getJobStatus, addRecipe } from "./utils/firebase";
import { getFirebaseRecipe, jsonToString } from "./utils/recipeLoader";
import {
    getSubmitPackingUrl,
    JOB_STATUS,
} from "./constants/aws";
import {
    FIRESTORE_COLLECTIONS,
    FIRESTORE_FIELDS,
} from "./constants/firebase";
import { SIMULARIUM_EMBED_URL } from "./constants/urls";
import { downloadOutputs } from "./utils/aws";
import PackingInput from "./components/PackingInput";
import Viewer from "./components/Viewer";
import ErrorLogs from "./components/ErrorLogs";

const { Header, Content, Footer } = Layout;
const { Link } = Typography;

function App() {
    const [jobId, setJobId] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [jobLogs, setJobLogs] = useState<string>("");
    const [resultUrl, setResultUrl] = useState<string>("");
    const [runTime, setRunTime] = useState<number>(0);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    let start = 0;

    async function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const recipeHasChanged = async (recipeId: string, recipeString: string): Promise<boolean> => {
        const originalRecipe = await getFirebaseRecipe(recipeId);
        return !(jsonToString(originalRecipe) == recipeString);
    }

    const recipeToFirebase = (recipe: string, path: string, id: string): object => {
        const recipeJson = JSON.parse(recipe);
        if (recipeJson.bounding_box) {
            const flattened_array = Object.assign({}, recipeJson.bounding_box);
            recipeJson.bounding_box = flattened_array;
        }
        recipeJson[FIRESTORE_FIELDS.RECIPE_PATH] = path;
        recipeJson[FIRESTORE_FIELDS.NAME] = id;
        return recipeJson;
    }

    const submitRecipe = async (recipeId: string, configId: string, recipeString: string) => {
        setResultUrl("");
        setRunTime(0);
        let firebaseRecipe = "firebase:recipes/" + recipeId;
        const firebaseConfig = configId ? "firebase:configs/" + configId : undefined;
        const recipeChanged: boolean = await recipeHasChanged(recipeId, recipeString);
        if (recipeChanged) {
            const recipeId = uuidv4();
            firebaseRecipe = "firebase:recipes_edited/" + recipeId;
            const recipeJson = recipeToFirebase(recipeString, firebaseRecipe, recipeId);
            try {
                await addRecipe(recipeId, recipeJson);
            } catch(e) {
                setJobStatus(JOB_STATUS.FAILED);
                setJobLogs(String(e));
                return;
            }

        }
        const url = getSubmitPackingUrl(firebaseRecipe, firebaseConfig);
        const request: RequestInfo = new Request(url, { method: "POST" });
        start = Date.now();
        const response = await fetch(request);
        setJobStatus(JOB_STATUS.SUBMITTED);
        const data = await response.json();
        if (response.ok) {
            setJobId(data.jobId);
            setJobStatus(JOB_STATUS.STARTING);
            return data.jobId;
        } else {
            setJobStatus(JOB_STATUS.FAILED);
            setJobLogs(JSON.stringify(data));
        }
    };

    const startPacking = async (recipeId: string, configId: string, recipeString: string) => {
        submitRecipe(recipeId, configId, recipeString).then((jobIdFromSubmit) => checkStatus(jobIdFromSubmit));
    }

    const checkStatus = async (jobIdFromSubmit: string) => {
        const id = jobIdFromSubmit || jobId;
        let localJobStatus = await getJobStatus(id);
        while (localJobStatus !== JOB_STATUS.DONE && localJobStatus !== JOB_STATUS.FAILED) {
            await sleep(500);
            const newJobStatus = await getJobStatus(id);
            if (localJobStatus !== newJobStatus) {
                localJobStatus = newJobStatus;
                setJobStatus(newJobStatus);
            }
        }
        const range = (Date.now() - start) / 1000;
        setRunTime(range);
        if (localJobStatus == JOB_STATUS.DONE) {
            fetchResultUrl(id);
        } else if (localJobStatus == JOB_STATUS.FAILED) {
            getLogs(id);
        }
    };

    const fetchResultUrl = async (jobIdFromSubmit?: string) => {
        const id = jobIdFromSubmit || jobId;
        const url = await getResultPath(id);
        setResultUrl(SIMULARIUM_EMBED_URL + url);
    };

    const getLogs = async (jobIdFromSubmit?: string) => {
        const id = jobIdFromSubmit || jobId;
        const logStr: string = await getDocById(FIRESTORE_COLLECTIONS.JOB_STATUS, id);
        setJobLogs(logStr);
    };
    const jobSucceeded = jobStatus == JOB_STATUS.DONE;
    const showLogs = jobStatus == JOB_STATUS.FAILED;
    const submitEnabled = (jobStatus == "" || jobStatus == JOB_STATUS.DONE || jobStatus == JOB_STATUS.FAILED);

    const downloadResults = async (jobId: string) => {
        setIsDownloading(true);
        await downloadOutputs(jobId);
        setIsDownloading(false);
    }

    return (
        <div className="app-container">
            <Header className="header" style={{ justifyContent: "space-between" }}>
                <h2 className="header-title">cellPACK demo</h2>
                <Link href="https://github.com/mesoscope/cellpack" className="header-link">GitHub</Link>
            </Header>
            <Content className="content-container">
                <PackingInput startPacking={startPacking} submitEnabled={submitEnabled} />
                {jobStatus && (
                    <div className="status-row">
                        <div className="status-container status-bar">
                            <div><b>Status</b> {jobStatus}</div>
                            {jobSucceeded && runTime > 0 && (<div><b>Run time</b> {runTime} sec</div>)}
                        </div>
                        {jobSucceeded && (
                            <Button 
                                onClick={() => downloadResults(jobId)} 
                                loading={isDownloading}
                                color="primary"
                                variant="filled"
                                className="download-button"
                            >
                                Download Packing Result
                            </Button>
                        )}
                    </div>
                )}
                {showLogs && <ErrorLogs errorLogs={jobLogs} getLogs={getLogs} />}
            </Content>
            {resultUrl && <Viewer resultUrl={resultUrl} />}
            <Footer className="footer" />
        </div>
    );
}

export default App;