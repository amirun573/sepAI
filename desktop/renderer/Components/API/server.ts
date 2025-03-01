import Cors from "cors";

// Initialize CORS middleware
export const cors = Cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
});

// Helper to run middleware

export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export const BaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

import { NextApiRequest, NextApiResponse } from "next";
import { ParentResponse } from "../../_Common/interface/api-response.interface";
import { User } from "@prisma/client";
import {
  APIAuthValidation,
  GetBodyData,
} from "../../_Common/function/Authentication";
import { JWTDecode } from "../../pages/api/auth/service/auth.service";
import { JWTDecodeInterface } from "../../_Common/interface/auth.interface";

export async function GetHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  handlerFunction: (args: {
    code: number;
    userAuth: User | null;
    url: URL;
  }) => Promise<ParentResponse>
) {
  let statusCode = 500;

  try {
    const url = new URL(req.url || "", "http://localhost"); // Base URL for relative URLs
    const codeStr = url.searchParams.get("code");
    if (!codeStr) throw new Error("No Code Provided");

    const code = parseInt(codeStr);

    let userAuth = null;
    if (APIAuthValidation(code)) {
      const authorization = await JWTDecode(req);
      if (!authorization) {
        statusCode = 401;
        throw new Error("No Authorization Value");
      }

      const { user } = authorization as JWTDecodeInterface;
      if (!user) throw new Error("No User Details");

      userAuth = user;
    }

    // Call the custom handler function
    const response = await handlerFunction({ code, userAuth, url });
    res.status(response.status || 200).json({ ...response });
  } catch (error: any) {
    console.error(error);
    res
      .status(error?.statusCode || statusCode)
      .json({ message: error.message || JSON.stringify(error) });
  }
}

export async function PostHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  handlerFunction: (args: {
    code: number;
    userAuth: User | null;
    body: any;
  }) => Promise<ParentResponse>
) {
  let statusCode = 500;

  try {
    const body = await GetBodyData(req);
    if (!body) throw new Error("Body Not Found");

    const { code } = body;
    if (!code || typeof parseInt(code) !== "number")
      throw new Error("Code Not Found");

    let userAuth: User | null = null;

    if (APIAuthValidation(parseInt(code))) {
      const authorization = await JWTDecode(req);
      if (!authorization) {
        statusCode = 401;
        throw new Error("No Authorization Value");
      }

      const { user } = authorization as JWTDecodeInterface;
      if (!user) throw new Error("No User Details");

      userAuth = user;
    }

    // Call the custom handler function to process the specific logic
    const response = await handlerFunction({
      code: parseInt(code),
      userAuth,
      body,
    });
    res.status(response.status || 200).json({ ...response });
  } catch (error: any) {
    console.error(error);
    res
      .status(error?.statusCode || statusCode)
      .json({ message: error.message || JSON.stringify(error) });
  }
}
