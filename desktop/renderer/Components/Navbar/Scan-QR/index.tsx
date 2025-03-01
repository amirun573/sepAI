import React, { useState, useCallback } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import _ from 'lodash';

interface QrCodeScannerProps {
    onScanResult: (result: string) => void;  // Callback prop
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ onScanResult }) => {
    const [scanResult, setScanResult] = useState<string>('');

    const handleScan = useCallback(_.throttle((detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue || '';
            setScanResult(result);
            onScanResult(result);  // Pass the result back to the parent component
        }
    }, 500), [onScanResult]);

    const handleError = (error: unknown) => {
        if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '70vh',
            padding: '0 20px',
        }}>
            <div style={{
                width: '100%',
                height: 'auto',
                maxWidth: '800px',
                aspectRatio: '1.5',
                boxSizing: 'border-box',
                position: 'relative',
            }}>
                <h1 style={{ textAlign: 'center' }}>Scanner Employee QR Here</h1>

                <div style={{ width: '100%', height: '100%' }}>
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            facingMode: 'environment',
                            width: { ideal: 3000 },
                            height: { ideal: 1280 },
                        }}
                    />
                </div>

                {/* {scanResult && <p style={{ textAlign: 'center' }}>Employee ID: {scanResult}</p>} */}
            </div>
        </div>
    );
};

export default QrCodeScanner;
