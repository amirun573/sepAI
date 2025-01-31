'use client';

import { APICode } from '@/_Common/enum/api-code.enum';
import API from '@/_Common/function/api';
import React, { useEffect, useState } from 'react';
import { DeviceCondition, DeviceSpecification, GPUDetails } from '@/_Common/interface/device.interface';
import Navbar from '@/components/Navbar';
import Header from '@/components/Header';
import Prompt from '@/components/Prompt';
const Dashboard: React.FC = () => {



    const [deviceCondition, setDeviceCondition] = useState<DeviceCondition | null>(null);
    const [deviceSpecification, setDeviceSpecification] = useState<DeviceSpecification | null>(null);
    const [gpuDetails, setGPUDetails] = useState<GPUDetails | null>(null);
    const [isLoaded, setIsLoaded] = useState(false); // Add loading flag



    const fetchDeviceData = async () => {
        try {

            const requestSpec = await API({
                url: 'devices/spec',
                API_Code: APICode.spec_device,
            });

            if (requestSpec.status !== 200) {
                throw Error(requestSpec?.message || 'No Device Response');
            }

            const { device_condition,
                device_specifications, gpu_details } = requestSpec.data;

            if (!device_condition || !device_specifications) {
                throw Error('No Device Condition / Specification Return');
            }

            setDeviceCondition((prev) => ({
                ...prev,
                ...device_condition, // Merge with new values
            }) as DeviceCondition);

            setDeviceSpecification((prev) => ({
                ...prev,
                ...device_specifications, // Merge with new values
            }) as DeviceSpecification);

            setGPUDetails((prev) => ({
                ...prev,
                ...gpu_details, // Merge with new values
            }) as GPUDetails);

            setIsLoaded(true); // Set loaded state after data is fetched

        } catch (error: any) {
            console.error(error);
            alert(error.message)
        }
    }

    useEffect(() => {
        // Fetch data on component mount
        fetchDeviceData();

        // Set up the interval to fetch data every 10 seconds
        const interval = setInterval(fetchDeviceData, 5000);

        // Clear the interval on component unmount
        return () => clearInterval(interval);
    }, []); // Empty dependency array to run once when component mounts

    // Prevent rendering until data is loaded
    if (!isLoaded) {
        return null; // Or you can show a loading spinner if you prefer
    }
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}

            <Navbar />

            {/* Main Content */}
            <main className="flex-1 p-8">
                {/* Header */}
                <Header />

                {/* Cards Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">Device</h3>
                        <p className="mt-2 text-gray-600">
                            {deviceCondition && deviceSpecification ? (
                                <div>
                                    <p>Powered: {deviceSpecification.name}</p>
                                    <p>Usage: {deviceCondition.status.toUpperCase()}</p>
                                    <p>Operation System (OS): {deviceSpecification.os}</p>

                                </div>
                            ) : (
                                <p>Device condition is unavailable.</p>
                            )}
                        </p>
                    </div>
                    {/* Card 1 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">CPU</h3>
                        <p className="mt-2 text-gray-600">
                            {deviceCondition && deviceSpecification ? (
                                <div>
                                    <p>Powered: {deviceSpecification.cpu}</p>
                                    <p>Cores: {deviceSpecification.cpu_physcial_cores}</p>
                                    <p>Threads: {deviceSpecification.cpu_logical_threads}</p>

                                    <p>Usage: {deviceCondition.cpu_usage}</p>
                                </div>
                            ) : (
                                <p>Device condition is unavailable.</p>
                            )}
                        </p>
                    </div>
                    {/* Card 2 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">RAM</h3>
                        <p className="mt-2 text-gray-600">
                            {deviceCondition && deviceSpecification ? (
                                <div>
                                    <p>Powered: {deviceSpecification.ram}</p>
                                    <p>Usage: {deviceCondition.memory_usage}</p>
                                </div>
                            ) : (
                                <p>Device condition is unavailable.</p>
                            )}
                        </p>
                    </div>
                    {/* Card 3 */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">Temperature</h3>
                        <p className="mt-2 text-gray-600">
                            {deviceCondition && deviceSpecification ? (

                                <h3>Usage: {isNaN(deviceCondition.temperature) ? 'N/A' : `${deviceCondition.temperature}°C`}</h3>

                            ) : (
                                <p>Device condition is unavailable.</p>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">GPU</h3>
                        <p className="mt-2 text-gray-600">
                            {gpuDetails ? (
                                <div>
                                    <h3>Name: {!(gpuDetails.name) ? 'N/A' : `${gpuDetails.name}`}</h3>
                                    <h4>Total Memory: {!(gpuDetails.memory_total_MB) ? 'N/A' : `${gpuDetails.memory_total_MB}`}</h4>
                                    <h4>Memory Usage: {!(gpuDetails.memory_free_MB) ? 'N/A' : `${gpuDetails.memory_free_MB}`}</h4>
                                    <h4>Load Percentage: {!(gpuDetails.load_percent) ? 'N/A' : `${gpuDetails.load_percent}%`}</h4>
                                    <h4>Temperature: {!(gpuDetails.temperature) ? 'N/A' : `${gpuDetails.temperature}°C`}</h4>

                                </div>


                            ) : (
                                <p>No GPU Detected.</p>
                            )}
                        </p>
                    </div>




                </div>

                {/* Charts Section */}
                <Prompt />

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