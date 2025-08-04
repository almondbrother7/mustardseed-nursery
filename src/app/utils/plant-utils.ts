import { Plant } from '../shared/models/plant-interface';

export function sortPlants(plants: Plant[], sortField: 'name' | 'price' = 'name'): Plant[] {
  return plants.slice().sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.toLowerCase().localeCompare(valB.toLowerCase());
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return valA - valB;
    }

    return 0; // fallback if mixed types or undefined
  });
}
