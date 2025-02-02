'use client';

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import useSWR from "swr";
import API from "@/_Common/function/api";
import { APICode } from "@/_Common/enum/api-code.enum";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MarketPlace: React.FC = () => {
    const { data, error, isLoading } = useSWR("https://huggingface.co/api/models", fetcher);
    const [expandedModel, setExpandedModel] = useState<string | null>(null);
    const { data: modelDetails, mutate } = useSWR(
        expandedModel ? `https://huggingface.co/api/models/${expandedModel}` : null,
        fetcher
    );
    const [visibleCount, setVisibleCount] = useState(10); // Show 10 models initially

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10); // Load 10 more models
    };

    const handleDownloadModel = async (model_id: string) => {
        try {

            if (!model_id)
                throw Error("NO Model ID Found");

            console.log("model_id==>", model_id);

            return;
        } catch (error: any) {
            alert(error?.message || "Internal Server Error");
            return;
        }
    }

    if (error) return <div className="text-red-500">Failed to load models.</div>;
    if (isLoading) return <div className="text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <Header />

                {/* Model List */}
                <div className="mt-5">
                    <h2 className="text-xl font-semibold mb-4 text-black">Hugging Face Models</h2>
                    <ul className="bg-white p-4 rounded-md shadow-md">
                        {data?.slice(0, visibleCount).map((model: any, index: number) => (
                            <li key={index} className="border-b last:border-none py-2 text-black">
                                <details
                                    className="cursor-pointer"
                                    onToggle={(e) => {
                                        if ((e.target as HTMLDetailsElement).open) {
                                            setExpandedModel(model.id);
                                            mutate(); // Fetch model details
                                        } else {
                                            setExpandedModel(null);
                                        }
                                    }}
                                >
                                    <summary className="font-medium">{model.id}</summary>
                                    <div className="ml-4 mt-2 text-gray-700">
                                        <p><strong>Downloads:</strong> {model.downloads || "N/A"}</p>
                                        <p><strong>Library:</strong> {model.library_name || "N/A"}</p>
                                        <button
                                            key={model.id}
                                            onClick={() => handleDownloadModel(model.id || "")}                                            // href={`https://huggingface.co/${model.id}/resolve/main/${file.rfilename}`}
                                            // target="_blank"
                                            // rel="noopener noreferrer"
                                            className="mt-2 block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Download {model.id}
                                        </button>
                                        {/* Display Available Files & Download Buttons */}
                                        {/* {expandedModel === model.id ? (
                                            modelDetails ? (
                                                modelDetails.siblings.map((file: any) => (
                                                    <a
                                                        key={file.rfilename}
                                                        href={`https://huggingface.co/${model.id}/resolve/main/${file.rfilename}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                    >
                                                        Download {file.rfilename}
                                                    </a>
                                                ))
                                            ) : (
                                                <p className="text-gray-500">Loading files...</p>
                                            )
                                        ) : null} */}
                                    </div>
                                </details>
                            </li>
                        ))}
                    </ul>

                    {/* Load More Button */}
                    {visibleCount < data?.length && (
                        <button
                            onClick={handleLoadMore}
                            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            Load More
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MarketPlace;
