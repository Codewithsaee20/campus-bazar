import { Order } from "../models/order.model.js";
import { razorpayInstance } from "../config/razorpayConfig.js";
import { ApiError } from "../utils/ApiError.js";

const createOrder = async (orderId , userId) => {
    if (!razorpayInstance) {
        throw new ApiError(500, "Razorpay is not configured on server", "PAYMENT_CONFIG_MISSING");
    }
    
    //find order by orderId 
    const order = await Order.findById(orderId);

    //check if order exists
    if(!order){
        throw new ApiError(404, "Order not found", "ORDER_NOT_FOUND");
    }

    //is logged in user is the owner of the order
    if(order.buyerId.toString() !== userId.toString()){
        throw new ApiError(403, "You are not authorized to access this order", "UNAUTHORIZED");
    }

    //is order still waiting for payment
    if(order.status !== "PENDING_PAYMENT"){
        throw new ApiError(400, "Order is not in pending payment status", "INVALID_ORDER_STATUS");
    }

    //create order in razorpay
    const razorpayOrder = await razorpayInstance.orders.create({
        amount: order.listingSnapShot.price * 100, // amount in paise
        currency: "INR",
        receipt: order._id.toString(), //order as receipt
        notes: {
            campusBazzarOrderId: order._id.toString(),
            buyerId: order.buyerId.toString(),
            sellerId: order.sellerId.toString(),
        }
    });

    //save razorpay order id in order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    //return razorpay order details to client
    return {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
    }

}

export { createOrder };