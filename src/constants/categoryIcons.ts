export const CATEGORY_ICON_OPTIONS = [
  "Laptop",
  "Home",
  "Shirt",
  "Briefcase",
  "Package",
  "Smartphone",
  "Car",
  "Baby",
  "Dumbbell",
  "BookOpen",
  "UtensilsCrossed",
  "Palette",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number];

export const CATEGORY_ICON_LABELS: Record<CategoryIconName, string> = {
  Laptop: "Tecnología",
  Home: "Hogar",
  Shirt: "Moda",
  Briefcase: "Servicios / Oficina",
  Package: "General",
  Smartphone: "Móviles",
  Car: "Automotriz",
  Baby: "Bebés",
  Dumbbell: "Deportes",
  BookOpen: "Libros",
  UtensilsCrossed: "Alimentos",
  Palette: "Arte",
};
