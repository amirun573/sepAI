import React, { useState } from "react";
import ModelList from "./model/ModelList";
import API from "@/_Common/function/api";
import { APICode } from "@/_Common/enum/api-code.enum";

const Prompt = ({ onSendMessage }: { onSendMessage: (message: string) => void }) => {
    const [prompt, setPrompt] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedModelId, setSelectedModelId] = useState<number>(0);
    const [error, setError] = useState<string>("");

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            if (!prompt.trim() || selectedModelId <= 0) {
                throw new Error("Please enter a prompt and select a model.");
            }

            // Display user message in chat
            onSendMessage(prompt);

            const response = await API({
                url: "models/prompt",
                API_Code: APICode.prompt,
                data: {
                    prompt,
                    model_id: selectedModelId,
                },
            });

            if (!response.success) {
                throw new Error("Failed to submit");
            }

            // Display AI response in chat
            onSendMessage(response.data);
        } catch (error: any) {
            setError(error?.message || "Failed to submit");
        } finally {
            setLoading(false);
            setPrompt(""); // Clear input after submission
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Prompt Input</h3>
                <ModelList onModelChange={setSelectedModelId} />
            </div>

            {/* Input Area */}
            <div className="bg-gray-100 rounded-lg p-4">
                <textarea
                    className="w-full h-40 text-gray-700 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Type your input here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 flex items-center justify-center disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z" className="opacity-75" />
                        </svg>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>
        </div>
    );
};

export default Prompt;
