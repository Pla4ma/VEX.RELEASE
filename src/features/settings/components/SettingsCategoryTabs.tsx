import React from "react";
import { ScrollView, Pressable, Text } from "react-native";
import type { SettingCategory } from "../types";
import { settingsStyles as styles } from "./settings-screen-styles";

interface Category {
  key: SettingCategory;
  label: string;
  icon: string;
}

interface SettingsCategoryTabsProps {
  categories: Category[];
  activeCategory: SettingCategory;
  onCategoryChange: (category: SettingCategory) => void;
}

export function SettingsCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: SettingsCategoryTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContent}
    >
      {categories.map((category) => (
        <Pressable
          key={category.key}
          style={({ pressed }) => [
            styles.tab,
            activeCategory === category.key && styles.activeTab,
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => onCategoryChange(category.key)}
          accessibilityLabel={`${category.label} category button`}
          accessibilityRole="button"
          accessibilityHint="Activates this control"
        >
          <Text style={styles.tabIcon}>{category.icon}</Text>
          <Text
            style={[
              styles.tabLabel,
              activeCategory === category.key && styles.activeTabLabel,
            ]}
          >
            {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
