import { Order } from "../models/order.model.js";
import { Listing } from "../models/listing.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

//generete otp
//crypto.randomINT is cryptographically secure and perfect for generating OTPs. It generates a random integer between the specified range, which we can use to create a 6-digit OTP.
//cryptographically secure -> less predictable and more resistant to attacks compared to Math.random().
const generateOtp = () => {
    //random 6 digit number
    return String(crypto.randomInt(100000, 1000000));
} 


//create order
//will get called when buyer clicks "Buy Now" on a listing. We will create an order in "PENDING_PAYMENT" status and return the order details to the frontend, which will then call Razorpay to make the payment.
const createOrder = asyncHandler(async (req, res) => {
    const {ListingId , buyerId, buyerCollege} = req.body;

    //fetch listing 
    const listing = await Listing.findById(ListingId);

    if(!listing){
        throw new ApiError(404, "Listing not found", "LISTING_NOT_FOUND");
    }

    //listing must be active cannot buy lisitng which is not active
    if(listing.status !== "ACTIVE"){
        throw new ApiError(400, "Listing is not available for purchase", "LISTING_NOT_AVAILABLE");
    }

    //buyer cannot buy their own listing
    if(listing.sellerId.toString() === buyerId){
        throw new ApiError(400, "Cannot buy your own listing", "CANNOT_BUY_OWN_LISTING");
    }

    //checking listing product status cannot buy product which is paid
    const existingOrderStatus = await Order.findOne({
        listingID: ListingId,
        status: { $in: ["PENDING_PAYMENT", "PAID", "MEETUP_SCHEDULED"] }
    })

    if(existingOrderStatus){
        throw new ApiError(400, "Listing is already in the process of being sold", "LISTING_ALREADY_SOLD");
    }

    //build listing snapshot
    const listingSnapShot = {
        title: listing.title,
        mrp: listing.mrp,
        price: listing.price,
        buyerPrice: listing.buyerPrice,
        platformFee: listing.platformFee
     }

     //create order
     
     const order = await Order.create({
        buyerId,
        sellerId: listing.sellerId,
        listingId: ListingId,
        listingSnapShot,
        college: buyerCollege,
        status: "PENDING_PAYMENT"
     })

    return res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
})

//get buying order (My)
const getMyBuyingOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({buyerId: req.user._id})
        .populate("listingId", "title image") //attach listing title and image to order response
        .populate("sellerId", "name email") //attach seller name and email to order response
        .sort({createdAt: -1})  //will show recent orders first

    return res.status(200).json(new ApiResponse(200, orders, "Your buying orders fetched successfully"));

})


//get selling orders (My)
const getMySellingOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({sellerId: req.user._id})
        .populate("listingId", "title image") //attach listing title and image to order response
        .populate("buyerId", "name email") //attach buyer name and email to order response
        .sort({createdAt: -1})  //will show recent orders first

    return res.status(200).json(new ApiResponse(200, orders, "Your selling orders fetched successfully"));

})

const getOrderbyId = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id) //will take id from url params
        .populate("listingId", "title image") //attach listing title and image to order response
        .populate("buyerId", "name email") //attach buyer name and email to order response
        .populate("sellerId", "name email") //attach seller name and email to order response

    if(!order){
        throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
    }

    //access control: only buyer or seller can access order details
    const isBuyter = order.buyerId._id.toString() === req.user._id.toString();
    const isSeller = order.sellerId._id.toString() === req.user._id.toString();

    if(!isBuyter && !isSeller){
        throw new ApiError(403, "Access denied", "ACCESS_DENIED");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order details fetched successfully"));
})

//cancel order
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if(!order){
        throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
    }

    //only buyer can cancel order
    if(order.buyerId.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Access denied", "ACCESS_DENIED");
    }

    //cancel order which are in pending payment status
    if(order.status !== "PENDING_PAYMENT"){
        throw new ApiError(400, "Cannot cancel order at this stage", "CANNOT_CANCEL_ORDER");
    }

    order.status = "CANCELLED";
    await order.save();
    order.cancellationReason = req.body.reason; //optional cancellation reason from buyer
    return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
})

//generate OTP for order verification (for meetup)
const generateOrderOtp = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params);

    if(!order){
        throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
    }

    //only seller can generate OTP
    if(order.sellerId.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Access denied", "ACCESS_DENIED");
    }

    //otp can only be generated when buyer has paid
   if(order.status !== "PAID" && order.status !== "MEETUP_SCHEDULED"){
    {
        throw new ApiError(400, "Otp can only be generated after payment is confirmed", "CANNOT_GENERATE_OTP");
    }
    }

    //generate otp
    const rawOtp = generateOtp();

    //hash otp before saving
    const saltRounds = 10;
    const otpHash = await bcrypt.hash(rawOtp, saltRounds);

    //expire otp in 10 minutes
    const otpExpiry = Date.now() + 10 * 60 * 1000; //10 minutes from now

    order.otpHash = otpHash;
    order.otpExpiry = otpExpiry;
    await order.save();

    res.status(200).json(new ApiResponse(200, {otp: rawOtp, expiry: otpExpiry}, "OTP generated successfully"));
})

//const verify otp 
const verifyOtp = asyncHandler(async (req, res) => {
    const order = await Order.findById(orderId);

    if(!order){
        throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
    }

    //only the buyer can verify OTP
    if(order.buyerId.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Access denied", "ACCESS_DENIED");
    }

    //order must be paid or meetup scheduled to verify OTP
    if(order.status !== "PAID" && order.status !== "MEETUP_SCHEDULED"){
        throw new ApiError(400, "OTP can only be verified after payment is confirmed", "CANNOT_VERIFY_OTP");
    }

    //check if otp was actually generated
    if(!order.otpHash || !order.otpExpiry){
        throw new ApiError(400, "OTP not generated for this order", "OTP_NOT_GENERATED");
    }

    //check expiry
    if(Date.now() > order.otpExpiry){
        throw new ApiError(400, "OTP has expired", "OTP_EXPIRED");
    }

    //compare otp
    const isOtpValid = await bcrypt.compare(req.body.otp, order.otpHash);

    if(!isOtpValid){
        throw new ApiError(400, "Invalid OTP", "INVALID_OTP");
    }

    //mark order as completed
    order.status = "COMPLETED";

    //clear otp fields
    order.otpHash = null;
    order.otpExpiry = null;

    await order.save();

    //mark listing as sold after successful meetup and OTP verification
    await Listing.findByIdAndUpdate(order.listingId, {status: "SOLD"});

    return res.status(200).json(new ApiResponse(200, order, "OTP verified successfully, order completed"));
})


export {
    createOrder,
    getMyBuyingOrders,
    getMySellingOrders,
    getOrderbyId,
    cancelOrder,
    generateOrderOtp,
    verifyOtp
}