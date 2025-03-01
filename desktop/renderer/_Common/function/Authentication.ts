import { UserDetailsLocalStorage } from "../interface/auth.interface";
import { Content_Type } from "../enum/content-type.enum";
import { StatusAPICode } from "../enum/status-api-code.enum";

export async function GetBodyData(req: any) {
  let body: any = null;

  const contentType: string = req.headers["content-type"];

  if (contentType.includes(Content_Type.JSON)) {
    body = await req.body;
  } else if (contentType.includes(Content_Type.FORM_DATA)) {
    const formData = await req.formData();
    body = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }
  }

  if (!body) {
    return null;
  }

  return body;
}

const APIAuthStatusAPICode: StatusAPICode[] = [
  StatusAPICode.GET_MENU_LISTS_PAGINATION,
  StatusAPICode.GET_MENU_CATEGORY,
  StatusAPICode.CREATE_MENU_CATEGORY,
];

export function APIAuthValidation(code: StatusAPICode): boolean {
  try {
    return APIAuthStatusAPICode.includes(code);

  } catch (error) {
    console.error(error);
    return false;
  }
}
