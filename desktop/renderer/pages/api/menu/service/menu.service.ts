import { User, Menu, MenuCategory } from "@prisma/client";
import {
  CreateMenu,
  CreateMenuCategory,
  GetMenuCategoryLists,
  GetMenuCategoryNameCount,
  GetMenuNameCount,
  GetMenuPagination,
  GetTotalMenu,
} from "../model/menu.model";
import { MenuListsResponse } from "../../../../_Common/interface/api-response.interface";
import {
  WriteMenu,
  WriteMenuCategory,
} from "../../../../_Common/interface/menu.interface";
import {
  MenuCategoryWrite,
  MenuWrite,
} from "../../../../_Common/validation/menu.validation";
import { randomUUID } from "crypto";

export async function MenuListsService(data: {
  page: number;
  filter?: string;
}): Promise<MenuListsResponse> {
  try {
    const { page, filter } = data;

    let menuLists: any = [];
    let totalItems: number = 0;

    let conditionFilter: any = {};

    if (filter) {
      conditionFilter = {
        OR: [{ menu_name: { contains: filter } }],
      };
    }

    const totalMenu: number = await GetTotalMenu({
      where: conditionFilter,
    });

    if (!totalMenu) {
      return {
        status: 200,
        message: "Cannot Count Total Menu",
        totalItems,
        menuLists,
      };
    }

    const getUser = await GetMenuPagination({
      paginate: { page, totalItems: totalMenu },
      where: conditionFilter,
      orderBy: { field: "created_at", direction: "desc" },
    });

    if (!getUser) {
      return {
        status: 200,
        message: "Cannot Get Menu Lists",
        totalItems,
        menuLists,
      };
    }

    menuLists = getUser;
    totalItems = totalMenu;
    return {
      status: 200,
      message: "Cannot Count Total Menu",
      menuLists,
      totalItems,
    };
  } catch (error: any) {
    return {
      status: error?.status || 500,
      message: JSON.stringify(error),
      menuLists: [],
      totalItems: 0,
    };
  }
}

export async function CreateMenuCategoryService(
  data: WriteMenuCategory
): Promise<any> {
  let status = 500;
  try {
    await MenuCategoryWrite(data);
    const { menu_name_category, uuid } = data;

    const checkNameCategory = await GetMenuCategoryNameCount({
      where: {
        menu_category_name: menu_name_category,
      },
    });

    if (checkNameCategory > 0) {
      status = 400;
      throw Error("Name Already Exists");
    }

    const createCategoryName = await CreateMenuCategory({
      data: {
        menu_category_name: menu_name_category,
        menu_category_code: randomUUID(),
      },
    });

    if (!createCategoryName) {
      throw Error(
        JSON.stringify({
          status: 400,
          message: "Name Exists",
        })
      );
    }

    return {
      status: 200,
      message: "Successfully Create Menu Category",
    };
  } catch (error: any) {
    return {
      status: error?.status || status || 500,
      message: JSON.stringify(error),
    };
  }
}

export async function MenuCategoryListsService() {
  try {
    const menuCategory = await GetMenuCategoryLists({
      where: {},
    });

    return {
      status: 200,
      message: "Cannot Count Total Menu",
      menuCategory,
    };
  } catch (error) {
    return {
      status: error?.status || 500,
      message: JSON.stringify(error),
    };
  }
}

export async function CreateMenuService(data: WriteMenu): Promise<any> {
  let status = 500;
  try {
    await MenuWrite(data);
    const { menu_price, menu_name, image_path, menu_category_uuid } = data;

    const checkNameCategory = await GetMenuNameCount({
      where: {
        menu_category_name: menu_name,
      },
    });

    if (checkNameCategory > 0) {
      status = 400;
      throw Error("Name Already Exists");
    }

    const createCategoryName = await CreateMenu({
      data: {
        menu_name,
        price: menu_price,
        menu_image: image_path,
      },
    });

    if (!createCategoryName) {
      throw Error(
        JSON.stringify({
          status: 400,
          message: "Name Exists",
        })
      );
    }

    return {
      status: 200,
      message: "Successfully Create Menu Category",
    };
  } catch (error: any) {
    return {
      status: error?.status || status || 500,
      message: JSON.stringify(error),
    };
  }
}
