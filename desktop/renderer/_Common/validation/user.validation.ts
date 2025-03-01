import * as yup from "yup";
import {
  UserPaginationRequest,
  ScanCheckEmployeeID,
  CreateUpdateUser,
} from "../interface/user.interface";
import { UpdateStatusRequest } from "../interface/general.interface";

const PaginationEmployeeValidation = yup.object().shape({
  page: yup.string().required("Page Required"),
  filter: yup.string().optional(),
});

const ScanCheckEmployeeIDValidation = yup.object().shape({
  employeeID: yup.string().required("Employee ID Required"),
});

const CreateUpdateEmployeeValidationSchema = yup.object().shape({
  name: yup.string().required("Name Required"),
  employee_id: yup.string().required("Employee ID Required"),
  submit_method: yup.string().required("Submit Method Required"),
  department_name: yup.string().required("Department Name Required"),
  department_code: yup.string().required("Department Code Required"),
  employee_category_code: yup.string().required("Employee Category Required"),
  cost_center_code: yup.string().required("Cost Center Code Required"),
  email: yup.string().email("Email Format Must Be Correct").optional(),
  password: yup
    .string()
    .optional()
    // .test(
    //   "password-strength",
    //   "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
    //   (value) => {
    //     if (!value) return true; // If the value is empty, skip validation
    //     return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    //       value
    //     );
    //   }
    // ),
    ,
  confirmPassword: yup
    .string()
    .optional()
    .oneOf([yup.ref("password")], "Passwords must match"),
  access_card_no: yup.string().optional(),
  subsidy_meal_applicable: yup
    .string()
    .required("Subsidy Meal Applicable is required")
    .oneOf(["yes", "no"], "Subsidy Meal Applicable must be 'yes' or 'no'"),
});

const UpdateEmployeeStatusValidationSchema = yup.object().shape({
  active_status: yup.boolean().required("Active Statue Required"),
  uuid: yup.string().required("Employee UUID Required"),

});

export function UserPaginationValidation(data: UserPaginationRequest) {
  return PaginationEmployeeValidation.validate(data);
}

export function ScanEmployeeIDValidation(data: ScanCheckEmployeeID) {
  return ScanCheckEmployeeIDValidation.validate(data);
}

export function CreateUpdateEmployeeValidation(data: CreateUpdateUser) {
  return CreateUpdateEmployeeValidationSchema.validate(data);
}

export function UpdateEmployeeStatusValidation(data: UpdateStatusRequest) {
  return UpdateEmployeeStatusValidationSchema.validate(data);
}

