import { Blob_ENV } from "../enum/content-type.enum";
import { SaveBlob } from "../interface/media-metadata.interface";
import { PutBlobResult } from "@vercel/blob";

export function GetPathBlob(data: { url: string; blob_env: Blob_ENV }): string {
  try {
    const { url, blob_env } = data;

    let path: string = "";
    switch (blob_env) {
      case Blob_ENV.vercel: {
        const splitURL = url.replace(
          process.env.NEXT_PUBLIC_BLOB_DOMAIN || "",
          ""
        );

        if (splitURL) path = splitURL;
        break;
      }
      case Blob_ENV.local: {
        const splitURL = url.replace(
          process.env.NEXT_PUBLIC_BLOB_DOMAIN || "",
          ""
        );

        if (splitURL) path = splitURL;
        break;
      }

      default: {
        break;
      }
    }

    return path;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export function GetBlobFormat(data: {
  blob: PutBlobResult[] | [];
  blob_env: Blob_ENV;
}): SaveBlob[] {
  try {
    const { blob, blob_env } = data;

    if (blob.length <= 0) {
      throw Error("No Data");
    }

    const mediaItems: SaveBlob[] = [];

    switch (blob_env) {
      case Blob_ENV.vercel: {
        (blob as PutBlobResult[]).map((item) => {
          mediaItems.push({
            url: item.url,
            metadata: JSON.stringify(item),
            path: GetPathBlob({ url: item.url, blob_env }),
          });
        });
        break;
      }
      case Blob_ENV.local: {
        (blob as PutBlobResult[]).map((item) => {
          mediaItems.push({
            url: item.url,
            metadata: JSON.stringify(item),
            path: GetPathBlob({ url: item.url, blob_env }),
          });
        });
        break;
      }
      default: {
        break;
      }
    }

    return mediaItems;
  } catch (error) {
    console.error(error);
    return [];
  }
}
