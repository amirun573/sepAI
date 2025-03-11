import { APICode } from "../enum/api-code.enum";
import { Unit } from "../enum/unit.enum";

export interface APIInterface {
  url: string;
  data?: any;
  API_Code: APICode;
}

export interface APIResponse {
  status: number;
  message?: string;
  data?: any;
  success: boolean;
}

export interface APIHuggingFaceModeListsResponse {
  createAt: string;
  downloads: number;
  id: string;
  library_name: string;
  likes: number;
  modelId: string;
  pipeline_tag: string;
  private: boolean;
  tags: string[];
  trendingScore: number;
  _id: string;
  size?: APIHuggingFaceModeSizeResponse;
  downloaded?: boolean;
}

export interface APIHuggingFaceModeSizeResponse {
  size: number;
  unit: Unit;
}

export interface APIGetSaveModelLists {
  model_id: number;
  model_name: string;
  path: string;
  size: number;
  unit: Unit;
}

export interface APIModelListsResponse {
  model_id: number;
  model_name: string;
  path: string;
  size: number;
  unit: Unit;
}

export interface APIChatHistoryResponse {
  chat_id: number;
  content: string;
  role: string;
  created_at: string;
}
