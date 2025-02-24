"use client";

import { APICode } from '@/_Common/enum/api-code.enum';
import API from '@/_Common/function/api';
import { APIModelListsResponse } from '@/_Common/interface/api.interface';
import React, { useEffect, useState } from 'react';

interface ModelListProps {
    onModelChange: (modelId: number) => void;
}

const ModelList: React.FC<ModelListProps> = ({ onModelChange }) => {
    const [selectedModelIndex, setSelectedModelIndex] = useState<number>(-1);
    const [modelSavedLists, setModelSavedLists] = useState<APIModelListsResponse[]>([]);

    const loadModel = async () => {
        try {
            const response = await API({ url: 'models', API_Code: APICode.model_lists });

            if (!response.success) {
                throw new Error(response?.message || "No Model Lists Found");
            }

            setModelSavedLists(response.data?.models as APIModelListsResponse[]);
        } catch (error: any) {
            alert(error?.message);
        }
    };

    useEffect(() => {
        loadModel();
    }, []);

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = Number(e.target.value);
        setSelectedModelIndex(index);
        onModelChange(modelSavedLists[index]?.model_id); // Pass model_id to parent
    };

    return (
        <>
            {modelSavedLists.length > 0 ? (
                <select
                    className="ml-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    value={selectedModelIndex}
                    onChange={handleModelChange}
                >
                    <option key={'-'} value={-1}>
                        {'Select Model'}
                    </option>
                    {modelSavedLists.map((model, index) => (
                        <option key={model.model_id} value={index}>
                            {model.model_name}
                        </option>
                    ))}
                </select>
            ) : (
                <p className="text-red-500 font-medium mt-2">
                    No Model Detected. Please download the model from the marketplace.
                </p>
            )}
        </>
    );

};

export default ModelList;
