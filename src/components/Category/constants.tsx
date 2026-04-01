import {
  Footprints,
  Glasses,
  Handbag,
  Shirt,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { CategoryColorOption, CategoryIconOption } from "@/interface/category";

export const CATEGORY_COLOR_OPTIONS: CategoryColorOption[] = [
  {
    value: "#9EE9C8",
    label: "Xanh mint",
    className: "bg-[#9EE9C8]",
    ringClassName: "ring-[#9EE9C8]/45",
  },
  {
    value: "#9ADCF7",
    label: "Xanh da troi",
    className: "bg-[#9ADCF7]",
    ringClassName: "ring-[#9ADCF7]/45",
  },
  {
    value: "#D3C2FF",
    label: "Tim pastel",
    className: "bg-[#D3C2FF]",
    ringClassName: "ring-[#D3C2FF]/45",
  },
  {
    value: "#F8E4A6",
    label: "Vang kem",
    className: "bg-[#F8E4A6]",
    ringClassName: "ring-[#F8E4A6]/45",
  },
  {
    value: "#F7C8D8",
    label: "Hồng pastel",
    className: "bg-[#F7C8D8]",
    ringClassName: "ring-[#F7C8D8]/45",
  },
  {
    value: "#C9D4FF",
    label: "Xanh lavender",
    className: "bg-[#C9D4FF]",
    ringClassName: "ring-[#C9D4FF]/45",
  },
];

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  {
    value: "tag",
    label: "Quần",
    icon: Tag,
  },
  {
    value: "shirt",
    label: "Áo",
    icon: Shirt,
  },
  {
    value: "handbag",
    label: "Túi xách",
    icon: Handbag,
  },
  {
    value: "glasses",
    label: "Kính",
    icon: Glasses,
  },
  {
    value: "shopping-bag",
    label: "Giày",
    icon: ShoppingBag,
  },
  {
    value: "footprints",
    label: "Dép",
    icon: Footprints,
  },
];

export function getCategoryIcon(iconValue: string) {
  return (
    CATEGORY_ICON_OPTIONS.find((item) => item.value === iconValue)?.icon ??
    CATEGORY_ICON_OPTIONS[0].icon
  );
}

export function getCategoryColor(colorValue: string) {
  return (
    CATEGORY_COLOR_OPTIONS.find((item) => item.value === colorValue) ??
    CATEGORY_COLOR_OPTIONS[0]
  );
}
