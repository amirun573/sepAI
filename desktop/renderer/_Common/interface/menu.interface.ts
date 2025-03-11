export interface MenuPaginationRequest {
  page: number;
  filter: string | null;
}

export interface WriteMenuCategory {
  menu_name_category: string;
  uuid?: string;
}

export interface WriteMenu {
  menu_category_uuid: string;
  image_path: string;
  menu_name: string;
  menu_price: number;
}
