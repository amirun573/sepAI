import { PrismaCondtionFetch } from "../../../../_Common/interface/database.interface";
import { prisma } from "../../../../libs/prisma";
import { User, UserFeatures, PrismaClient } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { JWTDecodeInterface } from "../../../../_Common/interface/auth.interface";
import jwt from "jsonwebtoken";

export async function GetUserSingle(
  data: PrismaCondtionFetch
): Promise<Partial<User> | null> {
  try {
    const { where, select } = data;

    return prisma.user.findFirst({
      where,
      select,
    });
  } catch (error) {
    // logger.error("Failed at GetUserSingle function ===>", { error });

    console.error(error);
    return null;
  }
}



export async function GetUserFeatures(
  data: PrismaCondtionFetch
): Promise<Partial<UserFeatures>[]> {
  try {
    const { where, select } = data;

    return prisma.userFeatures.findMany({
      where,
      select,
    });
  } catch (error) {
    // logger.error("Failed at GetUserFeatures function ===>", { error });

    console.error(error);
    return [];
  }
}
