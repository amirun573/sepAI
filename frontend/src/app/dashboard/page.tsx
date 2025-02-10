'use client';


import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Header from '@/components/Header';
import Prompt from '@/components/Prompt';
import DeviceStatus from '@/components/DeviceStatus';
const Dashboard: React.FC = () => {

    const [deviceStatusOpen, setDeviceStatusOpen] = useState<boolean>(true);


    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}

            <Navbar />

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <Header />

                {/* Cards Section */}
                <DeviceStatus status={deviceStatusOpen} />

                {/* Charts Section */}
                <div className='mt-10'>
                    <Prompt />

                </div>

                {/* Recent Activity Section */}
                {/* <div className="bg-white p-6 rounded-lg shadow-md">
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
                </div> */}
            </main>
        </div>
    );
};

export default Dashboard;