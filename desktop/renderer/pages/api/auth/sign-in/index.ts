import { GetBodyData } from "../../../../_Common/function/Authentication";
import {
  JWTDecodeInterface,
  SignInRequest,
} from "../../../../_Common/interface/auth.interface";
import { StatusAPICode } from "../../../../_Common/enum/status-api-code.enum";
import { User } from "@prisma/client";
import { SignInService } from "../service/auth.service";
import { JWTDecode } from "../service/auth.service";
import { cors, runMiddleware } from "../../../../Components/API/server";



const APIAuth: StatusAPICode[] = [];




// GET Handler
export async function GET(req, res) {
  try {
    res.status(200).json({ message: "GET request received" });
  } catch (error) {
    res.status(500).json({ message: JSON.stringify(error) });
  }
}

// POST Handler
export async function POST(req, res) {
  try {
    let body = await GetBodyData(req);

    if (!body) {
      throw new Error("Body Not Found");
    }

    const { code } = body;

    if (!code || typeof parseInt(code) !== "number") {
      throw new Error("Code Not Found");
    }

    const token = await JWTDecode(req);
    let user = null;

    if (APIAuth.find((item) => item === parseInt(code))) {
      if (!token) {
        throw new Error("No Token Found");
      }
      user = (token as JWTDecodeInterface).user;
    }

    if (code && typeof parseInt(code) === "number") {
      switch (parseInt(code) as StatusAPICode) {
        case StatusAPICode.sign_in_request: {
          const data = body as SignInRequest;

          if (!data) {
            throw new Error("No Data Detected");
          }

          const userDetails = await SignInService(data);

          res.status(200).json({ userDetails });
          break;
        }
        default: {
          throw new Error("No Code Found");
        }
      }
    }
  } catch (error) {
    console.error("Failed at Route POST Auth ===>", error);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
}

// Default export to handle any other methods
export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, cors); // Run the CORS middleware before handling
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
    res.status(500).json({ message: error.message });
  }
}
