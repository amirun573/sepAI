import { APICode } from "@/_Common/enum/api-code.enum";
import API from "@/_Common/function/api";
import { DeviceCondition, DeviceSpecification, GPUDetails } from "@/_Common/interface/device.interface";
import { useEffect, useState } from "react";

const DeviceStatus = ({ status }: any) => {
    const [isOpen, setIsOpen] = useState(status);
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

    return (
        <div className="border rounded-lg shadow-md">
            <button
                className="w-full text-left px-6 py-4 bg-gray-200 text-gray-800 font-bold flex justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>Device Status</span>
                <span>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
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

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold text-gray-800">Temperature</h3>
                        <p className="mt-2 text-gray-600">
                            {deviceCondition && deviceSpecification ? (
                                <p>Usage: {isNaN(deviceCondition.temperature) ? 'N/A' : `${deviceCondition.temperature}°C`}</p>
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
                                    <p>Name: {gpuDetails.name || 'N/A'}</p>
                                    <p>Total Memory: {gpuDetails.memory_total_MB || 'N/A'}</p>
                                    <p>Memory Usage: {gpuDetails.memory_free_MB || 'N/A'}</p>
                                    <p>Load Percentage: {gpuDetails.load_percent ? `${gpuDetails.load_percent}%` : 'N/A'}</p>
                                    <p>Temperature: {gpuDetails.temperature ? `${gpuDetails.temperature}°C` : 'N/A'}</p>
                                </div>
                            ) : (
                                <p>No GPU Detected.</p>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceStatus;
