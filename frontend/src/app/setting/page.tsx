"use client";
import { SettingProps } from "@/_Common/interface/setting.interface";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";
import { useState, useEffect } from "react";

function Setting() {

    const initialSettings: SettingProps = {
        theme: "dark",
        modelDownloadPath: "/home/user/Downloads",
    }

    const [settings, setSettings] = useState<SettingProps>(initialSettings);

    const [folderPath, setFolderPath] = useState<string | null>(null);
    const isElectron = typeof window !== "undefined" && (window as any).electron?.selectFolder;


    const selectFolder = async () => {
        if (isElectron) {
            // Electron Folder Selection
            const selectedPath = await (window as any).electron.selectFolder();
            if (selectedPath) setFolderPath(selectedPath);
        } else {
            // Web: Trigger file input
            document.getElementById("folderInput")?.click();
        }
    };

    const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setFolderPath(files[0].webkitRelativePath.split("/")[0]); // Get the top-level folder name
        }
    };
    // Load settings from localStorage on component mount
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");

    }, []);



    const handleSettings = (e: any) => {
        try {

            console.log(e);

            const { id, value } = e.target;

            console.log(id, value);
            //e.target.files?.[0]?.name
            setSettings({ ...settings, [id]: value });
        } catch (error) {
            console.error(error);
        }
    }



    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Path Download Model
                        </label>
                        <input
                         id="modelDownloadPath"
                         type="file"
                         data-webkitdirectory=""
                         data-directory=""
                         className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                         onChange={(e) => handleSettings(e)}
                        />

                    </div>


                </div> */}

                <div className="bg-white p-6 rounded-lg shadow-md">
                    {/* Theme Preference */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                        </label>

                    </div>


                </div>
            </div>

        </div>
    );
}

export default function SettingPage() {

    return (<Suspense fallback={'Loading'}><div className="min-h-screen flex bg-gray-100">
        {/* Sidebar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1 p-8">
            <Setting />

        </main>
    </div>
    </Suspense>)
} 