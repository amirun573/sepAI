import { GetBodyData } from "../../../_Common/function/Authentication";
import { JWTDecodeInterface } from "../../../_Common/interface/auth.interface";
import { StatusAPICode } from "../../../_Common/enum/status-api-code.enum";
import { JWTDecode } from "../auth/service/auth.service";
import {
  BaseUrl,
  GetHandler,
  cors,
  runMiddleware,
  PostHandler,
} from "../../../Components/API/server";
import { APIAuthValidation } from "../../../_Common/function/Authentication";
import { User, UserFeatures } from "@prisma/client";
import { ActionEnableFeature } from "../../../_Common/enum/features.enum";
import { CheckFeatureAllowed } from "../../../_Common/function/Feature";
import { FeaturesCodeLists } from "../../../_Common/enum/features.enum";
import {
  CreateMenuCategoryService,
  CreateMenuService,
  MenuCategoryListsService,
  MenuListsService,
} from "./service/menu.service";
import {
  MenuListsResponse,
  ParentResponse,
} from "../../../_Common/interface/api-response.interface";
import { data } from "autoprefixer";
import { WriteMenu } from '../../../_Common/interface/menu.interface';

const feature_code_menu: FeaturesCodeLists = FeaturesCodeLists.menu;

// GET Handler
export async function GET(req, res) {
  return GetHandler(req, res, HandleRequestGet);

  let statusCode: number = 500;

  try {
    const url = new URL(req.url, BaseUrl); // Pass base URL as the second argument

    const code: string | null = url.searchParams.get("code");

    let userAuth: User = null;

    if (!code) {
      throw Error("No Code");
    }

    const AuthAPI: boolean = APIAuthValidation(parseInt(code) as StatusAPICode);

    if (AuthAPI) {
      const authorization: JWTDecodeInterface | boolean = await JWTDecode(req);

      if (!authorization) {
        statusCode = 401;
        throw Error("No Authorization Value");
      }

      const { user } = authorization as JWTDecodeInterface;

      if (!user) {
        throw Error("No User Details");
      }

      userAuth = user;
    }

    let response: ParentResponse = {
      status: 500,
      message: "Invalid Request",
    };

    switch (parseInt(code) as StatusAPICode) {
      case StatusAPICode.GET_MENU_LISTS_PAGINATION: {
        const page: string | null = url.searchParams.get("page");

        const filter: string | null = url.searchParams.get("filter");

        if (!page) {
          statusCode = 400;
          throw Error("No Page Sent.");
        }

        const user_features: UserFeatures[] = (userAuth as any)
          ?.user_features as UserFeatures[];

        const checkFeature: boolean = await CheckFeatureAllowed({
          user_features,
          action: ActionEnableFeature.READ,
          feature_code: feature_code_menu,
        });

        if (!checkFeature) {
          statusCode = 400;
          throw Error(`Unaunthorized Action For ${userAuth.employee_id}`);
        }

        response = await MenuListsService({
          page: parseInt(page),
          filter,
        });

        break;
      }

      case StatusAPICode.GET_MENU_CATEGORY: {
        const user_features: UserFeatures[] = (userAuth as any)
          ?.user_features as UserFeatures[];

        const checkFeature: boolean = await CheckFeatureAllowed({
          user_features,
          action: ActionEnableFeature.READ,
          feature_code: feature_code_menu,
        });

        if (!checkFeature) {
          statusCode = 400;
          throw Error(`Unaunthorized Action For ${userAuth.employee_id}`);
        }

        response = await MenuCategoryListsService();
        break;
      }
      default: {
        response.status = 400;
        response.message = "Code Not Found";
        break;
      }
    }

    res.status(response.status || 200).json({ ...response });
  } catch (error: any) {
    // logger.error("Failed at Route GET User ===>", { error });

    console.error(error);
    return res
      .status(error?.statusCode || statusCode || 500)
      .json({ message: JSON.stringify(error) });

    //   return NextResponse.json(
    //     {
    //       message: error.message,
    //     },
    //     {
    //       status: statusCode,
    //     }
    //   );
  }
}

