import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createOrder } from "../services/paymentService.js";

const initiatePayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const userId = req.user.id;

    const paymentDetails = await createOrder(orderId, userId);

    return res
        .status(200)
        .json(new ApiResponse(true, "Payment initiated successfully", paymentDetails));

})

export { initiatePayment };