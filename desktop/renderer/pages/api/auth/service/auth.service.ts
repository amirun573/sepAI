import {
  JWTDecodeInterface,
  SignInRequest,
  UserDetailsLocalStorage,
} from "../../../../_Common/interface/auth.interface";
import jwt from "jsonwebtoken";
import { GetUserFeatures, GetUserSingle } from "../../user/model/user.modal";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { SignInFunctionValidation } from "../../../../_Common/validation/auth.validation";
import { User, UserFeatures, Feature } from "@prisma/client";

export async function JWTDecode(
  req: any
): Promise<JWTDecodeInterface | boolean> {
  try {
    // Decode the JWT token
    //const decodedToken: JwtPayload = jwtDecode(accessToken);

    // Log the decoded token
    //console.log(decodedToken);
    const token = req.headers["authorization"] || req;


    if (token) {
      try {
        const accessToken = token.replace("Bearer ", "");

        if (accessToken) {
          const decodedToken: any = jwt.verify(
            accessToken,
            process.env.JWT_SECRET_KEY || "",
            { ignoreExpiration: false }
          );

          // Perform additional validation if needed
          if (decodedToken && decodedToken?.exp) {
            // Token is valid

            let where: any = {};
            if (decodedToken.email) {
              where = {
                email: decodedToken.email,
              };
            } else if (decodedToken.employee_id) {
              where = {
                employee_id: decodedToken.employee_id,
              };
            } else {
              throw Error("No Value To Authenticate");
            }

            const user = await GetUserSingle({
              where,
              select: {
                employee_id: true,
                user_id: true,
                email: true,
                active: true,
                uuid: true,
                UserDetails: {
                  select: {
                    name: true,
                    mobile_phone: true,
                    country: {
                      select: {
                        country_id: true,
                        country_name: true,
                        currency_code: true,
                      },
                    },
                  },
                },
                role: {
                  select: {
                    role_id: true,
                    role_code: true,
                    active: true,
                  },
                },
                user_features: {
                  select: {
                    is_read: true,
                    is_write: true,
                    feature: {
                      select: {
                        feature_code: true,
                        active: true,
                      },
                    },
                  },
                },
              },
            });

            if (!user || !user.active) {
              return false;
            }

            decodedToken.user = user;
            return decodedToken as JWTDecodeInterface;
          } else {
            // Token is invalid

            return false;
          }
        } else return false;
      } catch (error) {
        // Token verification failed
        console.error("Token verification failed==>", error);

        return false;
      }
    } else {
      // No session or token found
      console.error("No session or token found");

      return false;
    }
  } catch (error) {
    // logger.error("Failed at JWTDecode function ===>", { error });

    console.log("Error==>", error);
    return false;
  }
}

export async function comparePassword(
  password: string,
  hashedPassword: string
) {
  try {
    const match = await compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function SignInService(data: SignInRequest) {
  let message: string = "";
  let status: number = 500;
  try {
    const { email, password } = data;

    await SignInFunctionValidation(data);

    const user = await GetUserSingle({
      where: {
        OR: [
          { email: email }, // Email condition
          { employee_id: email }, // Employee ID condition
        ],
      },
      select: {
        user_id: true,
        email: true,
        employee_id: true,
        role_id: true,
        uuid: true,
        password_hash: true,
        is_acc_verify: true,
        UserDetails: {
          select: {
            country: {
              select: {
                country_code: true,
                currency_code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      status = 400;
      throw Error("No Email Been Found.");
    }

    if (
      !user?.role_id ||
      !user?.uuid ||
      !user?.is_acc_verify ||
      !user?.employee_id
    ) {
      status = 400;
      throw Error("User is missing");
    }

    if (user.password_hash) {
      const checkPassword = await comparePassword(password, user.password_hash);
      if (!checkPassword) {
        status = 400;
        throw Error("Wrong Password");
      }
    } else {
      status = 400;
      throw Error("You are not Eligble to Login");
    }

    //console.log("checkPassword===>", checkPassword);

    const UserFeatures: Partial<UserFeatures>[] = await GetUserFeatures({
      where: {
        user_id: user.user_id,
        active: true,
      },
      select: {
        feature: {
          select: {
            uuid: true,
            feature_code: true,
            feature_name: true,
            description: true,
            feature_link: true,
          },
        },
      },
    });

    const features: Partial<Feature>[] = [];

    if (UserFeatures.length > 0) {
      UserFeatures.map((userFeatures) => {
        const feature: Partial<Feature> = (userFeatures as any)
          ?.feature as Partial<Feature>;

        if (feature) {
          features.push(feature);
        }
      });
    }

    const options = { expiresIn: "10h" }; // Token expiration time

    const accessToken = jwt.sign(
      user,
      process.env.JWT_SECRET_KEY || "",
      options
    );

    const refreshToken = jwt.sign(user, process.env.JWT_SECRET_KEY || "");

    const userDetails: UserDetailsLocalStorage = {
      email: user.email || "",
      employee_id: user.employee_id, // Assuming this is a typo and it should be `username`
      accessToken,
      refreshToken,
      role_id: user.role_id,
      uuid: user.uuid,
      features,
      country_code: (user as any)?.UserDetails?.country?.country_code || "", // Provide default value to avoid `undefined`
      is_acc_verify: user.is_acc_verify,
      currency_code: (user as any)?.UserDetails?.country?.currency_code || "", // Provide default value to avoid `undefined`
    };

    console.log("userDetails===>", userDetails);

    return userDetails;
  } catch (error: any) {
    // logger.error("Failed at SignInService function ===>", { error });

    console.error(error);
    return NextResponse.json(
      {
        message: error.message || message,
      },
      {
        status: error.statusCode || status,
      }
    );
  }
}