// POST Handler
export async function POST(req, res) {
  return PostHandler(req, res, HandlePostRequest);
  let statusCode: number = 500;

  try {
    let body = await GetBodyData(req);

    if (!body) {
      throw new Error("Body Not Found");
    }

    const { code } = body;

    if (!code || typeof parseInt(code) !== "number") {
      throw new Error("Code Not Found");
    }

    let userAuth: User = null;

    if (!code) {
      throw Error("No Code");
    }

    const AuthAPI: boolean = APIAuthValidation(parseInt(code) as StatusAPICode);

    if (AuthAPI) {
      const authorization: JWTDecodeInterface | boolean = await JWTDecode(req);

      if (!authorization) {
        throw Error("No Authorization Value");
      }

      const { user } = authorization as JWTDecodeInterface;

      if (!user) {
        throw Error("No User Details");
      }

      userAuth = user;
    }

    let response: ParentResponse = {
      status: 500,
      message: "Invalid Request",
    };

    // if (APIAuth.find((item) => item === parseInt(code))) {
    //   if (!token) {
    //     throw new Error("No Token Found");
    //   }
    //   user = (token as JWTDecodeInterface).user;
    // }

    if (code && typeof parseInt(code) === "number") {
      switch (parseInt(code) as StatusAPICode) {
        case StatusAPICode.CREATE_MENU_CATEGORY: {
          const { menu_name_category, uuid }: any = data;

          const user_features: UserFeatures[] = (userAuth as any)
            ?.user_features as UserFeatures[];

          const checkFeature: boolean = await CheckFeatureAllowed({
            user_features,
            action: ActionEnableFeature.WRITE,
            feature_code: feature_code_menu,
          });

          if (!checkFeature) {
            statusCode = 400;
            throw Error(`Unaunthorized Action For ${userAuth.employee_id}`);
          }

          response = await CreateMenuCategoryService({
            menu_name_category,
            uuid,
          });
        }
        default: {
          throw new Error("No Code Found");
        }
      }
    }
  } catch (error) {
    console.error("Failed at Route POST Auth ===>", error);
    res
      .status(error?.statusCode || statusCode || 500)
      .json({ message: JSON.stringify(error) });
  }
}

// Default export to handle any other methods
export default async function handler(req, res) {
  console.log("method==>", req.method);
  try {
    // await runMiddleware(req, res, cors); // Run the CORS middleware before handling
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

async function HandleRequestGet({
  code,
  userAuth,
  url,
}: {
  code: number;
  userAuth: User | null;
  url: URL;
}): Promise<ParentResponse> {
  let response: ParentResponse = { status: 500, message: "Invalid Request" };

  switch (code) {
    case StatusAPICode.GET_MENU_LISTS_PAGINATION: {
      const page = url.searchParams.get("page");
      const filter = url.searchParams.get("filter");

      if (!page) throw new Error("No Page Sent");

      const user_features = (userAuth as any)?.user_features as UserFeatures[];

      const checkFeature = await CheckFeatureAllowed({
        user_features,
        action: ActionEnableFeature.READ,
        feature_code: feature_code_menu,
      });

      if (!checkFeature)
        throw new Error(`Unauthorized Action For ${userAuth?.employee_id}`);

      response = await MenuListsService({ page: parseInt(page), filter });
      break;
    }

    case StatusAPICode.GET_MENU_CATEGORY: {
      const user_features = (userAuth as any)?.user_features as UserFeatures[];

      const checkFeature = await CheckFeatureAllowed({
        user_features,
        action: ActionEnableFeature.READ,
        feature_code: feature_code_menu,
      });

      if (!checkFeature)
        throw new Error(`Unauthorized Action For ${userAuth?.employee_id}`);

      response = await MenuCategoryListsService();
      break;
    }

    default:
      response = { status: 400, message: "Code Not Found" };
  }

  return response;
}

async function HandlePostRequest({
  code,
  userAuth,
  body,
}: {
  code: number;
  userAuth: User | null;
  body: any;
}): Promise<ParentResponse> {
  let response: ParentResponse = { status: 500, message: "Invalid Request" };

  switch (code) {
    case StatusAPICode.CREATE_MENU_CATEGORY: {
      const { menu_name_category, uuid } = body;

      const user_features = (userAuth as any)?.user_features as UserFeatures[];

      const checkFeature = await CheckFeatureAllowed({
        user_features,
        action: ActionEnableFeature.WRITE,
        feature_code: feature_code_menu,
      });

      if (!checkFeature)
        throw new Error(`Unauthorized Action For ${userAuth?.employee_id}`);

      response = await CreateMenuCategoryService({
        menu_name_category,
        uuid,
      });
      break;
    }

    case StatusAPICode.CREATE_MENU: {

      const user_features = (userAuth as any)?.user_features as UserFeatures[];

      const checkFeature = await CheckFeatureAllowed({
        user_features,
        action: ActionEnableFeature.WRITE,
        feature_code: feature_code_menu,
      });

      if (!checkFeature)
        throw new Error(`Unauthorized Action For ${userAuth?.employee_id}`);

      response = await CreateMenuService(body);
      break;
    }

    default:
      response = { status: 400, message: "Code Not Found" };
  }

  return response;
}
