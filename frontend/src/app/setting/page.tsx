"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [theme, setTheme] = useState("light");
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);

    // Load settings from localStorage on component mount
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem("settings") || "{}");
        setTheme(savedSettings.theme || "light");
        setEmailNotifications(savedSettings.emailNotifications || true);
        setPushNotifications(savedSettings.pushNotifications || false);
    }, []);

    // Save settings to localStorage
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const settings = {
            theme,
            emailNotifications,
            pushNotifications,
        };
        localStorage.setItem("settings", JSON.stringify(settings));
        console.log("Settings saved:", settings);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit}>
                    {/* Theme Preference */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                        </label>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System Default</option>
                        </select>
                    </div>

                    {/* Notification Preferences */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notifications
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                    className="mr-2"
                                />
                                <span>Email Notifications</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={pushNotifications}
                                    onChange={(e) => setPushNotifications(e.target.checked)}
                                    className="mr-2"
                                />
                                <span>Push Notifications</span>
                            </label>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}