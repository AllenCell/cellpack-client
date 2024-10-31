import { useState } from "react";
import "./App.css";

function App() {
    const [recipe, setRecipe] = useState("examples/recipes/v2/one_sphere.json");
    const [jobId, setJobId] = useState("");
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
    }
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
                <button onClick={submitRecipe}>
                    Pack
                </button>
            </div>
        </div>
    );
}

export default App;
