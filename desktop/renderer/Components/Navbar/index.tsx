'use client';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { RoleList } from '../../_Common/enum/role.enum';
import { UserDetailsLocalStorage } from '../../_Common/interface/auth.interface';
import { GetRoleFromId } from '../../_Common/function/Role';
import { DisplayAlert } from '../../_Common/function/Error';
import {
  HandleUnAuthorized,
  GetLocalStorageDetails,
} from '../../_Common/function/LocalStorage';
import Image from 'next/image';
import { ConnectivityDetectorIndicator, GetLocalIPs } from '../Connectivity';
import RouteHistoryManager from '../Navigation';
// Define an interface for your props
interface NavbarProps {
  role: RoleList; // Use the appropriate type for the role
}

interface NavBarInterface {
  id: string;
  name: string;
  link: string;
  description: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const [userDetails, setUserDetails] = useState<UserDetailsLocalStorage>();
  const [role, setRole] = useState<RoleList>(RoleList.EMPLOYEE);

  const [menuList, setMenuList] = useState<NavBarInterface[]>([
    {
      id: 'home',
      name: 'Home',
      link: '/home',
      description: 'Main Page.',
    },
  ]);

  const [isOnline, setIsOnline] = useState<boolean>(true); // Initialize the online status

  const HandleLogOut = async () => {
    HandleUnAuthorized('');
  };

  const [showLogout, setShowLogout] = useState(false);

  const handleIconClick = () => {
    setShowLogout((prev) => !prev);
  };

  useEffect(() => {
    const GetUserDetailsLocalStorage = async (): Promise<UserDetailsLocalStorage | boolean> => {
      try {
        return await GetLocalStorageDetails(); // Assuming this returns a Promise
      } catch (error) {
        console.error(error);
        HandleUnAuthorized(error);
        return false;
      }
    };

    const fetchUserDetails = async () => {
      if (typeof window !== 'undefined') {
        try {
          const details = await GetUserDetailsLocalStorage();

          if (!details || typeof details === 'boolean') {
            return;
          }

          // Now it's safe to destructure since 'details' is guaranteed to be UserDetailsLocalStorage
          const {
            email,
            employee_id,
            accessToken,
            refreshToken,
            role_id,
            uuid,
            country_code,
            is_acc_verify,
            currency_code,
            features,
          }: UserDetailsLocalStorage = details;

          const role = GetRoleFromId(role_id); // This will return RoleList.SUPER_ADMIN, etc.

          if (!role) {
            throw Error("No Role Detected");
          }

          setUserDetails({
            email, employee_id, accessToken, role_id, uuid, country_code, is_acc_verify, currency_code, refreshToken, features
          });

          setRole(role);

          const menuArray: NavBarInterface[] = [];

          // Iterate over the features array
          features.forEach((feature) => {
            if (feature?.feature_name && feature?.feature_link && feature?.feature_code && feature?.description) {
              const menu: NavBarInterface = {
                id: feature?.feature_code,
                name: feature?.feature_name,
                link: feature?.feature_link,
                description: feature?.description,
              };

              // Add to menuArray only if it doesn't exist in the current menuList
              menuArray.push(menu);
            }
          });

          // Update the state while ensuring no duplicates are added
          setMenuList((prevMenuList) => {
            // Create a new list by merging the existing menuList and menuArray, removing duplicates
            const mergedMenu = [
              ...prevMenuList,
              ...menuArray.filter(
                (newMenu) => !prevMenuList.some((existingMenu) => existingMenu.id === newMenu.id)
              ),
            ];

            // Return the updated menu list
            return mergedMenu;
          });

        } catch (error) {
          console.error(error);
          DisplayAlert(error);
        }
      }
    };

    // Immediately invoke the fetchUserDetails function
    fetchUserDetails();

  }, []); // Empty dependency array ensures it runs only once



  return (
    <Fragment>
      <nav className="bg-white border-gray-200 dark:bg-gray-900 fixed top-0 left-0 right-0 z-50 shadow text-black">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <RouteHistoryManager />

          {/* <a
            href="/"
            className="flex items-center gap-x-0 rtl:space-x-reverse justify-start"
          >
   
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-black">
              Suasanax P.O.S
            </span>
          </a> */}

          <button
            onClick={toggleNavbar}
            type="button"
            className="inline-flex items-center p-1 w-8 h-8 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-expanded={isOpen ? 'true' : 'false'}
            aria-controls="navbar-default"
          >
            {/* <span className="sr-only">Open main menu</span> */}
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>

          <div
            className={`w-full md:flex md:items-center md:w-auto ${isOpen ? 'block' : 'hidden'
              }`}
            id="navbar-default"
          >
            <ul className="font-medium flex flex-col p-4 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 border-t border-gray-100 md:border-0 bg-gray-50 md:bg-transparent dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              {menuList.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.link}
                    className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <div>
                {!userDetails ? (
                  <a
                    href="/login"
                    // onClick={handleSignIn}
                    style={{
                      padding: '10px 20px',
                      fontSize: '16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Sign In
                  </a>
                ) : (
                  <ul
                    style={{
                      listStyleType: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <li>
                      <button
                        onClick={handleIconClick} // Toggle Logout button visibility
                        style={{
                          display: 'flex',
                          flexDirection: 'column', // Stack items vertically
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '60px', // Icon button size
                          height: '60px',
                          padding: '0',
                          color: 'white',
                          backgroundColor: '#C9BDBD',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          position: 'relative', // Needed for positioning the indicator
                        }}
                      >
                        <Image
                          src={'/icon/icon.svg'}
                          width="40"
                          height="40"
                          alt="User Avatar"
                          style={{
                            borderRadius: '50%', // Keeps the image circular within the button
                            objectFit: 'cover', // Ensures the SVG scales proportionally
                          }}
                        />

                        {/* Position the ConnectivityDetectorIndicator below and on the right */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '5px', // Position it at the bottom of the button
                            right: '5px', // Align it to the right side
                          }}
                        >
                          <ConnectivityDetectorIndicator
                            onStatusChange={setIsOnline}
                          />
                        </div>
                      </button>
                    </li>

                    {showLogout && ( // Conditionally render the Logout button
                      <li>
                        <button
                          onClick={HandleLogOut}
                          style={{
                            padding: '5px 10px', // Small padding
                            fontSize: '12px', // Smaller font size
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px', // Spacing below icon button
                          }}
                        >
                          Logout
                        </button>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </ul>
            <div className="flex items-center space-x-4 mt-4"></div>
          </div>
        </div>
      </nav>
    </Fragment>
  );
};

export default Navbar;
