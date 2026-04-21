const WISHLIST_KEY = 'campus-bazzar-wishlist';
export const WISHLIST_UPDATED_EVENT = 'campus-bazzar-wishlist-updated';

const safeArray = (value) => (Array.isArray(value) ? value : []);

export const readWishlist = () => {
  if (typeof window === 'undefined') return [];
  try {
    return safeArray(JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || '[]'));
  } catch {
    return [];
  }
};

export const writeWishlist = (items) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(safeArray(items)));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
};

export const toWishlistItem = (book = {}) => ({
  id: book.id,
  title: book.title || 'Untitled book',
  description: book.description || 'No description available.',
  image: book.image || 'https://via.placeholder.com/640x820?text=Campus+Bazzar',
  genre: book.genre || 'Uncategorized',
  price: Number(book.price || 0),
  originalPrice: Number(book.originalPrice || book.price || 0),
  condition: book.condition || 'Unknown',
  sellerName: book.sellerName || 'Campus Seller',
  sellerEmail: book.sellerEmail || '',
  sellerPhone: book.sellerPhone || '',
  college: book.college || 'Campus Bazaar',
});

export const isInWishlist = (bookId) => {
  return readWishlist().some((item) => String(item.id) === String(bookId));
};

export const toggleWishlist = (book) => {
  const items = readWishlist();
  const index = items.findIndex((item) => String(item.id) === String(book?.id));

  if (index >= 0) {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    writeWishlist(next);
    return { saved: false, items: next };
  }

  const next = [toWishlistItem(book), ...items].slice(0, 100);
  writeWishlist(next);
  return { saved: true, items: next };
};
