import React, { useState } from "react";
import ModelList from "./model/ModelList";
const Prompt = () => {

    const [prompt, setPrompt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedModelId, setSelectedModelId] = useState<number>(0);


    const handleSubmit = async () => {
        try {
            setLoading(true);
            // Your submit logic here, e.g., sending data to an API
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating async action
            console.log("Form submitted successfully!");
        } catch (error) {
            console.error("Error submitting:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleModelChange = (modelId: number) => {
        setSelectedModelId(modelId);
        console.log("Selected Model ID:", modelId);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Label & Model Selection in one line */}
                <div className="flex items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Prompt Input</h3>
                    <ModelList onModelChange={handleModelChange} />
                </div>

                <div className="bg-gray-100 rounded-lg p-4">
                    <textarea
                        className="w-full h-48 text-gray-700 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Type your input here..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    ></textarea>
                </div>

                <div className="flex justify-end">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 flex items-center justify-center"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z" className="opacity-75" />
                            </svg>
                        ) : 'Submit'}
                    </button>

                </div>
            </div>


        </>
    )
}

export default Prompt;