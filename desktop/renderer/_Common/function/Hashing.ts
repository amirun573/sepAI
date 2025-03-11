import crypto, { createHmac } from "crypto";

const secretKey = process.env.HASHING_SECRET_KEY || "FbQWh2UagAphNkbNS887u5m3Hx34RGnD";
const iv = process.env.Initialization_Vector || "eb2bcebb999407286caea729998e7fa0c089178f8ca43857e73ea3ff66dbe1852af24a4b0199be9192798a3f8ad6d6475db3621cfacf38dcb0fba5d77d73aaf5";
const encryption_method = process.env.ENCRYPTION_METHOD || "aes-256-cbc";
const key = crypto
  .createHash("sha512")
  .update(secretKey)
  .digest("hex")
  .substring(0, 32);

const encryptionIV = crypto
  .createHash("sha512")
  .update(iv)
  .digest("hex")
  .substring(0, 16);

export const encrypt = (data: string): string => {
  try {
    const cipher = crypto.createCipheriv(encryption_method, key, encryptionIV);
    return Buffer.from(
      cipher.update(data, "utf8", "hex") + cipher.final("hex")
    ).toString("base64"); // Encrypts data and converts to hex and base64
    // const cipher = crypto.createCipheriv(
    //   "aes-256-cbc",
    //   Buffer.from(secretKey),
    //   Buffer.from(iv)
    // );

    // let encryptedData = cipher.update(data, "utf-8", "hex");
    // encryptedData += cipher.final("hex");
    // return encryptedData;
  } catch (error: any) {
    console.log("DATA==>", data);
    console.error("Encryption error:", error.message);
    return "";
  }
};

export const decrypt = (data: string): string | null => {
  try {
    const buff = Buffer.from(data, "base64");
    const decipher = crypto.createDecipheriv(
      encryption_method,
      key,
      encryptionIV
    );
    return (
      decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8")
    ); // Decrypts data and converts to utf8
    // const iv = Buffer.from(
    //   process.env.Initialization_Vector || "eb2bcebb99940728",
    //   "hex"
    // );

    // const decipher = crypto.createDecipheriv(
    //   "aes-256-cbc",
    //   Buffer.from(
    //     process.env.HASHING_SECRET_KEY || "FbQWh2UagAphNkbNS887u5m3Hx34RGnF"
    //   ),
    //   iv
    // );

    // let decryptedData = decipher.update(data, "hex", "utf-8");
    // decryptedData += decipher.final("utf-8");
    // return decryptedData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export function cryptoRandomUUID(): string {
  return crypto.randomUUID();
}
