"use client";
import axios from "axios";
import { APICode } from "../enum/api-code.enum";
import { APIInterface } from "../interface/api.interface";



const API = async (object: APIInterface) => {
  const { url, data, API_Code } = object;

  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || `http://127.0.0.1:8000/api/v1/`;

  switch(API_Code) {
    case APICode.spec_device: {
        try {
            const response = await axios.get(`${baseURL}${url}`);
            return response.data;
          } catch (error) {
            console.error(error);
          }

          break;
        
    }

    default: {
    
        throw new Error("API Code not found");
    }
    
  }
  try {
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default API;
