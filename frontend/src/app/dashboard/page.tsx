'use client';

import { APICode } from '@/_Common/enum/api-code.enum';
import API from '@/_Common/function/api';
import React, { useEffect } from 'react';

const Dashboard: React.FC = () => {

    const specDevice = async () => {
        try {

            const requestSpec = await API({
                url: 'devices/spec',
                API_Code: APICode.spec_device,
            });
        } catch (error) {
            console.error(error);

        }
    }

    useEffect(() => {
        specDevice();
    }, []);
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                    <nav className="mt-8">
                        <ul className="space-y-4">
                            <li>
                                <a href="#" className="flex items-center text-gray-700 hover:text-gray-900">
                                    <span className="mr-2">🏠</span>
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center text-gray-700 hover:text-gray-900">
                                    <span className="mr-2">📊</span>
                                    Analytics
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center text-gray-700 hover:text-gray-900">
                                    <span className="mr-2">📁</span>
                                    Projects
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center text-gray-700 hover:text-gray-900">
                                    <span className="mr-2">⚙️</span>
                                    Settings
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Welcome Back, User!</h1>
                    <div className="relative">
                        <button className="flex items-center text-gray-800 hover:text-gray-600">
                            <img
                                src="https://via.placeholder.com/40"
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full"
                            />
                            <span className="ml-2">▼</span>
                        </button>
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden">
                            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Profile
                            </a>
                            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Settings
                            </a>
                            <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                                Logout
                            </a>
                        </div>
                    </div>
                </header>

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">Total Revenue</h3>
                        <p className="mt-2 text-gray-600">$12,345</p>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">Users</h3>
                        <p className="mt-2 text-gray-600">1,234</p>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">Projects</h3>
                        <p className="mt-2 text-gray-600">45</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Performance</h3>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500">Chart Placeholder</span>
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mr-4"></div>
                            <p className="text-gray-700">User John Doe logged in</p>
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full mr-4"></div>
                            <p className="text-gray-700">Project "Dashboard UI" updated</p>
                        </li>
                        <li className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full mr-4"></div>
                            <p className="text-gray-700">New user registered</p>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;