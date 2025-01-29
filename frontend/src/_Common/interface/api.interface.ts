import { APICode } from "../enum/api-code.enum";

export interface APIInterface {
    url: string;
    data?: any;
    API_Code: APICode;
  }

  export interface APIResponse {
    status: number;
    message?: string;
    data?: any;
  }
