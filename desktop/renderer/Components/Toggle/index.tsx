import React from 'react';
import "./toggle.css";
interface ToggleSwitchProps {
    status: boolean;
    index: number;
    uuid?: string;
    HandleToggleStatus: (newValue: boolean, index: number, uuid: string) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ status, index, HandleToggleStatus, uuid }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.checked; // Get the new status (true/false)

        const uuidUsed: string = uuid || '';
        HandleToggleStatus(newValue, index, uuidUsed); // Pass the new value back
    };

    return (
        <label className="toggle-switch">
            <input
                type="checkbox"
                checked={status}
                onChange={handleChange} // Use the local handleChange function
            />
            <span className="slider"></span>
        </label>
    );
};

export default ToggleSwitch;
