import { RoleList } from "../enum/role.enum";

export function GetRoleFromId(role_id: number): RoleList | null {
  if (
    Object.values(RoleList).includes(role_id) &&
    typeof role_id === "number"
  ) {
    switch (role_id) {
      case RoleList.SUPER_ADMIN:
        return RoleList.SUPER_ADMIN;
      case RoleList.ADMIN:
        return RoleList.ADMIN;
      default:
        return RoleList.EMPLOYEE;
    }
  }
  return null; // Return null if the role_id is not valid
}
