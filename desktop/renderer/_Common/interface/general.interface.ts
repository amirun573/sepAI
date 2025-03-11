import { StatusAPICode } from "../enum/status-api-code.enum";

export interface UpdateStatusRequest {
    active_status: boolean;
    uuid: string;
    code: StatusAPICode;
  
  }