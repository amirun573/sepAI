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
    const [loading, setLoading] = useState<boolean>(false);



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

    const handleLoadModel = async (index: number) => {
        console.log("🚀 handleLoadModel Triggered with index:", index); // ✅ Debugging
        setLoading(true);
        try {
            const responseLoadModel = await API({
                url: `models/load_model?model_id=${index}`,
                API_Code: APICode.load_model,
            });
    
            console.log("📡 API Response:", responseLoadModel);
    
            if (!responseLoadModel.success) {
                throw new Error(responseLoadModel?.message || "Failed to Load Model");
            }
        } catch (error: any) {
            console.error("❌ Error in handleLoadModel:", error);
            alert(error?.message || "Error At Fetch History");
        } finally {
            console.log("✅ Finished handleLoadModel");
            setLoading(false);
        }
    };
    

    useEffect(() => {
        loadModel();
    }, []);

    const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedModelId = Number(e.target.value);
        console.log("🔄 Model Changed: ", selectedModelId); // ✅ Check if the event fires

        setSelectedModelIndex(selectedModelId);

        const selectedModel = modelSavedLists.find(model => model.model_id === selectedModelId);

        if (selectedModel) {
            console.log("✅ Selected Model Found:", selectedModel); // ✅ Debugging log
            await handleLoadModel(selectedModel.model_id); // ✅ Ensure this runs
            onModelChange(selectedModel.model_id);
        } else {
            console.log("❌ Model Not Found in List!");
        }
    };



    return (
        <>
            {modelSavedLists?.length > 0 ? (
                <select
                    className="ml-4 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                    value={selectedModelIndex}
                    onChange={handleModelChange}
                >
                    <option key={'-'} value={-1}>
                        {'Select Model'}
                    </option>
                    {modelSavedLists.map((model, index) => (
                        <option key={model.model_id} value={model.model_id}>
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
