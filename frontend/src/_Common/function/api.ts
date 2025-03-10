"use client";
import axios from "axios";
import { APICode } from "../enum/api-code.enum";
import { APIInterface, APIResponse } from "../interface/api.interface";

const API = async (object: APIInterface): Promise<APIResponse> => {
  let response: APIResponse = {
    success: false,
    status: 500,
    message: "Internal Server Error",
    data: {},
  };
  try {
    const { url, data, API_Code } = object;

    const baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || `http://127.0.0.1:8000/api/v1/`;

    const fullURL = `${baseURL}${url}`;

    switch (API_Code) {
      case APICode.spec_device: {
        const spec_device = await axios.get(fullURL);

        if (!spec_device) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          success: true,
          status: spec_device.status,
          data: spec_device.data,
        };

        break;
      }

      case APICode.download_model: {
        const downloadModel = await axios.post(fullURL, data);

        if (!downloadModel) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          success: true,
          status: downloadModel.status,
          data: downloadModel.data,
        };

        break;
      }

      case APICode.model_size: {
        const modelSize = await axios.get(fullURL, data);

        if (!modelSize) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          success: true,
          status: modelSize.status,
          data: modelSize.data,
        };

        break;
      }

      case APICode.setting: {
        const setting = await axios.get(fullURL);

        if (!setting) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          success: true,
          status: setting.status,
          data: setting.data,
        };

        break;
      }

      case APICode.update_model_path_setting: {
        const modelPathSetting = await axios.patch(fullURL, data);

        if (!modelPathSetting) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          success: true,
          status: modelPathSetting.status,
          data: modelPathSetting.data,
        };

        break;
      }

      case APICode.update_cahce_model_path_setting: {
        const cacheModelPathSetting = await axios.patch(fullURL, data);

        if (!cacheModelPathSetting) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          success: true,
          status: cacheModelPathSetting.status,
          data: cacheModelPathSetting.data,
        };

        break;
      }

      case APICode.update_model_notification_setting: {
        const notificationSetting = await axios.patch(fullURL, data);

        if (!notificationSetting) {
          throw new Error("Not Getting Any Data");
        }

        response = {
          success: true,
          status: notificationSetting.status,
          data: notificationSetting.data,
        };

        break;
      }

      case APICode.model_lists: {
        const modelLists = await axios.get(fullURL);

        if (!modelLists) {
          throw new Error("Not Getting Any Models");
        }

        response = {
          success: true,
          status: modelLists.status,
          data: modelLists.data,
        };

        break;
      }

      case APICode.prompt: {
        const modelLists = await axios.post(fullURL, data);

        if (!modelLists) {
          throw new Error("Not Getting Any Models");
        }

        console.log("Data", modelLists.data);
        response = {
          success: true,
          status: modelLists.status,
          data: modelLists.data,
        };

        break;
      }

      case APICode.chat_history: {
        const chatHistory = await axios.get(fullURL);

        if (!chatHistory) {
          throw new Error("Not Getting Any Models");
        }

        response = {
          success: true,
          status: chatHistory.status,
          data: chatHistory.data,
        };

        break;
      }

      case APICode.load_model: {
        const loadModel = await axios.get(fullURL);

        if (!loadModel) {
          throw new Error("Failed To Load Model");
        }

        response = {
          success: true,
          status: loadModel.status,
          data: loadModel.data,
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
