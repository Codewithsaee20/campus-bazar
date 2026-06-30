import { Category } from '../models/category.model.js';

const DEFAULT_CATEGORIES = [
  { name: 'Engineering', slug: 'engineering' },
  { name: 'Science', slug: 'science' },
  { name: 'Commerce', slug: 'commerce' },
  { name: 'Arts', slug: 'arts' },
];

export async function seedDefaultCategories() {
  const count = await Category.countDocuments();
  if (count > 0) {
    return;
  }

  await Category.insertMany(DEFAULT_CATEGORIES);
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`);
}
