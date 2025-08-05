// src/app/shared/utils/category-utils.ts

export const CATEGORY_LABELS: { [key: string]: string } = {
  'butterfly-garden': 'Butterfly Garden',
  'native-plants': 'Native Plants',
  'flowering-plants': 'Flowering Plants',
  'survival-garden': 'Survival Garden',
  'miscellaneous': 'Miscellaneous'
};

export function getCategoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] || slug;
}
