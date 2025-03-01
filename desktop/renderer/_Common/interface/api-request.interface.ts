import { Content_Type } from "../enum/content-type.enum";
import { StatusAPICode } from "../enum/status-api-code.enum";

export interface APIClientRequest {
    urlPath: string;
    data: any;
    code: StatusAPICode,
    Content_Type: Content_Type,
}