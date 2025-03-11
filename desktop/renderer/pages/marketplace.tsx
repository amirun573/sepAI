'use client';

import React, {use, useEffect, useState} from 'react';
import Navbar from '../Components/Navbar';
import Header from '../Components/Header';
import useSWR from 'swr';
import API from '../_Common/function/api';
import {APICode} from '../_Common/enum/api-code.enum';
import {io} from 'socket.io-client';
import {
  APIGetSaveModelLists,
  APIHuggingFaceModeListsResponse,
  APIHuggingFaceModeSizeResponse,
} from '../_Common/interface/api.interface';
import {Unit} from '../_Common/enum/unit.enum';
const fetcher = (url: string) => fetch(url).then((res) => res.json());
const socket = io('http://127.0.0.1:8000', {
  transports: ['websocket'], // Force WebSocket transport
  withCredentials: true,
  autoConnect: true,
});
const MarketPlace: React.FC = () => {
  const {data, error, isLoading} = useSWR(
    'https://huggingface.co/api/models',
    fetcher
  );
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const [modelLists, setModelLists] = useState<
    APIHuggingFaceModeListsResponse[]
  >([]);

  const {data: modelDetails, mutate} = useSWR(
    expandedModel ? `https://huggingface.co/api/models/${expandedModel}` : null,
    fetcher
  );

  const [visibleCount, setVisibleCount] = useState(10); // Show 10 models initially
  const [progress, setProgress] = useState<{[key: string]: number}>({});
  const [downloadedModel, setDownloadedModel] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState('Disconnected');
  const [modelSize, setModelSize] = useState<APIHuggingFaceModeSizeResponse>({
    size: 0,
    unit: Unit.GB,
  });
  const [saveListsModel, setSaveListsModel] = useState<APIGetSaveModelLists[]>(
    []
  );
  const [filteredModels, setFilteredModels] = useState<
    APIHuggingFaceModeListsResponse[]
  >([]);
  const [loadingDownload, setLoadingDownload] = useState<boolean>(false);

  const getModelDownload = async () => {
    try {
      const requestModels = await API({
        url: 'models/',
        API_Code: APICode.model_lists,
      });

      if (!requestModels.success) {
        throw Error('Failed To Load Model');
      }

      setSaveListsModel(requestModels.data?.models as APIGetSaveModelLists[]);
    } catch (error: any) {
      alert(error?.message);
    }
  };
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10); // Load 10 more models
  };

  useEffect(() => {
    // Socket.IO event listeners
    socket.on('connect', () => {
      console.log('✅ Connected to Socket.IO server');
      setSocketStatus('Connected');
    });

    socket.on('progress', (data: any) => {
      console.log('🚀 Received Progress Update:', data);
      // setProgress((prev) => ({ ...prev, [data.model_id]: data.progress }));
    });

    socket.on('status', (data: any) => {
      console.log('🚀 Received Progress Update:', data);
      // setProgress((prev) => ({ ...prev, [data.model_id]: data.status }));
    });

    socket.on('completed', (data: any) => {
      console.log('🎉 Model Downloaded:', data);
      alert(`🎉 Model ${data.model_id} downloaded successfully!`);
      location.reload();
    });

    socket.on('download_completed', (data: any) => {
      console.log('🎉 Model Downloaded:', data);
      alert(`🎉 Model ${data.model_id} downloaded successfully!`);
      setLoadingDownload(false);
      location.reload();
    });

    socket.on('path_exist', (data: any) => {
      console.log('🎉 Path Exist:', data);
      alert(` ${data.message} `);
      setLoadingDownload(false);
    });

    socket.on('download_error', (data: any) => {
      console.error('⚠️ Error:', data.error);
      alert(`⚠️ Error downloading model ${data.model_id}: ${data.error}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.IO server');
      setSocketStatus('Disconnected');
    });

    socket.on('connect_error', (error: any) => {
      console.error('⚠️ Connection error:', error);
      setSocketStatus('Connection error');
    });

    // Cleanup event listeners
    // return () => {
    //     socket.off("connect");
    //     socket.off("progress");
    //     socket.off("download_complete");
    //     socket.off("download_error");
    //     socket.off("disconnect");
    //     socket.off("connect_error");
    // };
  }, []);

  useEffect(() => {
    try {
      getModelDownload();
    } catch (error) {}
  }, []);

  // ✅ Initialize `modelLists` when `data` is available and it's empty
  useEffect(() => {
    if (data && modelLists.length === 0) {
      setModelLists(data);
    }
  }, [data, modelLists.length]); // Prevent infinite loop by checking length

  // ✅ Append `modelDetails` only if it's not already in the list
  useEffect(() => {
    if (modelDetails) {
      setModelLists((prevLists) => {
        const exists = prevLists.some((model) => model.id === modelDetails.id);
        return exists ? prevLists : [...prevLists, modelDetails];
      });
    }
  }, [modelDetails]); // Only runs when `modelDetails` changes

  useEffect(() => {
    if (!modelLists.length || !saveListsModel.length) {
      setFilteredModels([]);
      return;
    }

    const filtered = modelLists.filter((model) =>
      saveListsModel.some((saved) => saved.model_name === model.modelId)
    );

    setFilteredModels(filtered);
  }, [modelLists, saveListsModel]);

  const handleDownloadModel = (model_id: string) => {
    try {
      setLoadingDownload(true);
      socket.emit('start_download', {model_id});
    } catch (error) {
      console.error('Download Problem');
    }
  };

  const handleModelDetails = async (model_id: string) => {
    try {
      const modelIndex = modelLists.findIndex((model) => model.id === model_id);

      if (modelLists[modelIndex]?.size === undefined) {
        const response = await API({
          url: `models/${APICode.model_size}?model_id=${model_id}`,
          API_Code: APICode.model_size,
          data: {model_id},
        });

        if (!response || !response.success) {
          throw new Error('Failed to get model size.');
        }

        // Update the size of the specific model
        // Once model details are fetched, update the model size
        // If model is found, update its size

        if (modelIndex === -1) {
          throw Error('Model not found');
        }

        const updatedModelLists = modelLists.map((model, index) =>
          index === modelIndex ? {...model, size: response.data} : model
        );

        // Update state
        setModelLists(updatedModelLists);

        // If using SWR, update the cache
        // mutate("https://huggingface.co/api/models", updatedModelLists, false);
      }
    } catch (error: any) {
      alert(error?.message || 'Failed to get model size.');
    }
  };

  const checkModelDownloaded = async (model_id: string) => {
    try {
      if (modelLists.length !== 0) {
        const modelListIndex = modelLists.findIndex(
          (model) => model.modelId === model_id
        );

        if (
          modelListIndex !== -1 &&
          modelLists[modelListIndex].size === undefined
        ) {
          const saveListIndex = saveListsModel.findIndex(
            (model) => model.model_name === model_id
          );

          if (saveListIndex !== -1 && modelListIndex !== -1) {
            console.log(`Model ID ${model_id} exists in both lists.`);

            modelLists[modelListIndex].size = {
              size: saveListsModel[saveListIndex].size || 0,
              unit: (saveListsModel[saveListIndex].unit as Unit) || Unit.GB,
            };

            modelLists[modelListIndex].downloaded = true;

            setModelLists(modelLists);
          } else if (modelListIndex !== -1) {
            await handleModelDetails(model_id);
          } else {
            throw Error(`Model ID ${model_id} not found in either list.`);
          }
        }
      }
    } catch (error: any) {
      alert(error?.message);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!modelId) {
      throw Error('No Model Passed To Delete');
    }
    const confirmDelete = window.confirm(
      `Are you sure you want to delete model "${modelId}"?`
    );

    if (!confirmDelete) return; // If user cancels, exit function

    try {
      socket.emit('delete_model', {model_id: modelId});
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

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
          <h2 className="text-xl font-semibold mb-4 text-black">
            Hugging Face Models
          </h2>
          {filteredModels.length > 0 && (
            <>
              <h3 className="text-l font-semibold mb-4 text-black">
                Installed Model
              </h3>
              <ul className="bg-white p-4 rounded-md shadow-md">
                {filteredModels
                  .slice(0, visibleCount)
                  .map(
                    (model: APIHuggingFaceModeListsResponse, index: number) => (
                      <li
                        key={index}
                        className="border-b last:border-none py-2 text-black"
                      >
                        <details
                          className="cursor-pointer"
                          onToggle={(e) => {
                            const isOpen = (e.target as HTMLDetailsElement)
                              .open;
                            setExpandedModel(isOpen ? model.id : null);

                            if (isOpen) {
                              checkModelDownloaded(model.id);
                              mutate(); // Fetch model details
                            }
                          }}
                        >
                          <summary className="font-medium">{model.id}</summary>
                          <div className="ml-4 mt-2 text-gray-700">
                            <p>
                              <strong>Downloads:</strong>{' '}
                              {model.downloads || 'N/A'}
                            </p>
                            <p>
                              <strong>Library:</strong>{' '}
                              {model.library_name || 'N/A'}
                            </p>
                            <p>
                              <strong>Likes:</strong> {model.likes || 'N/A'}
                            </p>
                            <p>
                              <strong>Pipeline Tag:</strong>{' '}
                              {model?.pipeline_tag || 'N/A'}
                            </p>
                            <p>
                              <strong>Trending Score:</strong>{' '}
                              {model.trendingScore || 'N/A'}
                            </p>
                            <p>
                              <strong>Model Size:</strong>{' '}
                              {model.size
                                ? `${model.size.size} ${model.size.unit}`
                                : 'Loading...'}
                            </p>

                            <p>
                              <strong>Tags:</strong>{' '}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4 mt-2">
                              {model.tags?.length ? (
                                model.tags.map((tag: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded-md"
                                  >
                                    {tag}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500">
                                  N/A
                                </span>
                              )}
                            </div>

                            {model.downloaded ? (
                              <div className="mt-4 flex space-x-2 justify-end">
                                {/* <button
                                  key={`update-${model.id}`}
                                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                  onClick={() =>
                                    handleDownloadModel(model.id || '')
                                  }
                                  disabled={loadingDownload}
                                >
                                  {loadingDownload ? (
                                    <svg
                                      className="animate-spin h-5 w-5 mr-2 text-white"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="opacity-25"
                                      />
                                      <path
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z"
                                        className="opacity-75"
                                      />
                                    </svg>
                                  ) : (
                                    `Update`
                                  )}
                                </button> */}

                                <button
                                  key={`delete-${model.id}`}
                                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                  onClick={() =>
                                    handleDeleteModel(model.id || '')
                                  }
                                  disabled={loadingDownload}
                                >
                                  {loadingDownload ? (
                                    <svg
                                      className="animate-spin h-5 w-5 mr-2 text-white"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="opacity-25"
                                      />
                                      <path
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z"
                                        className="opacity-75"
                                      />
                                    </svg>
                                  ) : (
                                    `Delete`
                                  )}
                                </button>
                              </div>
                            ) : (
                              // <button
                              //     key={model.id}
                              //     onClick={() => handleDownloadModel(model.id || "")}
                              //     className="mt-2 block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              // >
                              //     Download {model.id}
                              // </button>
                              <button
                                className="mt-2 block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={() =>
                                  handleDownloadModel(model.id || '')
                                }
                                disabled={loadingDownload}
                              >
                                {loadingDownload ? (
                                  <svg
                                    className="animate-spin h-5 w-5 mr-2 text-white"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      className="opacity-25"
                                    />
                                    <path
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z"
                                      className="opacity-75"
                                    />
                                  </svg>
                                ) : (
                                  ` Download ${model.id}`
                                )}
                              </button>
                            )}

                            {progress && Object.keys(progress).length > 0 && (
                              <div>
                                {Object.entries(progress).map(
                                  ([modelId, prog]) => (
                                    <p key={modelId}>
                                      Model {modelId} Progress: {prog}%
                                    </p>
                                  )
                                )}
                              </div>
                            )}
                            {downloadedModel && (
                              <p>Model saved at: {downloadedModel}</p>
                            )}
                          </div>
                        </details>
                      </li>
                    )
                  )}
              </ul>
            </>
          )}

          <h3 className="text-l font-semibold mb-4 text-black mt-4">
            Download Model
          </h3>
          <ul className="bg-white p-4 rounded-md shadow-md">
            {modelLists
              ?.slice(0, visibleCount)
              .map((model: APIHuggingFaceModeListsResponse, index: number) => (
                <li
                  key={index}
                  className="border-b last:border-none py-2 text-black"
                >
                  <details
                    className="cursor-pointer"
                    onToggle={(e) => {
                      const isOpen = (e.target as HTMLDetailsElement).open;
                      setExpandedModel(isOpen ? model.id : null);

                      if (isOpen) {
                        checkModelDownloaded(model.id);
                        mutate(); // Fetch model details
                      }
                    }}
                  >
                    <summary className="font-medium">{model.id}</summary>
                    <div className="ml-4 mt-2 text-gray-700">
                      <p>
                        <strong>Downloads:</strong> {model.downloads || 'N/A'}
                      </p>
                      <p>
                        <strong>Library:</strong> {model.library_name || 'N/A'}
                      </p>
                      <p>
                        <strong>Likes:</strong> {model.likes || 'N/A'}
                      </p>
                      <p>
                        <strong>Pipeline Tag:</strong>{' '}
                        {model?.pipeline_tag || 'N/A'}
                      </p>
                      <p>
                        <strong>Trending Score:</strong>{' '}
                        {model.trendingScore || 'N/A'}
                      </p>
                      <p>
                        <strong>Model Size:</strong>{' '}
                        {model.size
                          ? `${model.size.size} ${model.size.unit}`
                          : 'Loading...'}
                      </p>

                      <p>
                        <strong>Tags:</strong>{' '}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4 mt-2">
                        {model.tags?.length ? (
                          model.tags.map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-sm bg-gray-200 text-gray-700 rounded-md"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>

                      {model.downloaded ? (
                        // Grouped buttons when the model is downloaded
                        <div className="mt-4 flex space-x-2 justify-end">
                          {/* <button
                                  key={`update-${model.id}`}
                                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                                  onClick={() =>
                                    handleDownloadModel(model.id || '')
                                  }
                                  disabled={loadingDownload}
                                >
                                  {loadingDownload ? (
                                    <svg
                                      className="animate-spin h-5 w-5 mr-2 text-white"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        className="opacity-25"
                                      />
                                      <path
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z"
                                        className="opacity-75"
                                      />
                                    </svg>
                                  ) : (
                                    `Update`
                                  )}
                                </button> */}

                          <button
                            key={`delete-${model.id}`}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            onClick={() => handleDeleteModel(model.id || '')}
                            disabled={loadingDownload}
                          >
                            {loadingDownload ? (
                              <svg
                                className="animate-spin h-5 w-5 mr-2 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  className="opacity-25"
                                />
                                <path
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z"
                                  className="opacity-75"
                                />
                              </svg>
                            ) : (
                              `Delete`
                            )}
                          </button>
                        </div>
                      ) : (
                        // Download button when model is not downloaded
                        <button
                          className="mt-2 block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => handleDownloadModel(model.id || '')}
                          disabled={loadingDownload}
                        >
                          {loadingDownload ? (
                            <svg
                              className="animate-spin h-5 w-5 mr-2 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="opacity-25"
                              />
                              <path
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 00-8 8h4z"
                                className="opacity-75"
                              />
                            </svg>
                          ) : (
                            ` Download ${model.id}`
                          )}
                        </button>
                      )}

                      {/* Display progress only when it's not empty */}
                      {progress && Object.keys(progress).length > 0 && (
                        <div>
                          {Object.entries(progress).map(([modelId, prog]) => (
                            <p key={modelId}>
                              Model {modelId} Progress: {prog}%
                            </p>
                          ))}
                        </div>
                      )}
                      {downloadedModel && (
                        <p>Model saved at: {downloadedModel}</p>
                      )}
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
