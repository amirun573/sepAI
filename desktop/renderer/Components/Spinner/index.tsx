// Spinner.jsx
import React from 'react';
import './Spinner.module.css'; // Import your spinner styles

const Spinner = () => {
    return (
        <div className="spinner-overlay">
            <div className="spinner"></div>
        </div>
    );
};

export default Spinner;
