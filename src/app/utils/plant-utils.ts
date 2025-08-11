import { Plant } from '../shared/models/plant-interface';

export function slugify(str: string) {
  return str
    .normalize('NFKD')                       // split accents
    .replace(/[\u0300-\u036f]/g, '')         // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\x00-\x7F]+/g, '')           // strip non-ASCII safely
    .replace(/[^\w\s-]/g, '')                // remove punctuation (keep word chars, space, -)
    .replace(/[\s_-]+/g, '-')                // collapse whitespace/underscores/dashes to single -
    .replace(/^-+|-+$/g, '');                // trim leading/trailing dashes
}

export function sortPlants(
  plants: Plant[],
  sortField: 'name' | 'price' = 'name',
  sortDir: 'asc' | 'desc' = 'asc'
): Plant[] {
  const sorted = plants.slice().sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.toLowerCase().localeCompare(valB.toLowerCase());
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return valA - valB;
    }
    return 0;
  });

  return sortDir === 'desc' ? sorted.reverse() : sorted;
}
