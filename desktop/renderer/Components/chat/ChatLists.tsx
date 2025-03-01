"use client";
import React, { useEffect, useState } from 'react';
import { APIChatHistoryResponse } from '../../_Common/interface/api.interface';

const ChatLists = ({ chatHistory }: { chatHistory: APIChatHistoryResponse[] }) => {



    return chatHistory.length > 0 ? (
        <div className="p-4 w-full max-w-4xl mx-auto"> {/* Increased max width */}
            <div className="bg-white shadow-md rounded-lg p-4 space-y-4 h-[500px] overflow-y-auto">
                {chatHistory.map((chat) => (
                    <div
                        key={chat.chat_id}
                        className={`p-3 rounded-lg w-fit max-w-[90%] ${chat.role === "user"
                            ? "bg-blue-500 text-white self-end ml-auto"
                            : "bg-gray-300 text-black self-start mr-auto"
                            }`}
                    >
                        <div className="text-sm">{chat.content}</div>
                        <span className="block text-xs opacity-75 mt-1">
                            {new Date(chat.created_at).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>

    ) : null;

}

export default ChatLists;
