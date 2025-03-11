import React from "react";
import RouteHistoryManager from "./Navigation";

const Header = () => {
    return (
        <>
        <RouteHistoryManager/>
            <header className="flex justify-between items-center mb-8">
                {/* <div className="relative">
                    <button className="flex items-center text-gray-800 hover:text-gray-600">
                        <img
                            src="https://via.placeholder.com/40"
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full"
                        />
                        <span className="ml-2">▼</span>
                    </button>
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
                </div> */}
            </header>
        </>
    )
}

export default Header;