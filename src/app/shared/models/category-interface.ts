type CategoryLink = {
  label: string;
  url: string;
};

export interface Category {
  slug: string;
  label: string;
  icon?: string;
  sortOrder?: number;
  tagline?: string;
  description?: string;
  about?: string
  links?: CategoryLink[];
}