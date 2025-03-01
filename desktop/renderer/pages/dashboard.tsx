

import React, { useEffect, useState } from 'react';
 import Navbar from '../Components/Navbar';
import Header from '../Components/Header';
import Prompt from '../Components/Prompt';
import DeviceStatus from '../Components/DeviceStatus';
import ChatLists from '../Components/chat/ChatLists';
import { APIChatHistoryResponse } from '../_Common/interface/api.interface';
import API from '../_Common/function/api';
import { APICode } from '../_Common/enum/api-code.enum';

const Dashboard: React.FC = () => {

    const [deviceStatusOpen, setDeviceStatusOpen] = useState<boolean>(true);

    const [chatHistory, setChatHistory] = useState<APIChatHistoryResponse[]>([]);
    const [limit, setLimit] = useState<number>(10);
    const [skip, setSkip] = useState<number>(10);


    const handleSendMessage = (data: APIChatHistoryResponse) => {

        setDeviceStatusOpen((prev) =>{
            return false;
        });
        // Update chat history with the new message
        setChatHistory((prevChatHistory) => [
            ...(Array.isArray(prevChatHistory) ? prevChatHistory : []), // Ensure it's always an array
            {
                chat_id: data.chat_id, // Unique ID
                content: data.content,
                role: data.role,
                created_at: data.created_at,
            },
        ]);
    };

    const fetchChat = async () => {
        try {
            const response = await API({
                url: `chats/history/?limit=${limit}&skip=${skip}`,
                API_Code: APICode.chat_history
            });

            if (!response.success) {
                throw Error("No Chat History Being Fetch")
            }

            setChatHistory(response.data as APIChatHistoryResponse[]);
        } catch (error: any) {
            alert(error?.message || "Error At Fetch History")
        }
    }

    useEffect(() => {
        fetchChat();
    }, []);

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

                {/* Chat History */}
                <div className='mt-10'>
                    <ChatLists chatHistory={chatHistory} />
                </div>


                {/* Charts Section */}
                <div className='mt-10'>
                    <Prompt onSendMessage={handleSendMessage} />

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