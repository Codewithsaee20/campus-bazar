import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { categoryApi, listingApi, unwrapData } from '../utils/campusApi';

const LOCAL_LISTINGS_KEY = 'campus-bazzar-local-listings';
const MAX_IMAGES = 1;

const emptyForm = {
  title: '',
  genre: '',
  description: '',
  price: '',
  condition: 'New',
  contactDetails: '',
};

const readLocalListings = () => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) || '[]');
  } catch {
    return [];
  }
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });

const writeLocalListings = (nextListings) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(nextListings));
};

const normalizeText = (value) => value.trim().replace(/\s+/g, ' ');

const ListingFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [pageError, setPageError] = useState('');

  const isEditMode = Boolean(id);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        const categoriesData = unwrapData(response) || [];
        const nextCategories = categoriesData.map((category) => category?.name || category?.slug || category).filter(Boolean);
        setCategories(nextCategories.length > 0 ? nextCategories : ['Engineering', 'Science', 'Commerce', 'Arts']);
      } catch {
        setCategories(['Engineering', 'Science', 'Commerce', 'Arts']);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  useEffect(() => {
    if (!isEditMode) return;
    const existingListing = readLocalListings().find((listing) => listing.id === id);
    if (existingListing) {
      setForm({
        title: existingListing.title || '',
        genre: existingListing.genre || '',
        description: existingListing.description || '',
        price: existingListing.price ? String(existingListing.price) : '',
        condition: existingListing.condition || 'New',
        contactDetails: existingListing.contactDetails || '',
      });
      setPreviewUrl(existingListing.image || '');
    }
  }, [id, isEditMode]);

  const contactHint = useMemo(() => 'Phone number, email, or preferred contact method', []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    const title = normalizeText(form.title);
    const genre = normalizeText(form.genre);
    const description = normalizeText(form.description);
    const contactDetails = normalizeText(form.contactDetails);
    const price = normalizeText(String(form.price));

    if (!title) nextErrors.title = 'Book name is required.';
    if (!genre) nextErrors.genre = 'Genre or type is required.';
    if (!description) nextErrors.description = 'Description is required.';
    if (!price) nextErrors.price = 'Price is required.';
    if (price && Number.isNaN(Number(price))) nextErrors.price = 'Price must be numeric.';
    if (!form.condition) nextErrors.condition = 'Condition is required.';
    if (!contactDetails) nextErrors.contactDetails = 'Contact details are required.';
    if (!selectedImage && !previewUrl) nextErrors.image = 'Book image is required.';

    setErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      normalized: {
        title,
        genre,
        description,
        price: price ? Number(price) : 0,
        contactDetails,
      },
    };
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setErrors((current) => ({ ...current, image: 'Please upload a PNG, JPG, or WebP image.' }));
      return;
    }

    setSelectedImage(file);
    setErrors((current) => ({ ...current, image: '' }));
  };

  const persistListing = (listing) => {
    const existing = readLocalListings();
    const next = [listing, ...existing].slice(0, 40);
    writeLocalListings(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setPageError('');

    const { isValid, normalized } = validate();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      const apiPayload = new FormData();
      apiPayload.append('title', normalized.title);
      apiPayload.append('description', normalized.description);
      apiPayload.append('price', String(normalized.price));
      apiPayload.append('condition', normalized.condition === 'New' ? 'New' : 'Good');
      apiPayload.append('categoryId', normalized.genre);
      apiPayload.append('contactDetails', normalized.contactDetails);
      apiPayload.append('mrp', String(normalized.price));
      apiPayload.append('college', 'Campus Bazaar');
      if (selectedImage) {
        apiPayload.append('images', selectedImage);
      }

      const previewImage = selectedImage ? await readFileAsDataUrl(selectedImage) : previewUrl;
      let savedListingId = `local-${Date.now()}`;
      try {
        const response = await listingApi.create(apiPayload);
        const createdListing = unwrapData(response);
        savedListingId = createdListing?._id || createdListing?.id || savedListingId;
      } catch {
        persistListing({
          id: savedListingId,
          title: normalized.title,
          genre: normalized.genre,
          description: normalized.description,
          price: normalized.price,
          condition: normalized.condition,
          contactDetails: normalized.contactDetails,
          image: previewImage,
          sellerName: 'You',
          sellerEmail: normalized.contactDetails,
          sellerPhone: normalized.contactDetails,
          college: 'Campus Bazaar',
          source: 'local',
          createdAt: new Date().toISOString(),
        });
      }

      setSuccessMessage('Your book is now live in the marketplace. Redirecting...');
      setForm(emptyForm);
      setSelectedImage(null);
      setTimeout(() => navigate('/my-listings'), 1200);
    } catch (submitError) {
      setPageError(submitError?.response?.data?.message || 'Could not save listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="marketplace-page">
      <div className="aurora-bg">
        <div className="aurora-blob cyan" />
        <div className="aurora-blob violet" />
        <div className="aurora-blob pink" />
      </div>

      <Navbar />

      <main className="container listing-shell">
        <Link to="/marketplace" className="listing-back-link">
          ← Back to Marketplace
        </Link>

        <section className="listing-card glass">
          <header className="listing-header">
            <div>
              <p className="marketplace-kicker">Sell a book</p>
              <h1>{isEditMode ? 'Edit listing' : 'List a book for your campus'}</h1>
              <p>
                Add a clean listing with a preview image, clear details, and your contact info so buyers can reach you quickly.
              </p>
            </div>
            <div className="listing-badge">
              <UploadCloud size={18} />
              <span>Responsive listing form</span>
            </div>
          </header>

          {successMessage ? <div className="listing-success"><CheckCircle2 size={18} /> {successMessage}</div> : null}
          {pageError ? <div className="listing-error">{pageError}</div> : null}

          <form className="listing-form" onSubmit={handleSubmit} noValidate>
            <div className="listing-layout">
              <section className="listing-panel">
                <label className="listing-label">Book image</label>
                <label className="listing-upload" htmlFor="book-image-upload">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Book preview" className="listing-preview-image" />
                  ) : (
                    <div className="listing-upload-empty">
                      <ImagePlus size={30} />
                      <span>Click to upload an image</span>
                      <small>PNG, JPG, or WebP</small>
                    </div>
                  )}
                </label>
                <input id="book-image-upload" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} className="listing-file-input" />
                {errors.image ? <p className="listing-field-error">{errors.image}</p> : null}
                <p className="listing-help">A clear cover photo increases trust and conversions.</p>
              </section>

              <section className="listing-panel listing-fields">
                <div className="listing-field">
                  <label className="listing-label">Book name</label>
                  <input
                    className="form-input"
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    placeholder="Engineering Mathematics Vol. 1"
                    required
                  />
                  {errors.title ? <p className="listing-field-error">{errors.title}</p> : null}
                </div>

                <div className="listing-field-grid">
                  <div className="listing-field">
                    <label className="listing-label">Genre / Type</label>
                    <input
                      className="form-input"
                      list="listing-genres"
                      value={form.genre}
                      onChange={(event) => updateField('genre', event.target.value)}
                      placeholder="Engineering"
                      required
                    />
                    <datalist id="listing-genres">
                      {categories.map((genre) => (
                        <option key={genre} value={genre} />
                      ))}
                    </datalist>
                    {errors.genre ? <p className="listing-field-error">{errors.genre}</p> : null}
                  </div>

                  <div className="listing-field">
                    <label className="listing-label">Price</label>
                    <input
                      className="form-input"
                      type="number"
                      inputMode="numeric"
                      value={form.price}
                      onChange={(event) => updateField('price', event.target.value)}
                      placeholder="320"
                      required
                    />
                    {errors.price ? <p className="listing-field-error">{errors.price}</p> : null}
                  </div>
                </div>

                <div className="listing-field-grid">
                  <div className="listing-field">
                    <label className="listing-label">Condition</label>
                    <select
                      className="form-input"
                      value={form.condition}
                      onChange={(event) => updateField('condition', event.target.value)}
                      required
                    >
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                    {errors.condition ? <p className="listing-field-error">{errors.condition}</p> : null}
                  </div>

                  <div className="listing-field">
                    <label className="listing-label">Contact details</label>
                    <input
                      className="form-input"
                      value={form.contactDetails}
                      onChange={(event) => updateField('contactDetails', event.target.value)}
                      placeholder={contactHint}
                      required
                    />
                    {errors.contactDetails ? <p className="listing-field-error">{errors.contactDetails}</p> : null}
                  </div>
                </div>

                <div className="listing-field">
                  <label className="listing-label">Description</label>
                  <textarea
                    className="form-input listing-textarea"
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="Add edition, condition notes, highlights, or anything the buyer should know."
                    required
                  />
                  {errors.description ? <p className="listing-field-error">{errors.description}</p> : null}
                </div>

                <div className="listing-actions">
                  <button type="button" className="marketplace-text-button" onClick={() => navigate('/marketplace')} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary listing-submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 size={18} className="listing-spin" /> : null}
                    {isSubmitting ? 'Publishing...' : 'Publish listing'}
                  </button>
                </div>
              </section>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default ListingFormPage;
