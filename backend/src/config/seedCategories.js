import { Category } from '../models/category.model.js';

const DEFAULT_CATEGORIES = [
  { name: 'Books', slug: 'books' },
  { name: 'Notes', slug: 'notes' },
  { name: 'Stationery', slug: 'stationery' },
];

export async function seedDefaultCategories() {
  const count = await Category.countDocuments();
  if (count > 0) {
    return;
  }

  await Category.insertMany(DEFAULT_CATEGORIES);
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}
