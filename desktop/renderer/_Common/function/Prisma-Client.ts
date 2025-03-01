'use client';

import { StatusAPICode } from '../enum/status-api-code.enum';
import { APIClientRequest } from '../interface/api-request.interface';
import { PrismaClient } from 'prisma';


export const PrismaClientFetch = async (body: APIClientRequest) => {
    try {

        const { urlPath, data, code } = body;

        let response: any = null;
        if (!urlPath || !data || !code) {
            throw Error("Missing Parameter");
        }

        switch (code) {

            case StatusAPICode.sign_in_request: {

                const { email, password } = data;
                response = await PrismaClient.user.findFirst({
                    where: {
                        email,
                        password_hash: password
                    }
                })
                break;
            }
            default: {
                break;
            }
        }


        return response;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}