import { AccessCard, Subsidy, User, UserDetails } from "@prisma/client";
import { StatusAPICode } from "../enum/status-api-code.enum";

export interface UserPaginationRequest {
  page: number;
  filter: string | null;
}

export interface ScanCheckEmployeeID {
  employeeID: string | null;
}

export interface CreateUpdateUser {
  user_uuid?: string;
  name: string;
  employee_id: string;
  submit_method: "post" | "put";
  department_name: string;
  department_code: string;

  code: StatusAPICode;
  email: string;

  password?: string;
  confirmPassword?: string;

  employee_category_name: string;
  employee_category_code: string;

  cost_center_code: string;
  access_card_no: string;

  subsidy_meal_applicable: string;

  start_date?: string;
  end_date?: string;
}

export interface CreateUserUploadExcel {
  code: StatusAPICode;
  file: File;
}

export interface CreateUserUserDetails {
  user: User;
  userDetails: UserDetails;
  subsidy?: Subsidy;
  accessCard?: AccessCard;
}


