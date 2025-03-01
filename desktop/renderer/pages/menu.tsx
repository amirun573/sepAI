"use client";
import Navbar from '../Components/Navbar';
import QrCodeScanner from '../Components/Navbar/Scan-QR';
import { Suspense, useEffect, useState, useRef } from 'react';
import Spinner from '../Components/Spinner';
import axios from 'axios';
import { StatusAPICode } from '../_Common/enum/status-api-code.enum';
import { DisplayAlert } from '../_Common/function/Error';
import { ScanEmployeeIDValidation } from '../_Common/validation/user.validation';
import { encrypt } from '../_Common/function/Hashing';
import { SubsidySubmitPrice } from '../_Common/interface/subsidy.interface';
import { EmployeeSubmitPriceValidation } from '../_Common/validation/subsidy.validation';
import { GetLocalStorageDetails, HandleUnAuthorized } from '../_Common/function/LocalStorage';
import { UserDetailsLocalStorage } from '../_Common/interface/auth.interface';
import Image from 'next/image';
import { GetLocalIPs } from '../Components/Connectivity/index'
import React from 'react';
import { MainContent } from '../Components/Main/index';
import ProductCard from '../Components/ProductCard';
const ScanPage = () => {
    const [employeeId, setEmployeeId] = useState<string>('');
    const [showScannerModal, setShowScannerModal] = useState<boolean>(true);


    const totalPriceInputRef = useRef<any>(null); // Create a ref for the input

    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [availableCredit, setAvailableCredit] = useState<number>(0); // Example available credit
    const [discount, setDiscount] = useState<number>(0); // Example discount
    const [loading, setLoading] = useState(false);
    const [employeeName, setEmployeeName] = useState<string>('');
    const [calculatedFinalPrice, setCalculatedFinalPrice] = useState<number>(0);
    const [subsidyCreditUUID, setSubsidyCreditUUID] = useState<string>('');
    const [isOnline, setIsOnline] = useState<boolean>(true); // Initialize the online status

    const [internet, setInternet] = useState<boolean>(true);

    const isPasting = useRef(false); // Ref to track if pasting is occurring
    const lastKeyPressTime = useRef<number | null>(null); // Track the timestamp of the last key press

    // Threshold for distinguishing between card reader input and manual typing (in milliseconds)
    const cardReaderThreshold = 50;

    // Callback function to get scan result
    const handleScanResult = (result: any) => {
        handleEmployeeID(result);
        setShowScannerModal(false); // Close modal once scan is successful

        if (totalPriceInputRef.current) {
            totalPriceInputRef.current.focus(); // Move the cursor to the input
        }
    };

    const handleToggleScannerModal = () => {
        setShowScannerModal(true); // Open modal
    };

    const handleCloseModal = () => {
        setShowScannerModal(false); // Close modal manually if needed
    };

    const handleTotalPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            let rawValue = event.target.value;

            // If the current value is "0" and the user enters a new number, replace it
            if (rawValue === '0') {
                return;
            }

            // Check if the input is a valid number
            if (!/^(\d*\.?\d*)$/.test(rawValue)) {
                throw new Error("Invalid number");
            }

            // Allow empty input (if the user clears the field)
            if (rawValue === '') {
                setTotalPrice(0);
                return;
            }

            // Parse the value to a float (removes leading zeros)
            const newValue = parseFloat(rawValue);

            // Replace 0 with the new value when a number is entered
            if (newValue !== 0) {
                rawValue = newValue.toString();
            }

            // Update the state with the new value
            setTotalPrice(newValue);

            // Directly update the input field to reflect the new value
            event.target.value = rawValue;
        } catch (error: any) {
            alert(error.message); // Show specific error message
        }
    };



    const handleEmployeeID = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        try {
            const employeeID = String(event?.target?.value || event); // Ensure value is string

            if (employeeID) {


                await ScanEmployeeIDValidation({ employeeID });

                const userDetailsLocalStorage = await GetLocalStorageDetails() as UserDetailsLocalStorage;

                if (!userDetailsLocalStorage) {
                    await HandleUnAuthorized(null);
                }

                if (!userDetailsLocalStorage?.accessToken) {
                    throw Error("Access Token Not Exist. Please Login");
                }

                if (internet) {
                    // Make sure to await the API call
                    const employeeIDCheckRequest = await axios.get(`/api/user?${StatusAPICode.code}=${StatusAPICode.GET_CHECK_EMPLOYEE_ID_AUTH}&employeeID=${encrypt(employeeID)}`, {
                        headers: {
                            Authorization: `Bearer ${userDetailsLocalStorage.accessToken}`
                        }
                    });

                    if (!employeeIDCheckRequest.data?.employee_id || !employeeIDCheckRequest.data?.employee_name || (typeof employeeIDCheckRequest.data?.available_credit !== 'number') || !employeeIDCheckRequest.data?.subsidyCreditUUID) {
                        throw Error("Failed To Retrieve Subsidy Details");
                    }

                    setEmployeeId(employeeIDCheckRequest.data?.employee_id as string);


                    setSubsidyCreditUUID(employeeIDCheckRequest.data?.subsidyCreditUUID as string);
                    const newAvailableCredit: number = employeeIDCheckRequest.data?.available_credit as number > 0 ? employeeIDCheckRequest.data?.available_credit as number : 0;

                    setEmployeeName(employeeIDCheckRequest.data?.employee_name);
                    setAvailableCredit(newAvailableCredit)

                    const newDiscount: number = newAvailableCredit > 0 ? newAvailableCredit - totalPrice : 0;

                    setDiscount(newDiscount);
                }



                // Process employeeIDCheckRequest response as necessary
            } else {
                setEmployeeId('');
            }

        } catch (error) {
            console.error("Error occurred:", error);
            DisplayAlert(error); // Make sure this doesn't block code execution
        } finally {
            // This should always execute regardless of error
            setLoading(false);
        }
    };

    const HandleEmployeeIDString = async (employe_id: string) => {
        setLoading(true);
        try {
            const employeeID = employe_id; // Ensure value is string

            if (employeeID) {


                await ScanEmployeeIDValidation({ employeeID });

                const userDetailsLocalStorage = await GetLocalStorageDetails() as UserDetailsLocalStorage;

                if (!userDetailsLocalStorage) {
                    await HandleUnAuthorized(null);
                }
                // Make sure to await the API call
                const employeeIDCheckRequest = await axios.get(`/api/user?${StatusAPICode.code}=${StatusAPICode.GET_CHECK_EMPLOYEE_ID_AUTH}&employeeID=${encrypt(employeeID)}`, {
                    headers: {
                        Authorization: `Bearer ${userDetailsLocalStorage.accessToken}`
                    }
                });

                if (!employeeIDCheckRequest.data?.employee_id || !employeeIDCheckRequest.data?.employee_name || (typeof employeeIDCheckRequest.data?.available_credit !== 'number') || !employeeIDCheckRequest.data?.subsidyCreditUUID) {
                    throw Error("Failed To Retrieve Subsidy Details");
                }

                setEmployeeId(employeeIDCheckRequest.data?.employee_id as string);


                setSubsidyCreditUUID(employeeIDCheckRequest.data?.subsidyCreditUUID as string);
                const newAvailableCredit: number = employeeIDCheckRequest.data?.available_credit as number > 0 ? employeeIDCheckRequest.data?.available_credit as number : 0;

                setEmployeeName(employeeIDCheckRequest.data?.employee_name);
                setAvailableCredit(newAvailableCredit)

                const newDiscount: number = newAvailableCredit > 0 ? newAvailableCredit - totalPrice : 0;

                setDiscount(newDiscount);
                // Process employeeIDCheckRequest response as necessary
            } else {
                setEmployeeId('');
            }

        } catch (error) {
            console.error("Error occurred:", error);
            DisplayAlert(error); // Make sure this doesn't block code execution
        } finally {
            // This should always execute regardless of error
            setLoading(false);
        }
    };

    const HandleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currentTime = Date.now();

        if (lastKeyPressTime.current) {
            const timeDifference = currentTime - lastKeyPressTime.current;

            if (timeDifference < cardReaderThreshold) {

                const value_card: string = String((e as unknown as React.ChangeEvent<HTMLInputElement>).target.value.trim());



                if (value_card.length >= 5) {

                    const employee_card_value = encrypt(value_card);
                    setEmployeeId(employee_card_value);
                    //For security purpose to ensure the value is not easily visible.
                    HandleEmployeeIDString(employee_card_value);

                }



                // Handle the card reader action
            } else {
                // Handle manual input (i.e., when Enter is pressed)
                if (e.key === 'Enter') {
                    handleEmployeeID(e as unknown as React.ChangeEvent<HTMLInputElement>);
                }
            }
        }

        // Update the last key press time
        lastKeyPressTime.current = currentTime;
    };


    const HandleSubmitTotalPrice = async () => {
        setLoading(true);
        try {


            const userDetailsLocalStorage = await GetLocalStorageDetails() as UserDetailsLocalStorage;

            if (!userDetailsLocalStorage) {
                await HandleUnAuthorized(null);
            }
            const data: SubsidySubmitPrice = {
                totalPrice: calculatedFinalPrice,
                price: totalPrice,
                availableCredit,
                discount,
                employee_id: employeeId,
                [StatusAPICode.code]: StatusAPICode.CREATE_SUBMIT_SUBSIDY_TRANSACTION_AUTH,
                subsidyCreditUUID,
            };

            const encryptedData = {
                encryptedData: encrypt(JSON.stringify(data)),
                [StatusAPICode.code]: StatusAPICode.CREATE_SUBMIT_SUBSIDY_TRANSACTION_AUTH
            }


            await EmployeeSubmitPriceValidation(data);

            if (internet) {
                const requestSubmitPrice = await axios.post(`/api/subsidy`, encryptedData, {
                    headers: {
                        Authorization: `Bearer ${userDetailsLocalStorage.accessToken}`
                    }
                });

                if (!requestSubmitPrice.data?.updateSubsidy) {
                    throw Error("Cannot Retreive Data For Update Subisdy Credit");
                }

                alert("Successfully Update");

                window.location.reload();
            }





        } catch (error) {
            console.error(error);
            DisplayAlert(error);
            await HandleUnAuthorized(error);
        } finally {
            setLoading(false);
        }
    }

    const ModalScannerQRCode = () => {
        try {



            return (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '10px',
                            position: 'relative',
                            width: '90%',
                            maxWidth: '500px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            margin: '1rem',
                            boxSizing: 'border-box',
                        }}>
                            {/* Header with "X" close button */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h1 style={{ marginBottom: '5px', color: 'black', fontSize: '1.5rem' }}>Scan QR Code</h1>
                                <button
                                    onClick={handleCloseModal}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: 'black',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px', // Moved back to the right
                                    }}>
                                    &times;
                                </button>
                            </div>

                            {/* QR Code Scanner */}
                            <div style={{ marginTop: '2px' }}> {/* Reduced margin-top */}
                                <QrCodeScanner onScanResult={handleScanResult} />
                            </div>


                            {/* Footer with close button */}
                            <div style={{ marginTop: '20px' }}>
                                <button
                                    onClick={handleCloseModal}
                                    style={{
                                        backgroundColor: '#ff4d4d',
                                        border: 'none',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                    }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>



                </>
            )
        } catch (error) {
            console.error(error);
        }
    }

    const HandleKeyDownTotalPriceInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        setLoading(true);
        try {

            if (e.key === 'Enter') {
                await HandleSubmitTotalPrice();
            }
        } catch (error) {
            console.error(error);
            DisplayAlert(error);
            await HandleUnAuthorized(error);
        } finally {
            setLoading(false);
        }
    }

    const HandleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Check if pasting is happening and prevent onChange update during pasting
        if (!isPasting.current) {
            setEmployeeId(e.target.value); // Handle typing input normally
        }
    };



    // const HandlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    //     try {
    //         e.preventDefault(); // Prevent the default paste behavior
    //         isPasting.current = true; // Set pasting flag to true


    //         const pastedText = (e.clipboardData || window.Clipboard).getData('text'); // Get the pasted text
    //         const modifiedText = pastedText.trim(); // Modify if necessary


    //         setEmployeeId(modifiedText); // Set the modified value to employeeId

    //         // Reset the pasting flag AFTER the next event loop to ensure onChange doesn't fire immediately
    //         setTimeout(() => {
    //             isPasting.current = false;
    //         }, 0); // Ensure the flag is reset after the paste action is fully complete
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    const handleInternetStatusChange = (status: boolean) => {
        setInternet(status); // Update the online status
        // You can also perform other actions here based on the status change
    };

    const handleStatusChange = (status: boolean) => {
        setIsOnline(status); // Update the online status
        // You can also perform other actions here based on the status change
    };

    const fetchLocalIP = async () => {
        const localIPs = await GetLocalIPs();
    };

    useEffect(() => {
        if (!isOnline) {
            fetchLocalIP();
        }
    }, [isOnline])





    useEffect(() => {
        const finalPrice: number = Math.max(0, totalPrice - availableCredit);

        setCalculatedFinalPrice(finalPrice);

    }, [totalPrice, availableCredit, discount]);

    const [activeCategory, setActiveCategory] = useState('Fruits');

    const categories = ['Fruits', 'Drinks', 'Eggs & Dairy', 'Meat'];
    const products = [
        { name: 'Apple', weight: '500g', price: '2.35', imageUrl: 'path-to-apple-image' },
        { name: 'Orange', weight: '500g', price: '1.15', imageUrl: 'path-to-orange-image' },
    ];
    const others = [
        { name: 'Biotta juice 100%', weight: '250 ml', price: '4.35', imageUrl: 'path-to-juice1-image' },
        { name: "Leni's juice", weight: '250 ml', price: '4.35', imageUrl: 'path-to-juice2-image' },
    ];


    return (
        <>
            <Navbar />
            <MainContent />

            <div>
                {loading && <Spinner />}

                <div className="p-4 bg-gray-50 min-h-screen">
                    {/* Header with Back and Search buttons */}
                    <div className="flex items-center justify-between mb-4">
                        <button className="text-gray-600">
                            <span className="text-lg">←</span>
                        </button>
                        <h1 className="text-xl font-semibold">Fruits</h1>
                        <button className="text-gray-600">
                            <span className="text-lg">🔍</span>
                        </button>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex space-x-2 mb-6">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`px-4 py-2 rounded-full ${activeCategory === category ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Product Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.name}
                                name={product.name}
                                weight={product.weight}
                                price={product.price}
                                imageUrl={product.imageUrl}
                            />
                        ))}
                    </div>

                    {/* Other Products List */}
                    <h2 className="text-lg font-semibold mb-4">Other</h2>
                    <div className="space-y-4">
                        {others.map((item) => (
                            <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg shadow-md">
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md" />
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.weight}</p>
                                </div>
                                <p className="font-bold">${item.price}</p>
                            </div>
                        ))}
                    </div>

                    {/* Cart Button */}
                    <button className="fixed bottom-4 right-4 flex items-center justify-center w-14 h-14 bg-gray-800 text-white rounded-full shadow-lg">
                        <span className="text-lg font-bold">$12</span>
                    </button>
                </div>
            </div>

        </>
    );
};

const Page = () => {
    return (
        <Suspense fallback={'...Loading'}>
            <ScanPage />
        </Suspense>
    );
};

export default Page;
