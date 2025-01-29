import React from "react";

const Prompt = () => {

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Prompt Input</h3>
                <div className="bg-gray-100 rounded-lg p-4">
                    <textarea
                        className="w-full h-48 text-gray-700 p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Type your input here..."
                    ></textarea>
                </div>
                <div className="flex justify-end">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4">Submit</button>
                </div>
            </div>


        </>
    )
}

export default Prompt;