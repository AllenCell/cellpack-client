import { Layout, Typography } from "antd";
import PackingInput from "./components/PackingInput";
import Viewer from "./components/Viewer";
import ErrorLogs from "./components/ErrorLogs";
import StatusBar from "./components/StatusBar";
import "./App.css";

const { Header, Content } = Layout;
const { Link } = Typography;

function App() {

    return (
        <div className="app-container">
            <Header className="header" style={{ justifyContent: "space-between" }}>
                <h2 className="header-title">cellPACK demo</h2>
                <Link href="https://github.com/mesoscope/cellpack" className="header-link">GitHub</Link>
            </Header>
            <Content className="content-container">
                <PackingInput />
                <StatusBar />
                <ErrorLogs />
            </Content>
            <Viewer />
        </div>
    );
}

export default App;