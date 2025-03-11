'use client'
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { Button, Spinner } from 'flowbite-react';
import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { StatusAPICode } from '../../_Common/enum/status-api-code.enum';
import { FilePathFolder } from '../../_Common/enum/file-path-folder.enum';
import Image from 'next/image';
import { HandleUnAuthorized } from '../../_Common/function/LocalStorage';
import { DeleteFilePathFromIndexedDB, SaveFilePathToIndexedDB, SaveFileToIndexedDB } from '../../_Common/function/IndexDB';

interface FileUploaderProps {
    acceptedFileTypes?: string[] | null;
    url?: string;
    maxFileSize?: number;
    allowMultiple?: boolean;
    label?: string;
    labelAlt?: string;
    accessToken?: string;
    statusAPICode: StatusAPICode,
    uuid?: string;
    onUploadSuccess: (files: PutBlobResult[]) => void;
    filePathFolder: string;
    clientPayload?: string;
    subPath?: string;
    waterMark?: boolean,
}

export default function FileUploader(props: FileUploaderProps) {
    const {
        acceptedFileTypes,
        url = `/api/callback/upload-file`, maxFileSize = 5,
        allowMultiple = false,
        label = "",
        labelAlt = "",
        accessToken = "",
        statusAPICode = StatusAPICode.CALLBACK_UPLOAD_FILES,
        uuid = "",
        filePathFolder = FilePathFolder.partner,
        clientPayload = JSON.stringify({}),
        subPath = "",
        waterMark = false,
    } = props;

    const MAX_FILE_BYTES = maxFileSize * 1024 * 1024; // MB to bytes

    // Change the state structure to handle multiple file progress and status
    const [fileProgress, setFileProgress] = useState<{ [key: string]: number }>({});
    const [fileStatus, setFileStatus] = useState<{ [key: string]: string }>({});
    const [previewUrl, setPreviewUrl] = useState<{ [key: string]: string | ArrayBuffer | null }>({});
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
    const [Files, setFiles] = useState<File[]>([]);
    const [blob, setBlob] = useState<PutBlobResult[] | null>([]);



    const isError = Object.values(fileStatus).some(status => status !== 'Uploaded');

    const needAPIUUID: StatusAPICode[] = [
        StatusAPICode.CALLBACK_UPLOAD_FILES,
    ];

    if (needAPIUUID.indexOf(statusAPICode) === -1) {
        throw Error("Need UUID to proceed");
    }

    // Create a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function waterMarkFile(object: { statusCodeAPI: StatusAPICode, file: File }): Promise<string> {
        try {

            const { file, statusCodeAPI } = object;
            var data = new FormData();
            data.append('code', `${statusCodeAPI}`);
            data.append('file', file);

            var config = {
                method: 'post',
                url: '/api/users',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                data: data
            };

            const requestImage = await axios(config);

            if (!requestImage.data?.imageUrl) {
                throw Error("Cannot Get Image");
            }

            return `data:image/jpeg;base64,${(requestImage.data?.imageUrl as string)}`;
        } catch (error) {
            console.error(error);
            await HandleUnAuthorized(error);
            return '';
        }
    }

    function base64ToBlob(base64: string, mime: string) {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
    }

    const resetUploader = () => {
        setFileProgress({});
        setFileStatus({});
        setUploadError(null);
        setUploadSuccess(false);
        setPreviewUrl({});
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    async function applyWatermark(file: File): Promise<File> {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = async () => {
                let imageUrl: string = '';
                try {
                    if (waterMark) {
                        imageUrl = await waterMarkFile({
                            statusCodeAPI: StatusAPICode.UPLOAD_ID_IMAGE_EDIT_CROSSING,
                            file: file
                        });
                    }
                } catch (error) {
                    console.error("Error===>", error);
                    reject(error);
                }

                const url = imageUrl ? imageUrl : reader.result as string; // Use imageUrl if available, otherwise use reader.result

                // Check if imageUrl is base64-encoded
                let blob;
                if (imageUrl && imageUrl.startsWith('data:image/')) {
                    blob = base64ToBlob(imageUrl, 'image/jpeg'); // Adjust MIME type if necessary
                } else {
                    blob = new Blob([url], { type: file.type });
                }

                // Update the file object to include the new Blob
                const updatedFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() });

                // Resolve with the updated file
                resolve(updatedFile);
            };

            reader.readAsDataURL(file);
        });
    }


    // const fileSelectedHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    //     setUploadError(null); // Reset the upload error when a new file is selected

    //     if (event.target.files) {
    //         const files = Array.from(event.target.files);
    //         let isValid = true; // Flag to check if all files are valid
    //         let fileErrors: { [key: string]: string } = {};

    //         console.log("files===>", files);

    //         for (const file of files) {
    //             if (file.size > MAX_FILE_BYTES) {
    //                 fileErrors[file.name] = `File size cannot exceed ${maxFileSize} MB`;
    //                 isValid = false;
    //             }
    //             if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
    //                 fileErrors[file.name] = "File type not accepted. Accepted types: " + acceptedFileTypes.join(', ');
    //                 isValid = false;
    //             }
    //         }

    //         if (!isValid) {
    //             setFileStatus(fileErrors);
    //         } else {
    //             console.log("Allow Multiple");
    //             console.log("FILES==>", Files);
    //             files.forEach(async file => {
    //                 setFileProgress(prev => ({ ...prev, [file.name]: 0 }));

    //                 const updatedFile = waterMark ? await applyWatermark(file) : file;

    //                 console.log("updatedFile===>", updatedFile);

    //                 // Update the preview URL state with the URL for the file
    //                 const fileUrl = URL.createObjectURL(updatedFile);

    //                 console.log("fileUrl===>", fileUrl);

    //                 setPreviewUrl(prev => ({ ...prev, [updatedFile.name]: fileUrl }));

    //                 // Add the file to the Files array
    //                 setFiles(prevFiles => [...prevFiles, updatedFile]);
    //             });

    //         }
    //     }
    // };


    const fileUploadHandler = async (file: File) => {
        try {
            // Construct the request body
            // const body = new FormData();
            // body.append("uploads", file);
            // body.append("code", props.statusAPICode !== null ? props.statusAPICode.toString() : '');

            setFileProgress(prev => ({ ...prev, [file.name]: 51 }));


            let fileName: string = encodeURI(file.name);

            if (needAPIUUID.indexOf(statusAPICode) !== -1) {
                fileName = `${filePathFolder}/${uuid}${subPath ? `/${subPath}` : ""}/${fileName}`;
            }

            // Upload the file using the upload function from @vercel/blob/client
            const newBlob = await upload(fileName, file, {
                access: 'public',
                handleUploadUrl: url, // Assuming `url` is defined and points to your serverless function
                clientPayload
            });

            if (!newBlob) {
                setFileStatus(prev => ({ ...prev, [file.name]: "An error occurred while uploading the file. Server response: Failed" }));

                throw Error("Failed Upload File");
            }

            blob?.push(newBlob);


            setFileProgress(prev => ({ ...prev, [file.name]: 100 }));
            setFileStatus(prev => ({ ...prev, [file.name]: 'Uploaded' }));
            setUploadSuccess(true);

            if (!blob) {
                throw Error("Failed To Merged");
            }

            setBlob(blob);

            await new Promise(resolve => setTimeout(resolve, 3000));
            props.onUploadSuccess(blob);


        } catch (error: any) {
            // Handle error response

            const errorMessage = `An error occurred while uploading the file: ${error.message}`;
            console.error(errorMessage);
            setFileStatus(prev => ({ ...prev, [file.name]: errorMessage }));
            await new Promise(resolve => setTimeout(resolve, 3000));
            props.onUploadSuccess([]);
        }



    };


    const fileUploadHandlerLocal = async (file: File): Promise<void> => {
        try {
            // Initialize progress at 51% to show it’s in the process of being "uploaded"
            setFileProgress(prev => ({ ...prev, [file.name]: 51 }));

            // Encode the filename and conditionally modify based on API needs
            let fileName = encodeURI(file.name);
            if (needAPIUUID.includes(statusAPICode)) {
                fileName = `${filePathFolder}/${uuid}${subPath ? `/${subPath}` : ""}/${fileName}`;
            }

            // Create a local URL to simulate the upload URL
            const fileUrl = URL.createObjectURL(file);

            // Simulate the result as if the file was uploaded
            const newBlob: PutBlobResult = {
                pathname: file.path,
                url: file.path,  // Using the local URL instead of an actual upload URL
                contentType: '',
                contentDisposition: '',
                downloadUrl: '',
            };

            // Update state with the simulated blob result
            const updatedBlob = [...(blob || []), newBlob];
            setBlob(updatedBlob);

            // Update file progress to 100% and mark as 'Uploaded'
            setFileProgress(prev => ({ ...prev, [file.name]: 100 }));
            setFileStatus(prev => ({ ...prev, [file.name]: 'Uploaded' }));
            setUploadSuccess(true);

            // Call onUploadSuccess with the updated blob array
            // await new Promise(resolve => setTimeout(resolve, 3000));
            props.onUploadSuccess(updatedBlob);

        } catch (error: any) {
            // Handle errors by setting the error message in file status
            const errorMessage = `An error occurred while processing the file: ${error.message}`;
            console.error(errorMessage);
            setFileStatus(prev => ({ ...prev, [file.name]: errorMessage }));

            // Delay before notifying failure
            // await new Promise(resolve => setTimeout(resolve, 3000));
            props.onUploadSuccess([]);
        }
    };

    const handleRemoveImage = async (fileName: string) => {
        // Update local state

        console.log("Remove ===> ", fileName)
        setFileProgress(prevState => {
            const newFileProgress = { ...prevState };
            delete newFileProgress[fileName];
            return newFileProgress;
        });

        setPreviewUrl(prevState => {
            const newPreviewUrl = { ...prevState };
            delete newPreviewUrl[fileName];
            return newPreviewUrl;
        });

        // Remove file path from IndexedDB
        try {
            await DeleteFilePathFromIndexedDB(fileName);
            console.log(`File path for ${fileName} deleted successfully`);
        } catch (error) {
            console.error("Error deleting file path from IndexedDB:", error);
        }

        setUploadSuccess(false);
    };


    const fileSelectedIndexDBHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        setUploadError(null); // Reset the upload error when a new file is selected

        if (event.target.files) {
            const files = Array.from(event.target.files);
            let isValid = true;
            let fileErrors: { [key: string]: string } = {};

            for (const file of files) {
                if (file.size > MAX_FILE_BYTES) {
                    fileErrors[file.name] = `File size cannot exceed ${maxFileSize} MB`;
                    isValid = false;
                }
                if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
                    fileErrors[file.name] = "File type not accepted. Accepted types: " + acceptedFileTypes.join(', ');
                    isValid = false;
                }
            }

            if (!isValid) {
                setFileStatus(fileErrors);
            } else {
                files.forEach(async (file) => {
                    setFileProgress((prev) => ({ ...prev, [file.name]: 0 }));
                    const updatedFile = waterMark ? await applyWatermark(file) : file;

                    // Save the file as a Blob in IndexedDB
                    await SaveFilePathToIndexedDB(updatedFile.path, updatedFile.name);
                    console.log(`File ${updatedFile.path} saved to IndexedDB`);

                    // Create a preview URL
                    const fileUrl = URL.createObjectURL(updatedFile);
                    setPreviewUrl((prev) => ({ ...prev, [updatedFile.name]: fileUrl }));
                    setFiles((prevFiles) => [...prevFiles, updatedFile]);
                });
            }
        }
    };

    async function ConfirmUploadFromIndexDB() {
        try {
            console.log("confirmUpload==>", Files);
            if (Files && Files.length > 0) {
                for (const file of Files) {
                    setFileProgress(prev => ({ ...prev, [file.name]: 0 }));

                    // Step 1: Upload the file to the server
                    await fileUploadHandler(file);

                    // Step 2: Save file as Blob in IndexedDB
                    await SaveFileToIndexedDB(file, file.name);
                    console.log(`File ${file.name} saved to IndexedDB`);

                    // Step 3: Read the file as a data URL and set it as the preview
                    const reader = new FileReader();
                    reader.onload = () => {
                        const url = reader.result;
                        setPreviewUrl(prev => ({ ...prev, [file.name]: url }));
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                alert("No Files to Upload");
            }
        } catch (error) {
            console.error("Error in confirmUpload:", error);
        }
    }

    const [filePaths, setFilePaths] = useState<{ [key: string]: string }>({});


    const fileSelectedHandler = async (event: ChangeEvent<HTMLInputElement>) => {
        setUploadError(null); // Reset upload error

        if (event.target.files) {
            const files = Array.from(event.target.files);
            let isValid = true;
            let fileErrors: { [key: string]: string } = {};

            for (const file of files) {
                if (file.size > MAX_FILE_BYTES) {
                    fileErrors[file.name] = `File size cannot exceed ${MAX_FILE_BYTES / 1000000} MB`;
                    isValid = false;
                }
                if (acceptedFileTypes && !acceptedFileTypes.includes(file.type)) {
                    fileErrors[file.name] = "File type not accepted. Accepted types: " + acceptedFileTypes.join(', ');
                    isValid = false;
                }
            }

            if (!isValid) {
                setFileStatus(fileErrors);
            } else {
                // Clear previous errors
                setFileStatus({});

                files.forEach(async (file) => {
                    setFileProgress((prev) => ({ ...prev, [file.name]: 0 }));

                    // Create a URL for the file path and store it in `filePaths`
                    const fileUrl = URL.createObjectURL(file);

                    setFilePaths((prev) => ({ ...prev, [file.name]: fileUrl }));

                    // Update files and preview URLs in state
                    setFiles((prevFiles) => [...prevFiles, file]);
                    console.log(`File ${file.name} path saved to state with URL: ${fileUrl}`);

                    await fileUploadHandlerLocal(file);
                });
            }
        }
    };

    // Clean up object URLs when the component unmounts
    useEffect(() => {
        return () => {
            Object.values(filePaths).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [filePaths]);


    return (
        <div className="flex flex-col gap-4 w-full h-200 md:h-200">
            <div className="overflow-x-auto flex gap-2 flex-col-reverse" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {Object.entries(fileProgress).map(([fileName, progress]) => (
                    <div key={fileName} className="text-xs flex flex-col gap-1">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <p>{fileName}</p>
                            {filePaths[fileName] && (
                                <>
                                    {/* Display image using filePaths */}
                                    <Image src={filePaths[fileName]} alt={fileName} width={300} height={300} unoptimized={false} priority={true} />
                                    <button
                                        onClick={() => handleRemoveImage(fileName)}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            width: '30px',
                                            height: '30px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        &times;
                                    </button>
                                </>
                            )}
                        </div>

                        {/* <div className="flex items-center gap-2">
                            <progress
                                className="progress progress-primary w-full"
                                value={progress}
                                max="100"
                            />
                            {progress < 50 ? (
                                // File is still uploading, show spinning icon
                                <Spinner className="text-xl text-blue-500 mr-4" />
                            ) : (
                                progress === 100 && (
                                    <>
                                        {fileStatus[fileName] === 'Uploaded' ? (
                                            <FaCheck className="text-xl text-green-500 mr-4" />
                                        ) : (
                                            <FaTimes className="text-xl text-red-500 mr-4" />
                                        )}
                                    </>
                                )
                            )}
                        </div>
                        <p className="text-red-500">
                            {fileStatus[fileName] !== 'Uploaded' ? fileStatus[fileName] : ''}
                        </p> */}
                    </div>
                ))}
            </div>


            {/* File Input */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text">{label}</span>
                    <span className="label-text-alt">{labelAlt}</span>
                </label>
                <input
                    type="file"
                    className="file-input file-input-bordered file-input-primary w-full"
                    onChange={fileSelectedHandler}
                    accept={acceptedFileTypes ? acceptedFileTypes.join(',') : undefined}
                    ref={fileInputRef}
                    multiple={allowMultiple} // Added the 'multiple' attribute conditionally
                />
                <label className="label">
                    <span className="label-text-alt text-red-500">{uploadError}</span>
                </label>
            </div>

            {/* Confirm Button */}
            {/* <button
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={ConfirmUploadFromIndexDB}
                disabled={Object.keys(fileStatus).some(key => fileStatus[key] !== 'Uploaded')}
            >
                Confirm Upload
            </button> */}
        </div >
    );



    async function confirmUpload() {
        try {
            console.log("confirmUpload==>", Files);
            if (Files && Files.length > 0) {
                for (const file of Files) {
                    setFileProgress(prev => ({ ...prev, [file.name]: 0 }));
                    await fileUploadHandler(file);

                    // Read the file as a data URL and set it as the preview
                    const reader = new FileReader();
                    reader.onload = () => {
                        const url = reader.result;
                        setPreviewUrl(prev => ({ ...prev, [file.name]: url }));
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                alert("No Files to Upload");
            }
        } catch (error) {
            console.error("Error in confirmUpload:", error);
        }
    }





}
