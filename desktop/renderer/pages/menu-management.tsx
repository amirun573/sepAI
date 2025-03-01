"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Navbar from '../Components/Navbar';


import { UserDetailsLocalStorage } from '../_Common/interface/auth.interface';
import { GetLocalStorageDetails, HandleUnAuthorized } from '../_Common/function/LocalStorage';
import { SubsidyTransactionPagination, SubsidyTransactionReportDownload, UpdateSubsidyTypeValidation } from '../_Common/validation/subsidy.validation';
import axios from 'axios';
import { StatusAPICode } from '../_Common/enum/status-api-code.enum';
import { DisplayAlert } from '../_Common/function/Error';
import { ConvertToUTCEndOfDay, ConvertToUTCStartOfDay, HandleDateFormatToAPI, HandleDateTimeFormatToAPI } from '../_Common/function/Date';
import Spinner from '../Components/Spinner';
import ToggleSwitch from '../Components/Toggle';
import Modal from '../Components/Modal/index';
import FileUploader from '../Components/Upload-File/File-Uploader';
import { FilePathFolder } from '../_Common/enum/file-path-folder.enum';
import { PutBlobResult } from '@vercel/blob';
import { Blob_ENV, Content_Type } from '../_Common/enum/content-type.enum';
import { SaveBlob } from '../_Common/interface/media-metadata.interface';
import { GetBlobFormat } from '../_Common/function/Handle-Blob';
import ConnectivityDetector, { GetLocalIPs } from '../Components/Connectivity/index';
import { ClientRequest } from '../Components/API/client';
import { MenuListsResponse } from '../_Common/interface/api-response.interface';
import { MenuCategoryWrite, MenuWrite } from '../_Common/validation/menu.validation';
import { MenuCategory } from '@prisma/client';


interface MenuDetails {
    menu_name: string,
    menu_price: string,
    menu_category_uuid: string,
    image_path: string,

}

interface MenuCategoryDetails {
    menu_name_category: string,
    uuid?: string,
    method: 'create' | 'update'
}

