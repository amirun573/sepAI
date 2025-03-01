import * as yup from "yup";
import {
  SubsidyEmployeeUpdate,
  SubsidySubmitPrice,
  SubsidyTransactionPaginationRequest,
  SubsidyTransactionDownloadReportRequest,
  SubsidyTypePaginationRequest,
  UpdateSubsidyCreditRequest,
} from "../interface/subsidy.interface";
import { SubsidyType } from "@prisma/client";

const UserUpdateSubsidyValidation = yup.object().shape({
  uuid: yup.string().required("UUID Required"),
  applicable: yup.boolean().required("Applicable Required"),
  code: yup.number().required("Code Required"),
  subsidy_uuid: yup.string().required("Subsidy UUID Required"),
});

const SubsidySubmitPriceValidation = yup.object().shape({
  totalPrice: yup.number().required("Total Price Required"),
  price: yup.number().min(0.1).required("Price Required"),
  availableCredit: yup.number().min(0).required("Available Credit Required"),

  discount: yup.number().required("Discount Required"),
  code: yup.number().required("Code Required"),
  employee_id: yup.string().required("Employee ID Required"),
});

const SubsidyTransactionPaginationValidation = yup.object().shape({
  page: yup.number().required("Page Required"),
  filter: yup.string().optional(),
  startDate: yup.string().optional(),
  endDate: yup.string().optional(),
});

const SubsidyTransactionDownloadReportValidation = yup.object().shape({
  startDate: yup.string().required("Start Date Required"),
  endDate: yup.string().required("End Date Required"),
});

const SubsidyTypePaginationValidation = yup.object().shape({
  page: yup.number().required("Page Required"),
  filter: yup.string().optional(),
});

const UpdateSubsidyTypeSchema = yup.object().shape({
  uuid: yup.string().required("UUID Required"),
  price: yup.number().optional(),
  subsidy_type_code: yup.string().optional(),
  subsidy_type_name: yup.string().optional(),
});


const UpdateSubsidyCreditRealTimeSchema = yup.object().shape({
  user_uuid: yup.string().required("User UUID Required"),
  amount: yup.number().min(0).required("Amount Required"),
  subsidy_uuid: yup.string().required("Subsidy UUID Required"),
});

export function EmployeeUpdateSubsidyValidation(data: SubsidyEmployeeUpdate) {
  return UserUpdateSubsidyValidation.validate(data);
}

export function EmployeeSubmitPriceValidation(data: SubsidySubmitPrice) {
  return SubsidySubmitPriceValidation.validate(data);
}

export function SubsidyTransactionPagination(
  data: SubsidyTransactionPaginationRequest
) {
  return SubsidyTransactionPaginationValidation.validate(data);
}

export function SubsidyTransactionReportDownload(
  data: SubsidyTransactionDownloadReportRequest
) {
  return SubsidyTransactionDownloadReportValidation.validate(data);
}

export function SubsidyTypePagination(data: SubsidyTypePaginationRequest) {
  return SubsidyTypePaginationValidation.validate(data);
}

export function UpdateSubsidyTypeValidation(data: Partial<SubsidyType>) {
  return UpdateSubsidyTypeSchema.validate(data);
}

export function UpdateSubsidyCreditRealTimeValidation(data: UpdateSubsidyCreditRequest) {
  return UpdateSubsidyCreditRealTimeSchema.validate(data);
}
