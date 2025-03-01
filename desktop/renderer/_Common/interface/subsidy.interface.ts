import { StatusAPICode } from "../enum/status-api-code.enum";

export interface SubsidyEmployeeUpdate {
  uuid: string;
  applicable: boolean;
  [StatusAPICode.code]: StatusAPICode;
  subsidy_uuid: string;
}

export interface SubsidySubmitPrice {
  totalPrice: number;
  price: number;
  availableCredit: number;
  discount: number;
  employee_id: string;
  [StatusAPICode.code]: StatusAPICode;
  subsidyCreditUUID: string;
}

export interface SubsidyTransactionPaginationRequest {
  page: number;
  filter: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface SubsidyTransactionDownloadReportRequest {
  startDate: string;
  endDate: string;
  employees_id?: string[];
}

export interface DownloadReportSubsidyTransactionResult {
  name: string;
  cost_center_code: string;
  credit_used: number;
  department_name: string;
  employee_category_name: string;
  employee_id: string;
  transaction_at: Date;
}

export interface SubsidyTypePaginationRequest {
  page: number;
  filter: string | null;
}

export interface UpdateSubsidyCreditRequest {
  code: StatusAPICode,
  user_uuid: string;
  subsidy_uuid: string;
  amount: number;
}
