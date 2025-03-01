import * as yup from "yup";
import { SignInRequest } from "../interface/auth.interface";

const SignInValidation = yup.object().shape({
  email: yup
    .string()
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    // .min(8, "Password must be at least 8 characters"),
});

export function SignInFunctionValidation(data: SignInRequest) {
  return SignInValidation.validate(data);
}
