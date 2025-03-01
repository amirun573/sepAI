export interface ParentResponse {
  status: number;
  message: string;
}

export interface MenuListsResponse extends ParentResponse {
  totalItems: number;
  menuLists: Array<any>;
}