const MenuManagement = () => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1); // State variable to store current page
    const [filter, setFilter] = useState<string>('');
    const [totalItems, setTotalItems] = useState<number>(0); // State variable to store total number of items
    const [userDetailLocal, setUserDetailLocal] = useState<UserDetailsLocalStorage>();
    const [isMobile, setIsMobile] = useState(false);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const [isOpenModalUpdateSubsidyType, setIsOpenodalUpdateSubsidyType] = useState<boolean>(false);

    const [openModalAddMenu, setOpenModalAddMenu] = useState(false);

    const [menuDetails, setMenuDetails] = useState<MenuDetails>({
        menu_name: '',
        menu_price: '',
        menu_category_uuid: '',
        image_path: '',
    });


    const [menuCategory, setMenuCategory] = useState<Partial<MenuCategory[]>>([]);



    const [openModalAddMenuCategory, setOpenModalAddMenuCategory] = useState(false);
    const [menuCategoryDetails, setMenuCategoryDetails] = useState<MenuCategoryDetails>({
        menu_name_category: '',
        uuid: '',
        method: 'create',
    });


    const [isOnline, setIsOnline] = useState<boolean>(true); // Initialize the online status




    interface SubsidyTypePagination {
        active: boolean,
        price: number,
        subsidy_type_name: string,
        subsidy_type_code: string,
        uuid: string,
    }


    const handlePageChange = (page: number) => {
        // Update the current page state
        setCurrentPage(page);

        // Fetch data for the new page using the page number and other parameters as needed
        // GetEmployee();
    };


    const GetMenuLists = async () => {
        setLoading(true);
        try {

            const userDetailsLocalStorage = await GetLocalStorageDetails() as UserDetailsLocalStorage;

            if (!userDetailsLocalStorage) {
                await HandleUnAuthorized(null);
            }

            setUserDetailLocal(userDetailsLocalStorage as UserDetailsLocalStorage);

            await SubsidyTransactionPagination({
                page: currentPage,
                filter,
                startDate,
                endDate
            });

            const requestMenuCategory = await ClientRequest({
                urlPath: `menu?${StatusAPICode.code}=${StatusAPICode.GET_MENU_CATEGORY}`,
                data: {},
                code: StatusAPICode.GET_MENU_CATEGORY,
                Content_Type: Content_Type.JSON,

            });

            if (!requestMenuCategory?.menuCategory) {
                throw Error("No Menu Category");
            }

            setMenuCategory(requestMenuCategory?.menuCategory as MenuCategory[]);


            const requestMenu = await ClientRequest({
                urlPath: `menu?${StatusAPICode.code}=${StatusAPICode.GET_MENU_LISTS_PAGINATION}&page=${currentPage}&filter=${filter}`,
                data: {
                    currentPage, filter, startDate, endDate
                },
                code: StatusAPICode.GET_MENU_LISTS_PAGINATION,
                Content_Type: Content_Type.JSON,

            }) as MenuListsResponse;

            setTotalItems(requestMenu?.totalItems || 0 as number);


            const subsidyTypesArray: SubsidyTypePagination[] = [];


            // if (requestBooking.data?.transactions) {
            //     const subsidyTypes: SubsidyType[] = requestBooking.data?.transactions as SubsidyType[];

            //     subsidyTypes.map(item => {



            //         const subsidyTransaction: SubsidyTypePagination = {
            //             active: item.active,
            //             price: item.price,
            //             subsidy_type_code: item?.subsidy_type_code,
            //             subsidy_type_name: item?.subsidy_type_name,
            //             uuid: item.uuid || '',  // The parenthesis was missing here

            //         };


            //         subsidyTypesArray.push(subsidyTransaction);
            //     });


            // }

            // setSubsidyTypes(subsidyTypesArray.length > 0 ? subsidyTypesArray : []);



            // setBooking(requestBooking.data?.booking as Partial<Booking[]>);
        } catch (error: any) {
            console.error(error);
            alert(error?.response?.data?.message || error?.message || "Something Goes Wrong");
            await HandleUnAuthorized(error);
        } finally {
            setLoading(false);
        }
    }

    const handleStatusChange = (status: boolean) => {
        setIsOnline(status); // Update the online status
        // You can also perform other actions here based on the status change
        console.log("Online status changed to:", status);
    };

    const fetchLocalIP = async () => {
        const localIPs = await GetLocalIPs();
        if (localIPs) {
            console.log('Local IPs:', localIPs);
        } else {
            console.log('No local IPs found');
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                window.addEventListener('resize', handleResize);

                // Call handler right away so state gets updated with initial window size
                handleResize();

                // Fetch employee and department data sequentially
                await GetMenuLists();       // If this throws an error, the following will not execute

            } catch (error) {
                console.error(error);
                DisplayAlert(error);       // Display the error alert
            } finally {
                setLoading(false);         // Ensure loading is turned off after the operations
            }
        };


        fetchData();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);  // Empty dependency array ensures this runs only once

    useEffect(() => {
        setLoading(true)
        try {
            const fetchData = async () => {
                setLoading(true);
                try {


                    // Fetch employee and department data sequentially
                    await GetMenuLists();       // If this throws an error, the following will not execute


                } catch (error) {
                    console.error(error);
                    DisplayAlert(error);       // Display the error alert
                } finally {
                    setLoading(false);         // Ensure loading is turned off after the operations
                }
            };


            fetchData();

        } catch (error) {
            DisplayAlert(error);
        } finally {
            setLoading(false);
        }
    }, [filter]);


    useEffect(() => {
        if (!isOnline) {
            fetchLocalIP();
        }
    }, [isOnline])



    const HandleToggleActiveMenu = async (status: boolean, index: number, uuid?: string) => {
        setLoading(true);
        try {

            // if (uuid) {

            //     // Update the specific item in the array using the index
            //     const updatedEmployees = [...employeesDetails];
            //     updatedEmployees[index] = {
            //         ...updatedEmployees[index],
            //         user_active: status,
            //     };

            //     const employee: EmployeeDetails = (updatedEmployees[index]);

            //     if (!employee) {
            //         throw Error("No Employee Can Be Found");
            //     }

            //     const updateUser: UpdateStatusRequest = {
            //         code: StatusAPICode.UPDATE_USER_ACTIVE_STATUS,
            //         uuid: employee.uuid,
            //         active_status: employee.user_active
            //     };

            //     console.log("Update User==>", updateUser);

            //     await UpdateEmployeeStatusValidation(updateUser);

            //     const requestUpdateUserStatus = await axios.put(`/api/user`, updateUser, {
            //         headers: {
            //             Authorization: `Bearer ${userDetailLocal?.accessToken}`,
            //         }
            //     });

            //     if (!requestUpdateUserStatus.data?.message) {
            //         throw Error("Failed TO Update Employee Status");
            //     }

            //     alert(requestUpdateUserStatus.data?.message);


            //     setEmployeeDetails(updatedEmployees);

            //     window.location.reload();



            // }

            // else {
            //     throw Error("Employee ID not found");
            // }


        } catch (error) {
            console.error(error);
            DisplayAlert(error);
            await HandleUnAuthorized(error);
        } finally {
            setLoading(false);
        }
    }






    const ModalAddMenu = () => {





        const [tempMenuDetails, setTempMenuDetails] = useState<MenuDetails>(menuDetails);

        // Function to handle text input change
        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;

            // Update the specific field in tempMenuDetails
            setTempMenuDetails((prevDetails) => ({
                ...prevDetails,
                [name]: name === 'menu_price' ? parseFloat(value) || 0 : value, // Parse to float if it's the price field
            }));
        };

        const handleUploadProfileImage = async (blob: PutBlobResult[]) => {
            try {

                const blobFormat: SaveBlob[] = GetBlobFormat({
                    blob: blob,
                    blob_env: Blob_ENV.local
                });

                if (blobFormat.length > 0) {
                    //Logic is to take the first one because it only to update Profile Image.
                    console.log("blobFormat===>", blobFormat);

                    const menu_image: string = blobFormat[0].url;
                    console.log("menu_image===>", menu_image);

                    // Update menuDetails state with the new image path
                    setTempMenuDetails(prevDetails => ({
                        ...prevDetails,
                        image_path: menu_image
                    }));

                }

            } catch (error: any) {
                console.error(error);
                alert(error?.response?.data?.message || error?.message || 'Failed to Upload. Please Try Again.');
                HandleUnAuthorized(error);
            }
        };


        // Function to handle selection and read the selected menu category by ID
        const HandleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

            setTempMenuDetails(prevDetails => ({
                ...prevDetails,
                menu_category_uuid: e.target.value
            }));
        };

        const HandleSubmit = async () => {

            try {


                const request = await ClientRequest({
                    urlPath: 'menu',
                    data: tempMenuDetails,
                    code: StatusAPICode.CREATE_MENU,
                    Content_Type: Content_Type.JSON
                })


            } catch (error) {
                console.error(error);
                DisplayAlert(error);
            }
        }

        try {
            const url: string = `/api/callback/upload-file`;
            const statusAPICode = StatusAPICode.CALLBACK_UPLOAD_FILES;

            const clientPayload: string = JSON.stringify({
                code: statusAPICode,
                accessToken: userDetailLocal?.accessToken
            });

            return (
                <div>

                    <button onClick={() => setOpenModalAddMenu(true)}>Open Modal</button>

                    <Modal
                        show={openModalAddMenu}
                        onClose={() => setOpenModalAddMenu(false)}
                        title="Add Menu"
                    >
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                            <div className="flex flex-col items-center space-y-4">
                                <label
                                    htmlFor="menu_category"
                                    className="text-gray-600 font-medium"
                                >
                                    Menu Category
                                </label>
                                <select
                                    id="menu_category"
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-500"
                                    value={tempMenuDetails.menu_category_uuid}
                                    onChange={HandleSelectChange}
                                >
                                    <option id="--" value="">--</option>
                                    {menuCategory.map((e: MenuCategory) => (
                                        <option key={e.uuid} value={e.uuid} selected>
                                            {e.menu_category_name}
                                        </option>
                                    ))}
                                </select>


                            </div>
                            <div className="flex flex-col items-center space-y-4 mt-4">
                                <label
                                    htmlFor="menu_name"
                                    className="text-gray-600 font-medium"
                                >
                                    Menu Name
                                </label>
                                <input
                                    type="text"
                                    name="menu_name"
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-500"
                                    value={tempMenuDetails.menu_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter menu name"
                                />

                            </div>
                            <div className="mt-4 flex flex-col items-center space-y-4">
                                <label
                                    htmlFor="menu_price"
                                    className="text-gray-600 font-medium"
                                >
                                    Price (RM)
                                </label>
                                <input
                                    type="number"
                                    name="menu_price"
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-500"
                                    value={tempMenuDetails.menu_price}
                                    onChange={handleInputChange}
                                    placeholder="Enter menu price"
                                />

                            </div>

                            <div className="mt-4 flex flex-col items-center space-y-4">
                                <label
                                    className="text-gray-600 font-medium"
                                >
                                    Menu Image
                                </label>
                                <FileUploader
                                    url={url}
                                    acceptedFileTypes={[
                                        "image/png",
                                        "image/jpeg",
                                    ]}
                                    maxFileSize={1000}
                                    label="Max File Size: 10 MB"
                                    labelAlt="Accepted File Types: png, jpeg"
                                    accessToken={userDetailLocal?.accessToken}
                                    onUploadSuccess={handleUploadProfileImage}
                                    statusAPICode={statusAPICode}
                                    uuid={userDetailLocal?.uuid}
                                    filePathFolder={FilePathFolder.POS}
                                    clientPayload={clientPayload}
                                    allowMultiple={false}
                                />

                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                    onClick={() => setOpenModalAddMenu(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={HandleSubmit}
                                >
                                    Submit
                                </button>
                            </div>

                        </div>
                    </Modal>
                </div>
            );

            // return (<Modal
            //     show={openModalAddMenu}
            //     onClose={() => setOpenModalAddMenu(false)}
            //     className="flex items-center justify-center">
            //     <Modal.Header className="text-center">Add Menu</Modal.Header>
            //     <Modal.Body className="max-h-[75vh] overflow-y-auto">
            //         <div className="space-y-6">
            //             <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>

            //                 <FileUploader
            //                     url={url}
            //                     acceptedFileTypes={[
            //                         "image/png",
            //                         "image/jpeg",
            //                     ]}
            //                     maxFileSize={1000}
            //                     label="Max File Size: 10 MB"
            //                     labelAlt="Accepted File Types: png, jpeg"
            //                     accessToken={userDetailLocal?.accessToken}
            //                     onUploadSuccess={handleUploadProfileImage}
            //                     statusAPICode={statusAPICode}
            //                     uuid={userDetailLocal?.uuid}
            //                     filePathFolder={FilePathFolder.partner}
            //                     clientPayload={clientPayload}
            //                 />
            //             </div>
            //         </div>
            //     </Modal.Body>
            //     <Modal.Footer>
            //         {/* <Button onClick={() => handleConfirmDescription()}>I accept</Button>
            //     <Button color="red" onClick={() => setOpenModalEditDescription(false)}>
            //         Cancel
            //     </Button> */}
            //     </Modal.Footer>
            // </Modal>);
        } catch (error) {
            console.error(error);
        }
    }

    const ModalAddMenuCategory = () => {


        const [tempMenuCategoryDetails, setTempMenuCategoryDetails] = useState<MenuCategoryDetails>(menuCategoryDetails);


        const HandleSubmit = async () => {

            try {


                const { menu_name_category, uuid, method } = tempMenuCategoryDetails;


                if (method === 'create') {
                    const request = await ClientRequest({
                        urlPath: 'menu',
                        data: {
                            menu_name_category, uuid, code: StatusAPICode.CREATE_MENU_CATEGORY,
                        },
                        code: StatusAPICode.CREATE_MENU_CATEGORY,
                        Content_Type: Content_Type.JSON
                    });

                    if (!request?.message) {
                        throw Error("No Response create Menu Category");
                    }

                    alert(request?.message);
                    window.location.reload();
                }

                // Update
                else {

                    if (!uuid) {
                        throw Error("No Code Menu Category")
                    }
                }
            } catch (error) {
                console.error(error);
                DisplayAlert(error);
            }
        }

        try {


            return (
                <div>

                    <button onClick={() => setOpenModalAddMenuCategory(true)}>Open Modal</button>

                    <Modal
                        show={openModalAddMenuCategory}
                        onClose={() => setOpenModalAddMenuCategory(false)}
                        title="Add Menu Category"
                    >
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>

                            <div className="flex flex-col items-center space-y-4">
                                <label
                                    htmlFor="menu_name_category"
                                    className="text-gray-600 font-medium"
                                >
                                    Menu Category Name
                                </label>
                                <input
                                    type="text"
                                    id="menu_name"
                                    className="border border-gray-300 rounded-md px-4 py-2 w-full text-gray-600"
                                    value={tempMenuCategoryDetails.menu_name_category}
                                    onChange={(e) =>
                                        setTempMenuCategoryDetails({
                                            ...tempMenuCategoryDetails, // Keep other keys the same
                                            menu_name_category: e.target.value, // Update only this key
                                        })
                                    }
                                />


                            </div>


                            <div className="flex justify-end mt-6">
                                <button
                                    className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                                    onClick={() => setOpenModalAddMenuCategory(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-blue-500 text-white px-4 py-2 rounded"
                                    onClick={HandleSubmit}
                                >
                                    Submit
                                </button>
                            </div>

                        </div>
                    </Modal>
                </div>
            );

        } catch (error) {
            console.error(error);
        }
    }

    const HandleAddMenu = async () => {
        try {
            setOpenModalAddMenu(true);
        } catch (error) {

        }
    }

    const HandleAddMenuCategory = async () => {
        try {
            console.log("herererer")
            setOpenModalAddMenuCategory(true);
        } catch (error) {

        }
    }

    return (
        <>
            <Navbar />

            {loading && <Spinner />}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'white', padding: '20px' }}>
                <div style={{ width: '100%', maxWidth: '1200px', height: 'auto', position: 'relative', padding: '20px', boxSizing: 'border-box' }}>

                    {/* Table */}
                    <div className="mt-10">
                        <p className='text-black mb-2'><strong>Menu Management</strong></p>

                        <div className="flex justify-end items-center space-x-4">
                            <label
                                htmlFor="filter"
                                className="text-gray-900 text-sm dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            >
                                Search:
                            </label>
                            <input
                                id="filter"
                                name="filter"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={(e) => setFilter(e.target.value)}
                            />
                            <div className="flex space-x-2 sm:space-x-4">
                                <button
                                    onClick={HandleAddMenu}
                                    className="bg-blue-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
                                >
                                    +
                                </button>

                            </div>
                            <div className="flex space-x-2 sm:space-x-4">
                                <button
                                    onClick={HandleAddMenuCategory}
                                    className="bg-blue-700 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
                                >
                                    Add Menu Category
                                </button>

                            </div>
                        </div>

                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-10">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            No.
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Price (RM)
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Edit
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Active
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {subsidyTypes && subsidyTypes.length > 0 ?
                                        subsidyTypes.map((item, index) => (
                                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {index + 1 + (currentPage - 1) * 10}                                                </th>
                                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                    {item?.subsidy_type_name}
                                                </th>
                                                <td className="px-6 py-4">
                                                    {item.price}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button>
                                                        <button
                                                            className="bg-blue-500 text-white px-4 py-2 rounded"
                                                            onClick={() => HandleEditSubsidyType(item?.uuid as string || '')}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="bg-red-500 text-white px-4 py-2 rounded"
                                                            onClick={() => HandleEditSubsidyType(item?.uuid as string || '')}
                                                        >
                                                            Delete
                                                        </button>
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <ToggleSwitch status={true} index={index} HandleToggleStatus={HandleToggleActiveMenu} uuid={''} />
                                                </td>
                                            </tr>
                                        )) : <tr></tr>} */}
                                </tbody>

                            </table>
                            <nav className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4" aria-label="Table navigation">
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
                                    Showing <span className="font-semibold text-gray-900 dark:text-white">{currentPage * 10 - 9}-{Math.min(currentPage * 10, totalItems)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
                                </span>
                                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                                    <li>
                                        <a
                                            onClick={() => handlePageChange(currentPage - 1 <= 0 ? 1 : currentPage - 1)}
                                            className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                        >Previous
                                        </a>
                                    </li>
                                    {/* Render pagination buttons based on totalItems and currentPage */}
                                    {Array.from({ length: Math.ceil(totalItems / 10) }, (_, index) => (
                                        <li key={index}>
                                            <a className={`flex items-center justify-center px-3 h-8 leading-tight ${currentPage === index + 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-500 bg-white'} border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`} onClick={() => handlePageChange(index + 1)}>
                                                {index + 1}
                                            </a>
                                        </li>
                                    ))}
                                    <li>
                                        <a
                                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                                            onClick={() => handlePageChange(currentPage + 1)}

                                        >Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                    </div>
                </div>
                <div>
                    {openModalAddMenu && <ModalAddMenu />}
                </div>
                <div>
                    {openModalAddMenuCategory && <ModalAddMenuCategory />}
                </div>
            </div>


        </>
    );
};

export default MenuManagement;
