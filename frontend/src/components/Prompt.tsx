import React, { useState } from "react";

const Prompt = () => {

    const [prompt, setPrompt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = () => {
        setLoading(true);

        try {
            setTimeout(() => {
                console.log('Submitted Prompt:', prompt);
            }, 2000);
        } catch (error) {

        } finally {
            setLoading(false); // Simulate completion after 2 seconds

        }

    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Prompt Input</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                    <textarea
                        className="w-full h-48 text-gray-700 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Type your input here..."
                        value={prompt} // Bind value to state
                        onChange={(e) => setPrompt(e.target.value)} // Update state on change
                    ></textarea>
                </div>
                <div className="flex justify-end">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 flex items-center justify-center"
                        onClick={handleSubmit}
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z" className="opacity-75" />
                            </svg>
                        ) : 'Submit'}
                    </button>                </div>
            </div>


        </>
    )
}

export default Prompt;