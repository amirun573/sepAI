import React, { useState, useEffect } from 'react';


interface FeaturesList {
    label: string;
    icon: string;
    link: string;
}
const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const features: FeaturesList[] = [
        {
            label: 'Home',
            icon: '🏠',
            link: '/dashboard'
        },
        {
            label: 'Marketplace',
            icon: '🏭',
            link: '/marketplace'
        },
        {
            label: 'History',
            icon: '🪄',
            link: '#'
        },
        {
            label: 'Settings',
            icon: '⚙️',
            link: '#'
        }];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <div className="relative mr-10">
            {/* Mobile Hamburger */}
            {isMobile && (
                <button
                    className="fixed top-4 left-4 z-20 p-2 text-gray-800 bg-white shadow-md rounded-md"
                    onClick={() => setIsOpen(true)}
                >
                    <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
                    <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
                    <span className="block w-6 h-0.5 bg-gray-800"></span>
                </button>
            )}

            {/* Backdrop for better UX */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 transition-transform duration-300 ease-in-out z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${!isMobile ? 'relative translate-x-0' : ''}`}
            >
                {/* Close Button */}
                {isMobile && (
                    <button
                        className="absolute top-4 right-4 text-gray-700"
                        onClick={() => setIsOpen(false)}
                    >
                        ✖
                    </button>
                )}

                <h2 className="text-2xl font-bold text-gray-800">SepAI Studio</h2>
                <nav className="mt-8">
                    <ul className="space-y-4">


                        {features.map(feature => {
                            return (
                                <li key={feature.label}>
                                    <a
                                        href={feature.link}
                                        className="flex items-center text-gray-700 hover:text-gray-900"
                                    >
                                        <span className="mr-2">{feature.icon}</span>
                                        {feature.label}
                                    </a>
                                </li>
                            );
                        })}


                    </ul>
                </nav>


            </aside>
        </div>
    );
};

export default Navbar;
