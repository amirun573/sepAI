"use client";
import { SettingProps } from "@/_Common/interface/setting.interface";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import Toggle from "@/components/Toggle";
import API from "@/_Common/function/api";
import { APICode } from "@/_Common/enum/api-code.enum";
function Setting() {

    const initialSettings: SettingProps = {
        theme: "dark",
        modelDownloadPath: "/home/user/Downloads",
        notification: false,
        log: false,
    }
    const [toggleNotificationState, setToggleNotificationState] = useState(false);
    const [toggleLogState, setToggleLogState] = useState(false);

    const [settings, setSettings] = useState<SettingProps>(initialSettings);

    const [folderPath, setFolderPath] = useState<string | null>(null);
    const isElectron = typeof window !== "undefined" && (window as any).electron?.selectFolder;


    const settingSetup = async () => {
        try {
            const requestSetting = await API({
                url: `settings/`,
                API_Code: APICode.setting
            });

            if (!requestSetting.success) {
                throw Error("Setting Cannot Be Loaded");
            }

            setSettings(requestSetting.data as SettingProps);
        } catch (error: any) {
            alert(error?.message);
        }
    }
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
        settingSetup();

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

    const saveSettings = async (e: any) => {
        try {

            console.log(e);

            const { id, value } = e.target;

            if (!id) {
                throw Error("No ID Found");
            }

            //e.target.files?.[0]?.name
            setSettings({ ...settings, [id]: value });
        } catch (error: any) {
            console.error(error);
            alert(error?.message);
        }
    }

    const updateNotificationSetting = async () => {
        try {

        } catch (error: any) {
            alert(error?.message);
        }
    }

    const updateLogSetting = async () => {
        try {

        } catch (error: any) {
            alert(error?.message);
        }
    }

    useEffect(() => {
        try {
            setSettings({ ...settings, ["notification"]: toggleNotificationState });

        } catch (error) {

        }
    }, [toggleNotificationState]);

    useEffect(() => {
        try {
            setSettings({ ...settings, ["log"]: toggleLogState });

        } catch (error) {

        }
    }, [toggleLogState]);



    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
            <ul className="bg-white p-4 rounded-md shadow-md">
                <li className="border-b last:border-none py-2 text-black mb-4">
                    Path Download Model
                    <input
                        id="modelDownloadPath"
                        type="text"
                        data-webkitdirectory=""
                        data-directory=""
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        onChange={(e) => handleSettings(e)}
                        value={settings.modelDownloadPath}

                    />
                    <div className="justify-end mt-4">
                        <button className="bg-black text-white py-2 px-6 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            Save
                        </button>
                    </div>
                </li>


                <li className="border-b last:border-none py-2 text-black mb-4" >
                    <div className="flex items-center justify-between w-full">
                        <span className="text-lg font-medium">Notification</span>
                        <Toggle isOn={settings.notification} onToggle={setToggleNotificationState} />
                    </div>

                </li>

                <li className="border-b last:border-none py-2 text-black mb-4" >
                    <div className="flex items-center justify-between w-full">
                        <span className="text-lg font-medium">Log</span>
                        <Toggle isOn={settings.log} onToggle={setToggleLogState} />
                    </div>

                </li>

            </ul>


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