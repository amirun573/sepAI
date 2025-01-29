"use client";
import axios from "axios";
import { APICode } from "../enum/api-code.enum";
import { APIInterface, APIResponse } from "../interface/api.interface";

const API = async (object: APIInterface): Promise<APIResponse> => {
  let response: APIResponse = {
    status: 500,
    message: "Internal Server Error",
    data: {},
  };
  try {
    const { url, data, API_Code } = object;

    const baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || `http://127.0.0.1:8000/api/v1/`;

    switch (API_Code) {
      case APICode.spec_device: {
        const spec_device = await axios.get(`${baseURL}${url}`);

        if (!spec_device) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          status: spec_device.status,
          data: spec_device.data,
        };

        break;
      }

      default: {
        throw new Error("API Code not found");
      }
    }
  } catch (error: any) {
    response.status = error?.response?.status || 500;
    response.message = error?.message || "Internal Server Error";
  }

  return response;
};

export default API;
