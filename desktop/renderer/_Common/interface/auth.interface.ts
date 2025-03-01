import { RoleList } from "../enum/role.enum";
import { Feature, User, UserFeatures } from "@prisma/client";

export interface UserDetailsLocalStorage {
  email: string;
  employee_id: string;
  accessToken: string;
  refreshToken: string;
  role_id: RoleList;
  uuid: string;
  country_code: string;
  is_acc_verify: boolean;
  // profile_image: string;
  currency_code: string;
  features: Partial<Feature>[]
}

export interface JWTDecodeInterface {
  email: string;
  iat: number;
  exp: number;
  user: User;
}

export interface SignInRequest {
  email: string;
  password: string;
}


