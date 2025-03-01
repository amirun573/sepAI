"use client";
import axios from "axios";
import { StatusAPICode } from "../../_Common/enum/status-api-code.enum";
import { APIClientRequest } from "../../_Common/interface/api-request.interface";
import { SignInFunctionValidation } from "../../_Common/validation/auth.validation";
import { headers } from "next/headers";
import { Content_Type } from "../../_Common/enum/content-type.enum";
import { UserDetailsLocalStorage } from "../../_Common/interface/auth.interface";
import {
  GetLocalStorageDetails,
  HandleUnAuthorized,
} from "../../_Common/function/LocalStorage";
import { APIAuthValidation } from "../../_Common/function/Authentication";
import { SubsidyTransactionPagination } from "../../_Common/validation/subsidy.validation";
import { BaseUrl } from "./server";
import {
  MenuCategoryWrite,
  MenuWrite,
} from "../../_Common/validation/menu.validation";
import { DisplayAlert } from "../../_Common/function/Error";

export const ClientRequest = async (body: APIClientRequest) => {
  try {
    const { data, urlPath, code, Content_Type } = body;

    let response: any = null;

    if (!urlPath || !data || !code) {
      throw Error("Parameter need to be fullfil");
    }

    const fullUrl = `${BaseUrl}/api/${urlPath}`; // Ensure only one slash is added here

    let UserDetailsLocalStorage: any = null;

    const checkAPIAuth: boolean = APIAuthValidation(code);

    if (checkAPIAuth) {
      UserDetailsLocalStorage = await LocalStorageUserDetails();

      if (!UserDetailsLocalStorage) {
        throw Error("No User Details Found");
      }
    }

    switch (code) {
      case StatusAPICode.sign_in_request: {
        const { email, password } = data;
        await SignInFunctionValidation({ email, password });

        response = await axios.post(
          `${fullUrl}`,
          {
            email,
            password,
            code,
          },
          {
            headers: {
              "Content-Type": Content_Type,
            },
          }
        );

        break;
      }

      case StatusAPICode.GET_MENU_LISTS_PAGINATION: {
        const { currentPage, filter, startDate, endDate } = data;

        await SubsidyTransactionPagination({
          page: currentPage,
          filter,
          startDate,
          endDate,
        });
        response = await axios.get(fullUrl, {
          headers: {
            Authorization: `Bearer ${UserDetailsLocalStorage?.accessToken}`,
            "Content-Type": Content_Type,
          },
        });

        break;
      }

      case StatusAPICode.CREATE_MENU_CATEGORY: {
        const { menu_name_category, uuid } = data;

        await MenuCategoryWrite({
          menu_name_category,
          uuid,
        });

        response = await axios.post(fullUrl, data, {
          headers: {
            Authorization: `Bearer ${UserDetailsLocalStorage?.accessToken}`,
            "Content-Type": Content_Type,
          },
        });

        break;
      }

      case StatusAPICode.GET_MENU_CATEGORY: {
        response = await axios.get(fullUrl, {
          headers: {
            Authorization: `Bearer ${UserDetailsLocalStorage?.accessToken}`,
            "Content-Type": Content_Type,
          },
        });

        break;
      }

      case StatusAPICode.CREATE_MENU: {
        const { menu_price, menu_name, image_path, menu_category_uuid } = data;

        await MenuWrite({
          menu_price,
          menu_name,
          image_path,
          menu_category_uuid,
        });

        const body = {
          menu_price,
          menu_name,
          image_path,
          menu_category_uuid,
          code,
        };
        response = await axios.post(fullUrl, body, {
          headers: {
            Authorization: `Bearer ${UserDetailsLocalStorage?.accessToken}`,
            "Content-Type": Content_Type,
          },
        });

        break;
      }

      default: {
        break;
      }
    }

    return response?.data;
  } catch (error) {
    console.error("Error:", error);
    DisplayAlert(error);
    return null;
  }
};

const LocalStorageUserDetails = async (): Promise<
  UserDetailsLocalStorage | boolean
> => {
  try {
    const userDetailsLocalStorage =
      (await GetLocalStorageDetails()) as UserDetailsLocalStorage;

    if (!userDetailsLocalStorage) {
      await HandleUnAuthorized(null);
    }

    return userDetailsLocalStorage;
  } catch (error) {
    console.error("Error===>", error);
    return false;
  }
};
