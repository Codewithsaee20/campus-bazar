import { Listing } from '../models/listing.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const PLATFORM_FEE = Number(process.env.PLATFORM_FEE) || 10;
const PRICE_MULTIPLIER = Number(process.env.PRICE_MULTIPLIER) || 0.60;

const PUBLIC_FIELDS = '-price -platformFee';

// ✅ Fix 1: now returns platformFee too so Listing.create() gets all three values
function calculatePrice(mrp) {
    const price = Math.round(mrp * PRICE_MULTIPLIER);
    const buyerPrice = price + PLATFORM_FEE;
    return { price, buyerPrice, platformFee: PLATFORM_FEE };
}


// ─── Create listing ────────────────────────────────────────────────────────
const createListing = asyncHandler(async (req, res) => {
    const { title, description, categoryId, mrp, condition, images = [] } = req.body;

    // ✅ Fix 2: sellerId and college always come from req.user (set by JWT middleware)
    // Never trust the client to send these — a student could fake a different college
    const sellerId = req.user._id;
    const college = req.user.college;

    const { price, buyerPrice, platformFee } = calculatePrice(mrp);

    const listing = await Listing.create({
        sellerId,
        college,
        title,
        description,
        mrp,
        price,
        buyerPrice,
        platformFee,
        categoryId,     // ✅ Fix 3: removed duplicate categoryId
        condition,
        images,
        status: 'Active'  // ✅ Fix 4: fixed typo 'activee' → 'Active' (matches your enum)
    });

    return res.status(201).json(
        new ApiResponse(201, listing, 'Listing created successfully')
    );
});


// ─── Get all listings (college scoped) ────────────────────────────────────
const getAllListings = asyncHandler(async (req, res) => {

    // ✅ Fix 5: removed extra comma between minPrice and maxPrice
    // ✅ Fix 6: renamed second sortOrder to sortDirection to avoid name conflict
    const {
        category,
        search,
        minPrice,
        maxPrice,
        condition,
        sortBy = 'createdAt',
        sortOrder = 'desc',   // this is the string from query: 'asc' or 'desc'
        page = 1,
        limit = 20
    } = req.query;

    // ✅ Fix 7: college comes from req.user — never from query params
    const college = req.user.college;

    const filter = {
        college,
        status: 'Active'
    };

    if (category) filter.categoryId = category;
    if (condition) filter.condition = condition;  // ✅ Fix 8: was 'FileReader.condition'
    if (search) filter.$text = { $search: search };

    if (minPrice || maxPrice) {
        filter.buyerPrice = {};
        if (minPrice) filter.buyerPrice.$gte = Number(minPrice);
        if (maxPrice) filter.buyerPrice.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // ✅ Fix 9: convert string 'asc'/'desc' to mongoose 1/-1
    // using a different name 'sortDirection' so it doesn't clash with 'sortOrder' above
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // ✅ Fix 10: removed misplaced dots before .populate()
    // The chain must be unbroken — no comma after .limit()
    const [listings, total] = await Promise.all([
        Listing.find(filter)
            .select(PUBLIC_FIELDS)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(Number(limit))
            .populate('sellerId', 'name avatar reputationScore')
            .populate('categoryId', 'name slug icon'),
        Listing.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            listings,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        }, 'Listings fetched successfully')
    );
});


// ─── Get single listing ────────────────────────────────────────────────────
const getListingById = asyncHandler(async (req, res) => {
    const college = req.user.college;

    // ✅ Fix 11: findById() only accepts an id, not a filter object
    // use findOne() when you need multiple conditions
    const listing = await Listing.findOne({ _id: req.params.id, college })
        .select(PUBLIC_FIELDS)
        .populate('sellerId', 'name avatar reputationScore college')
        .populate('categoryId', 'name slug icon');

    if (!listing) {
        throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    }

    // fire and forget — increment view count without blocking the response
    Listing.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

    return res.status(200).json(
        new ApiResponse(200, listing, 'Listing fetched successfully')
    );
});


// ─── Get my listings ───────────────────────────────────────────────────────
const getMyListings = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    // ✅ Fix 12: sellerId was undefined — comes from req.user
    const sellerId = req.user._id;

    const filter = { sellerId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    // ✅ Fix 13: removed misplaced dot before .populate()
    const [listings, total] = await Promise.all([
        Listing.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('categoryId', 'name slug'),
        Listing.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            listings,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        }, 'Your listings fetched successfully')
    );
});


// ─── Update listing ────────────────────────────────────────────────────────
const updateListing = asyncHandler(async (req, res) => {
    // ✅ Fix 14: sellerId was undefined
    const sellerId = req.user._id;

    const listing = await Listing.findOne({ _id: req.params.id, sellerId });

    if (!listing) {
        throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found or not yours');
    }

    if (listing.status === 'Sold') {
        throw new ApiError(400, 'LISTING_SOLD', 'Cannot update a sold listing');
    }

    // ✅ Fix 15: forEach was broken — it looped but never updated anything
    // correct approach: check each allowed field and update it on the document
    const allowedFields = ['title', 'description', 'categoryId', 'condition', 'images'];

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            listing[field] = req.body[field];
        }
    });

    // if mrp changed, recalculate all prices server-side
    if (req.body.mrp !== undefined) {
        const { price, buyerPrice, platformFee } = calculatePrice(req.body.mrp);
        listing.mrp = req.body.mrp;
        listing.price = price;
        listing.buyerPrice = buyerPrice;
        listing.platformFee = platformFee;
    }

    await listing.save();

    return res.status(200).json(
        new ApiResponse(200, listing, 'Listing updated successfully')
    );
});


// ─── Mark as sold ──────────────────────────────────────────────────────────
const markAsSold = asyncHandler(async (req, res) => {
    const sellerId = req.user._id;

    const listing = await Listing.findOne({ _id: req.params.id, sellerId });

    if (!listing) {
        throw new ApiError(404, 'LISTING_NOT_FOUND', 'Listing not found');
    }

    // ✅ Fix 16: condition was inverted — you want to throw if it is NOT Active
    if (listing.status !== 'Active') {
        throw new ApiError(400, 'INVALID_STATUS', 'Only Active listings can be marked as sold');
    }

    listing.status = 'Sold';
    await listing.save();

    return res.status(200).json(
        new ApiResponse(200, listing, 'Listing marked as sold successfully')
    );
});


export {
    createListing,
    getAllListings,
    getListingById,
    getMyListings,
    updateListing,
    markAsSold
};