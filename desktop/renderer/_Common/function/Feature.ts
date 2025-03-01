import { Feature, UserFeatures } from "@prisma/client";
import { ActionEnableFeature, FeaturesCodeLists } from "../enum/features.enum";

export async function CheckFeatureAllowed(data: {
  user_features: UserFeatures[];
  feature_code: FeaturesCodeLists;
  action: ActionEnableFeature;
}): Promise<boolean> {
  try {
    const { user_features, feature_code, action } = data;

    if (user_features.length < 1) {
      throw Error(`Not Allowed to take any action`);
    }


    const feature: Partial<UserFeatures> | undefined = user_features.find(
      (item) => (item as any)?.feature?.feature_code === feature_code
    );

    if (!feature) {
      throw Error("No Feature For This User");
    }


    if (action === ActionEnableFeature.READ) {
      if (!feature.is_read) {
        throw Error("User is not allow to read.");
      }
    } else if (action === ActionEnableFeature.WRITE) {
      if (!feature.is_write) {
        throw Error("User is not allow to write.");
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
