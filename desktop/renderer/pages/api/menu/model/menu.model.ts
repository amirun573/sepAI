import {
  PrismaCondtionFetch,
  PrismaUpdate,
} from "../../../../_Common/interface/database.interface";
import { PaginationData } from "../../../../_Common/interface/pagination.interface";
import { prisma } from "../../../../libs/prisma";
import { MenuCategory } from "@prisma/client";

export async function GetTotalMenu(data: PrismaCondtionFetch): Promise<number> {
  try {
    const { where } = data;

    return await prisma.menu.count({
      where,
    });
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function GetMenuPagination(options: {
  paginate: PaginationData;
  select?: any;
  where: any;
  orderBy?: { field: string; direction: "asc" | "desc" };
  include?: any;
}): Promise<any> {
  try {
    const { paginate, select, where, orderBy } = options;

    const limit = 10;
    const skip = (paginate.page - 1) * limit;

    return await prisma.menu.findMany({
      skip: skip >= paginate.totalItems ? 0 : skip,
      take: Math.min(limit, paginate.totalItems - skip),
      where,
      select,
      orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
    });

    //const page = data.get("page");
  } catch (error) {
    // logger.error("Failed at GetUserPagination function ===>", { error });

    console.error(error);
    return null;
  }
}

export async function GetMenuCategoryName(data: PrismaCondtionFetch) {
  try {
    const { where, select } = data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function GetMenuCategoryNameCount(data: PrismaCondtionFetch) {
  try {
    const { where, select } = data;

    return prisma.menuCategory.count({
      where,
    });
  } catch (error) {
    console.error(error);
    return 1;
  }
}

export async function GetMenuNameCount(data: PrismaCondtionFetch) {
  try {
    const { where, select } = data;

    return prisma.menu.count({
      where,
    });
  } catch (error) {
    console.error(error);
    return 1;
  }
}

export async function GetMenuCategoryLists(
  data: PrismaCondtionFetch
){
  try {
    const { where, select } = data;

    return prisma.menuCategory.findMany({
      where,
      select,
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function CreateMenuCategory(object: PrismaUpdate) {
  try {
    const { data, prismaTransaction } = object;

    if (!prismaTransaction) {
      return prisma.menuCategory.create({
        data,
      });
    } else {
      return prismaTransaction.menuCategory.create({
        data,
      });
    }
  } catch (error) {
    return null;
  }
}

export async function CreateMenu(object: PrismaUpdate) {
  try {
    const { data, prismaTransaction } = object;

    if (!prismaTransaction) {
      return prisma.menu.create({
        data,
      });
    } else {
      return prismaTransaction.menu.create({
        data,
      });
    }
  } catch (error) {
    return null;
  }
}
