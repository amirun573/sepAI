"use client";
import React, { useEffect, useState } from 'react';

interface ConnectivityDetectorProps {
    onStatusChange: (isOnline: boolean) => void; // Function to pass online status back to parent
}
const SERVER_URL = 'http://localhost:3000/home'; // Replace with your actual server URL

interface InternetDetectorProps {
    onInternetStatusChange: (status: boolean) => void;
}

const ConnectivityDetector: React.FC<ConnectivityDetectorProps> = ({ onStatusChange }) => {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [serverReachable, setServerReachable] = useState<boolean>(true);

    const checkServerConnection = async () => {
        try {
            const response = await fetch(SERVER_URL);
            setServerReachable(response.ok); // Check if the response is successful
        } catch (error) {
            setServerReachable(false); // Set to false if there's an error
        }
    };

    useEffect(() => {
        // Function to check online status
        const handleOnline = () => {
            console.log("You are online");
            setIsOnline(true);
            onStatusChange(true); // Pass online status to parent
            checkServerConnection(); // Check server connection when online
        };

        const handleOffline = () => {
            console.log("You are offline");
            setIsOnline(false);
            onStatusChange(false); // Pass offline status to parent
        };

        // Initial state setup
        if (typeof navigator !== 'undefined') {
            setIsOnline(navigator.onLine);
            onStatusChange(navigator.onLine); // Pass initial status to parent
            console.log("Initial online status:", navigator.onLine);
            if (navigator.onLine) {
                checkServerConnection(); // Check server connection if online
            }
        }

        // Check server connectivity at regular intervals
        const intervalId = setInterval(() => {
            checkServerConnection(); // Always check the server connection
        }, 10000); // Check every 10 seconds (adjust as needed)

        // Add event listeners for online and offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup event listeners and interval on component unmount
        return () => {
            clearInterval(intervalId); // Clear the interval
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [onStatusChange]);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            {/* <h2>Connectivity Status</h2>
            <p style={{ color: isOnline ? 'green' : 'red' }}>
                You are currently {isOnline ? 'online' : 'offline'}.
            </p> */}
            {!serverReachable && (
                <p style={{ color: 'orange' }}>
                    Cannot reach the server. Some features may be unavailable.
                </p>
            )}
            {!isOnline && ( // Show the message only when offline
                <p style={{ color: 'red' }}>
                    Some features may be unavailable without an internet connection.
                </p>
            )}
        </div>
    );
};

export const ConnectivityDetectorIndicator: React.FC<ConnectivityDetectorProps> = ({ onStatusChange }) => {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [serverReachable, setServerReachable] = useState<boolean>(true);

    const checkServerConnection = async () => {
        try {
            const response = await fetch(SERVER_URL);
            setServerReachable(response.ok);
        } catch (error) {
            setServerReachable(false);
        }
    };

    useEffect(() => {
        const handleOnline = () => {
            console.log("You are online");
            setIsOnline(true);
            onStatusChange(true);
            checkServerConnection();
        };

        const handleOffline = () => {
            console.log("You are offline");
            setIsOnline(false);
            onStatusChange(false);
        };

        if (typeof navigator !== 'undefined') {
            setIsOnline(navigator.onLine);
            onStatusChange(navigator.onLine);
            console.log("Initial online status:", navigator.onLine);
            if (navigator.onLine) {
                checkServerConnection();
            }
        }

        const intervalId = setInterval(() => {
            checkServerConnection();
        }, 10000);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [onStatusChange]);

    return (
        <div
            style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: !isOnline
                    ? 'red'          // Red when offline
                    : serverReachable
                        ? 'green'        // Green when online and server is reachable
                        : 'orange',      // Orange when online but server is unreachable
                margin: '0 auto', // Center the circle if needed
            }}
        />
    );
}

export const InternetDetector: React.FC<InternetDetectorProps> = ({ onInternetStatusChange }) => {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    const checkInternetAccess = async () => {
        try {
            const response = await fetch("https://httpbin.org/status/200", { method: "HEAD" });
            const onlineStatus = response.ok;
            setIsOnline(onlineStatus); // Update isOnline state based on response
            onInternetStatusChange(onlineStatus); // Notify parent of status
            console.log(onlineStatus ? "Internet access is available." : "No internet access.");
            return onlineStatus;
        } catch (error) {
            console.log("No internet access.");
            setIsOnline(false); // Update isOnline state to false if there’s an error
            onInternetStatusChange(false); // Notify parent of offline status
            return false;
        }
    };

    useEffect(() => {
        // Initial internet status check
        checkInternetAccess();

        // Set interval to check internet access every 30 seconds
        const intervalId = setInterval(checkInternetAccess, 30000); // Check every 30 seconds

        // Event listeners for online/offline changes
        const handleOnline = () => checkInternetAccess();
        const handleOffline = () => {
            console.log("You are offline");
            setIsOnline(false);
            onInternetStatusChange(false); // Notify parent of offline status
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Cleanup event listeners and interval on component unmount
        return () => {
            clearInterval(intervalId);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [onInternetStatusChange]);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Internet Connectivity Status</h2>
            <p style={{ color: isOnline ? 'green' : 'red' }}>
                You are currently {isOnline ? 'online' : 'offline'}.
            </p>
            {!isOnline && ( // Show the message only when offline
                <p style={{ color: 'red' }}>
                    Some features may be unavailable without an internet connection.
                </p>
            )}
        </div>
    );
};

export const GetLocalIPs = async (): Promise<string> => {
    return new Promise((resolve) => {
        const ips = new Set<string>();
        const pc = new RTCPeerConnection();

        pc.createDataChannel(''); // Create a data channel
        pc.createOffer().then(offer => pc.setLocalDescription(offer));

        pc.onicecandidate = (event) => {
            if (!event || !event.candidate) {
                // No more candidates, resolve with the collected IPs
                resolve(ips.size > 0 ? Array.from(ips).join(', ') : '');
                return;
            }

            const ipMatch = event.candidate.candidate.match(/\d+\.\d+\.\d+\.\d+/);
            if (ipMatch) {
                ips.add(ipMatch[0] + ':3001');
            }
        };
    });
};


export default ConnectivityDetector;
