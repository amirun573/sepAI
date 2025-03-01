import Cors from "cors";
import { GetBodyData } from "../../../_Common/function/Authentication";
import { JWTDecodeInterface, SignInRequest } from "../../../_Common/interface/auth.interface";
import { StatusAPICode } from "../../../_Common/enum/status-api-code.enum";
import { NextResponse } from "next/server";
import { User } from "@prisma/client";
import { SignInService } from "../auth/service/auth.service";
import { JWTDecode } from "../auth/service/auth.service";

// Initialize CORS middleware
const cors = Cors({
  origin: "*", // Allow all origins, you can change this to a specific origin in production
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
});

const APIAuth: StatusAPICode[] = [];

// Helper to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export async function GET(req, res) {
  try {
    res.status(200).json({ message: "GET request received" });
  } catch (error) {
    res.status(500).json({ message: JSON.stringify(error) });
  }
}

export async function POST(req: any, res: any) {
  try {
    let body: any = await GetBodyData(req);

    if (!body) {
      throw Error("Body Not Found");
    }

    const { code } = body;

    if (!code || typeof parseInt(code) !== "number") {
      throw Error("Code Not Found");
    }

    const token: JWTDecodeInterface | boolean = await JWTDecode(req);
    let user: User | null = null;

    if (APIAuth.find((item) => item === parseInt(code))) {
      if (!token) {
        throw Error("No Token Found");
      }
      user = (token as JWTDecodeInterface).user;
    }

    if (code && typeof parseInt(code) === "number") {
      switch (parseInt(code) as StatusAPICode) {
        case StatusAPICode.sign_in_request: {
          const data: SignInRequest = body as SignInRequest;

          if (!data) {
            throw Error("No Data Detected");
          }

          return SignInService(data);
          //return WriteAddToCart(data, user);
        }

        default: {
          throw Error("No Code Found");
        }
      }
    }
  } catch (error: any) {
    // logger.error("Failed at Route POST Auth ===>", { error });

    console.error(error);
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }
}

// Default export to handle any other methods
export default async function handler(req, res) {
  try {
    switch (req.method) {
      case "GET":
        return GET(req, res);
      case "POST":
        return POST(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(500).end(`Error: ${JSON.stringify(error)}`);
  }
}

