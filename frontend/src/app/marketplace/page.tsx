'use client';

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Header from "@/components/Header";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MarketPlace: React.FC = () => {
    const { data, error, isLoading } = useSWR("https://huggingface.co/api/models", fetcher);
    const [expandedModel, setExpandedModel] = useState<string | null>(null);
    const { data: modelDetails, mutate } = useSWR(
        expandedModel ? `https://huggingface.co/api/models/${expandedModel}` : null,
        fetcher
    );

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
                    <h2 className="text-xl font-semibold mb-4">Hugging Face Models</h2>
                    <ul className="bg-white p-4 rounded-md shadow-md">
                        {data?.slice(0, 10).map((model: any, index: number) => (
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

                                        {/* Display Available Files & Download Buttons */}
                                        {expandedModel === model.id ? (
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
                                        ) : null}
                                    </div>
                                </details>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default MarketPlace;
