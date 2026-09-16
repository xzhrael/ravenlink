export type LinkCategory = "SOCIAL" | "PRODUCT" | "CUSTOM" | "CONTACT";

export const LinkCategory = {
  SOCIAL: "SOCIAL",
  PRODUCT: "PRODUCT",
  CUSTOM: "CUSTOM",
  CONTACT: "CONTACT",
} as const;

export interface LinkInput {
  title: string;
  url: string;
  icon?: string | null;
  subtitle?: string | null;
  customThumbnail?: string | null;
  isActive?: boolean;
  position?: number;
  startDate?: string | null;
  endDate?: string | null;
  category?: LinkCategory;
}
