import * as yup from "yup";

const PasswordHashingValidation = yup.object().shape({
  password: yup.string().required("Password Required"),
});

export function PasswordPassValidation(data: { password: string }) {
  return PasswordHashingValidation.validate(data);
}
