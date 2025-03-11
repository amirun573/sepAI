"use client";
import { useEffect } from "react";

export const useServiceWorker = () => {
    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('Service Worker registered with scope:', registration.scope);
                    return navigator.serviceWorker.ready;
                })
                .then((registration) => {
                    console.log('Service Worker is active:', registration);
                })
                .catch((error) => {
                    console.error('Service Worker registration or activation failed:', error);
                });
        }
    };

    // Automatically register on component mount
    useEffect(() => {
        registerServiceWorker();
    }, []);

    return { registerServiceWorker };
};
