import React from "react";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ProfileScreen from "../screens/profile/ProfileScreen";
import type { ExtendedRootStackParams } from "./types";

type ProfileNavigation = NativeStackNavigationProp<
  ExtendedRootStackParams,
  "Main"
>;
type ProfileRoute = RouteProp<ExtendedRootStackParams, "Main">;

export default function ProfileTabRoute(): React.JSX.Element {
  const navigation = useNavigation<ProfileNavigation>();
  const route = useRoute<ProfileRoute>();
  return <ProfileScreen navigation={navigation} route={route} />;
}
