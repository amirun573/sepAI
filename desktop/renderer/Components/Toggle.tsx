import { useState } from "react";

interface ToggleProps {
    isOn?: boolean;
    onToggle?: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ isOn = false, onToggle }) => {
    const [enabled, setEnabled] = useState(isOn);

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState);
        if (onToggle) {
            onToggle(newState);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${enabled ? "bg-black" : "bg-gray-300"
                }`}
        >
            <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${enabled ? "translate-x-6" : ""
                    }`}
            />
        </button>
    );
};

export default Toggle;
