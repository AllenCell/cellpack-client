import { useState } from "react";
import { Layout, Typography, Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { getJobStatus, updateJobStatusTimestamp } from "./utils/firebase";
import { getFirebaseRecipe, recipeToString } from "./utils/recipeLoader";
import { getSubmitPackingUrl, JOB_STATUS } from "./constants/aws";
import { FIRESTORE_FIELDS } from "./constants/firebase";
import { SIMULARIUM_VIEWER_URL } from "./constants/urls";
import {
    useCurrentRecipeData,
    useJobId,
    useOutputsDirectory,
    useResultUrl,
    useRunTime,
    useSetJobId,
    useSetPackingResults,
} from "./state/store";
import { useMediaQuery } from "./hooks/useMediaQuery";
import PackingInput from "./components/PackingInput";
import Viewer from "./components/Viewer";
import StatusBar from "./components/StatusBar";
import SmallScreenWarning from "./components/SmallScreenWarning";

import "./App.css";

const { Header, Content, Sider, Footer } = Layout;
const { Link } = Typography;
const APP_TITLE = "cellPACK Studio";

function App() {
    const [jobStatus, setJobStatus] = useState<string>("");
    const [jobLogs, setJobLogs] = useState<string>("");
    const [menuOpen, setMenuOpen] = useState(false);
    const isSmallScreen = useMediaQuery("(max-width: 900px)");
    const setJobId = useSetJobId();
    const jobId = useJobId();
    const setPackingResults = useSetPackingResults();
    const runTime = useRunTime();
    const outputDir = useOutputsDirectory();
    const edits = useCurrentRecipeData()?.edits || {};
    const resultUrl = useResultUrl();
    const shareUrl = resultUrl ? `${SIMULARIUM_VIEWER_URL}${resultUrl}` : "";

    let start = 0;

    async function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const recipeHasChanged = async (
        recipeId: string,
        recipeString: string
    ): Promise<boolean> => {
        const originalRecipe = await getFirebaseRecipe(recipeId);
        return !(recipeToString(originalRecipe) == recipeString);
    };

    const submitRecipe = async (
        recipeId: string,
        configId: string,
        recipeString: string
    ) => {
        const recipeChanged: boolean = await recipeHasChanged(
            recipeId,
            recipeString
        );
        const firebaseRecipe = recipeChanged
            ? undefined
            : "firebase:recipes/" + recipeId;
        const firebaseConfig = configId
            ? "firebase:configs/" + configId
            : undefined;

        const url = getSubmitPackingUrl(firebaseRecipe, firebaseConfig);
        const requestBody = recipeChanged ? recipeString : undefined;
        const request: RequestInfo = new Request(url, { method: "POST", body: requestBody });
        start = Date.now();
        const response = await fetch(request);
        setJobStatus(JOB_STATUS.SUBMITTED);
        setJobLogs("");
        if (response.ok) {
            const data = await response.json();
            setJobId(data.jobId);
            setJobStatus(JOB_STATUS.STARTING);
            return data.jobId;
        } else {
            const errorText = await response.text();
            setJobStatus(JOB_STATUS.FAILED);
            setJobLogs(errorText);
        }
    };

    const startPacking = async (
        recipeId: string,
        configId: string,
        recipeString: string
    ) => {
        await submitRecipe(recipeId, configId, recipeString).then(
            (jobIdFromSubmit) => checkStatus(jobIdFromSubmit)
        );
    };

    const checkStatus = async (jobIdFromSubmit: string) => {
        const id = jobIdFromSubmit || jobId;
        let localJobStatus = await getJobStatus(id);
        if (localJobStatus) {
            setJobStatus(localJobStatus.status);
        }
        while (
            localJobStatus?.status !== JOB_STATUS.DONE &&
            localJobStatus?.status !== JOB_STATUS.FAILED
        ) {
            await sleep(500);
            const newJobStatus = await getJobStatus(id);
            if (
                newJobStatus &&
                localJobStatus?.status !== newJobStatus.status
            ) {
                localJobStatus = newJobStatus;
                setJobStatus(newJobStatus.status);
            }
        }

        // Update the job status timestamp after reading the final status to
        // ensure we have the most recent timestamp for retention policy
        await updateJobStatusTimestamp(id);

        const range = (Date.now() - start) / 1000;
        if (localJobStatus.status == JOB_STATUS.DONE) {
            setPackingResults({
                jobId: id,
                resultUrl: localJobStatus.result_path,
                runTime: range,
                outputDir: localJobStatus.outputs_directory,
                edits: edits,
            });
        } else if (localJobStatus.status == JOB_STATUS.FAILED) {
            setJobLogs(`Packing job failed: ${localJobStatus.error_message}`);
            setPackingResults({
                jobId: id,
                resultUrl: "",
                runTime: range,
                outputDir: "",
                edits: {}
            });
        }
    };

    return (
        <Layout className="app-container">
            <SmallScreenWarning />
            <Header
                className="header"
                style={{ justifyContent: "space-between" }}
            >
                <div className="header-left">
                    {isSmallScreen && (
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={() => setMenuOpen(true)}
                            className="menu-toggle"
                            aria-label="Open menu"
                        />
                    )}
                    <h2 className="header-title">{APP_TITLE}</h2>
                </div>
                <Link
                    href="https://github.com/mesoscope/cellpack"
                    className="header-link"
                >
                    GitHub
                </Link>
            </Header>
            <Layout>
                {isSmallScreen ? (
                    <>
                        <Drawer
                            title={APP_TITLE}
                            placement="left"
                            open={menuOpen}
                            onClose={() => setMenuOpen(false)}
                            width="85%"
                            forceRender
                            styles={{ header: { marginBottom: 14 }, body: { padding: "0 12px" } }}
                        >
                            <PackingInput startPacking={startPacking} />
                        </Drawer>
                        <Content className="content-container">
                            <Viewer />
                        </Content>
                    </>
                ) : (
                    <>
                        <Sider width="35%" theme="light" className="sider">
                            <PackingInput startPacking={startPacking} />
                        </Sider>
                        <Content className="content-container">
                            <Viewer />
                        </Content>
                    </>
                )}
            </Layout>
            <Footer className="footer">
                <StatusBar
                    jobStatus={jobStatus}
                    runTime={runTime}
                    jobId={jobId}
                    errorLogs={jobLogs}
                    outputDir={outputDir}
                    shareUrl={shareUrl}
                />
            </Footer>
        </Layout>
    );
}

export default App;
