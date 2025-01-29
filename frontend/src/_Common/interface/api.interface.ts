import { APICode } from "../enum/api-code.enum";

export interface APIInterface {
    url: string;
    data?: any;
    API_Code: APICode;
  }