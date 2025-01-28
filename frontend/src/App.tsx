import React from "react";


const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Main Content */}
        <Content />
      </div>
    </div>
  );
};

export default App;

// Sidebar Component
 const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-4">LLM Studio</h2>
      <nav className="flex flex-col space-y-2">
        <a href="#" className="p-2 rounded-lg hover:bg-gray-700">
          Dashboard
        </a>
        <a href="#" className="p-2 rounded-lg hover:bg-gray-700">
          Models
        </a>
        <a href="#" className="p-2 rounded-lg hover:bg-gray-700">
          Datasets
        </a>
        <a href="#" className="p-2 rounded-lg hover:bg-gray-700">
          Settings
        </a>
      </nav>
    </div>
  );
};

// Header Component
 const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Welcome to LLM Studio</h1>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Sign Out
      </button>
    </header>
  );
};

// Content Component
 const Content: React.FC = () => {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4">Content Area</h2>
        <p>This is where your main content will go. Customize as needed!</p>
      </div>
    </main>
  );
};
