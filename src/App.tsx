import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "antd";
import JSZip from "jszip";
import "./App.css";
import { getResultPath, getDocById, getJobStatus, addRecipe, getOutputsDirectory } from "./utils/firebase";
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
import PackingInput from "./components/PackingInput";
import Viewer from "./components/Viewer";
import ErrorLogs from "./components/ErrorLogs";

function App() {
    const [jobId, setJobId] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [jobLogs, setJobLogs] = useState<string>("");
    const [resultUrl, setResultUrl] = useState<string>("");
    const [viewResults, setViewResults] = useState<boolean>(false);
    const [runTime, setRunTime] = useState<number>(0);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);

    let start = 0;

    async function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

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

    const toggleResults = () => {
        if (resultUrl == "") {
            fetchResultUrl();
        }
        setViewResults(!viewResults);
    }

    const parseS3ListResponse = (xmlText: string): string[] => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        const contents = xmlDoc.getElementsByTagName("Contents");
        const fileNames: string[] = [];
        
        for (let i = 0; i < contents.length; i++) {
            const keyElement = contents[i].getElementsByTagName("Key")[0];
            if (keyElement) {
                const fullPath = keyElement.textContent || "";
                const fileName = fullPath.split("/").pop();
                if (fileName && fileName.length > 0) {
                    fileNames.push(fileName);
                }
            }
        }
        
        return fileNames;
    };

    const downloadOutputsFromS3 = async (outputsDir: string, jobId: string) => {
        // convert firebase console URL to S3 API format
        // from: "https://us-west-2.console.aws.amazon.com/s3/buckets/cellpack-results/runs/test_single_sphere/id/"
        // to bucket: "cellpack-results" and path: "runs/test_single_sphere/id"
        const match = outputsDir.match(/s3\/buckets\/([^/]+)\/(.+)\/?$/);
        if (!match) {
            throw new Error("Invalid S3 URL format");
        }
        
        const bucketName = match[1];
        const folderPath = match[2].replace(/\/$/, "");
        // temp note: list-type=2 is for version 2 of the API, provides object's name and metadata
        const listUrl = `https://s3.us-west-2.amazonaws.com/${bucketName}?prefix=${folderPath}/&list-type=2`;
        
        console.log("Attempting to list S3 directory:", listUrl);
        
        const listResponse = await fetch(listUrl);
        const xmlText = await listResponse.text();
        const fileNames = parseS3ListResponse(xmlText);
        
        console.log(`Found ${fileNames.length} files:`, fileNames);
        
        const zip = new JSZip();
        let filesAdded = 0;
        
        for (const fileName of fileNames) {
            const fileUrl = `https://s3.us-west-2.amazonaws.com/${bucketName}/${folderPath}/${fileName}`;
            console.log(`Downloading: ${fileUrl}`);
            
            const response = await fetch(fileUrl);
            if (response.ok) {
                const blob = await response.blob();
                zip.file(fileName, blob);
                filesAdded++;
                console.log(`Added ${fileName} to zip`);
            } else {
                console.log(`Failed to download ${fileName}: ${response.status}`);
            }
        }
        
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        const downloadUrl = window.URL.createObjectURL(zipBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `cellpack-outputs-${jobId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        console.log(`Downloaded zip with ${filesAdded} files`);
    };

    const downloadOutputs = async () => {
        const id = "take3"; // jobIdFromDownload || jobId;
        setIsDownloading(true);
        
        const outputsDir = await getOutputsDirectory(id);
        await downloadOutputsFromS3(outputsDir, id);
        setIsDownloading(false);
    }


    const jobSucceeded = jobStatus == JOB_STATUS.DONE;
    const showLogButton = jobStatus == JOB_STATUS.FAILED;
    const showResults = resultUrl && viewResults;

    return (
        <div className="app">
            <h1>Welcome to cellPACK</h1>
            <PackingInput startPacking={startPacking} />
            <h3>Job Status: {jobStatus}</h3>
            {jobSucceeded && (
                <div>
                    {runTime > 0 && (<h4>Time to Run: {runTime} sec</h4>)}
                    <Button onClick={toggleResults}>Results</Button>
                    <Button onClick={() => downloadOutputs()} loading={isDownloading}>
                        Download Results
                    </Button>
                </div>
            )}
            {showResults && <Viewer resultUrl={resultUrl} />}
            {showLogButton && <ErrorLogs errorLogs={jobLogs} getLogs={getLogs} />}
        </div>
    );
}

export default App;