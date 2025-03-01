import { utils, WorkBook } from "xlsx";
import * as xlsx from "xlsx";
import { FileMimeType } from "../enum/file-type.enum";
import { ExtractExcelInterface } from "../interface/spread-sheet.interface";
import { ExcelCharacterisitics } from "../enum/spread-sheet.enum";
import { head } from "lodash";
import _ from "lodash";

export function ExtractExcelData(
  headers: string[],
  workbook: WorkBook
): Array<ExtractExcelInterface> {
  const excelInfo: Array<ExtractExcelInterface> = [];

  workbook.SheetNames.map((sheetName) => {

    const sheet = workbook.Sheets[sheetName];
    const data: any = utils.sheet_to_json(sheet, {
      defval: ExcelCharacterisitics.defval,
    });



    if (data.length <= 0) {
      throw Error("No Data Inside Excel");
    }

    headers.map((header) => {

      const checkHeader = _.map(data, header);

      if (typeof head(checkHeader) == "undefined" || checkHeader.length <= 0) {
        throw Error("There is Column that missing");
      }
    });

    const extarctExcelInterface: ExtractExcelInterface = { sheetName, data };

    excelInfo.push(extarctExcelInterface);
  });

  return excelInfo;
}

export async function ReadExcelFile(file: File): Promise<WorkBook | null> {
  try {
    let contentBuffer = await new Response(file).arrayBuffer();

    var dataUint8Array = new Uint8Array(contentBuffer);
    const excelFile: WorkBook = xlsx.read(dataUint8Array, { type: "buffer" });

    if (!excelFile) {
      throw Error("Failed To Read Excel Buffer");
    }

    return excelFile;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function ConvertExcel(
  HEADER_ORDER_LIST: string[][],
  result: any,
  sheetname: string = "Sheet1"
): Buffer {
  const wb = xlsx.utils.book_new();
  const ws: xlsx.WorkSheet = xlsx.utils.json_to_sheet([]);
  xlsx.utils.sheet_add_aoa(ws, HEADER_ORDER_LIST);

  //Starting in the second row to avoid overriding and skipping headers
  xlsx.utils.sheet_add_json(ws, result, { origin: "A2", skipHeader: true });

  xlsx.utils.book_append_sheet(wb, ws, sheetname);

  return xlsx.write(wb, { type: "buffer" });
}

export function CreateFileName(filename: string): string[] {
  return ["Content-disposition", `attachment; filename=${filename}.xlsx`];
}

export function ConvertNumberToDate(date: number): string {
  return new Date((date - 25569) * 86400 * 1000).toISOString();
}
