import { NextResponse } from "next/server";
import {
  SignInRequest,
  UserDetailsLocalStorage,
} from "../../../../_Common/interface/auth.interface";
import { SignInFunctionValidation } from "../../../../_Common/validation/auth.validation";
import jwt from "jsonwebtoken";
import { GetUserFeatures, GetUserSingle } from "../model/user.modal";
import { comparePassword } from "../../auth/service/auth.service";
