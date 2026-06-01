import {
  Baby,
  BookOpen,
  Briefcase,
  Car,
  Dumbbell,
  Home,
  Laptop,
  Package,
  Palette,
  Shirt,
  Smartphone,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type { CategoryIconName } from "@/constants/categoryIcons";

const CATEGORY_ICONS: Record<CategoryIconName, LucideIcon> = {
  Laptop,
  Home,
  Shirt,
  Briefcase,
  Package,
  Smartphone,
  Car,
  Baby,
  Dumbbell,
  BookOpen,
  UtensilsCrossed,
  Palette,
};

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  if (iconName && iconName in CATEGORY_ICONS) {
    return CATEGORY_ICONS[iconName as CategoryIconName];
  }
  return Package;
}
