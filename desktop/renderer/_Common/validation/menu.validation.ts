import * as yup from "yup";
import { WriteMenu, WriteMenuCategory } from "../interface/menu.interface";

const MenuCategoryWriteValidation = yup.object().shape({
  uuid: yup.string().optional(),
  menu_name_category: yup.string().required("Menu Name Category Required"),
});

const MenuWriteValidation = yup.object().shape({
  menu_category_uuid:  yup.string().required("Menu Category Required"),
  image_path: yup.string().required("Image Required and only JPEG/PNG supported"),
  menu_name: yup.string().required("Menu Name Required"),
  menu_price: yup.number().min(0.1).required("Menu Price Required"),
});

export function MenuCategoryWrite(data: WriteMenuCategory) {
  return MenuCategoryWriteValidation.validate(data);
}

export function MenuWrite(data: WriteMenu) {
  return MenuWriteValidation.validate(data);
}
