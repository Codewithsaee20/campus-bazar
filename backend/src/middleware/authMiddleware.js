import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const verifyToken = asyncHandler(async (req, res, next) => {

    const bearerToken = req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
    const token = bearerToken || req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = {
            _id: decodedToken._id,
            college: decodedToken.college,
            role: decodedToken.role
        };

        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized");
    }
});

export { verifyToken };
const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user?.role) {
        return next(new ApiError(401, "Unauthorized"));
    }

    if (!roles.includes(req.user.role)) {
        return next(new ApiError(403, "Forbidden: Insufficient permissions"));
    }

    return next();
};

export { authorizeRoles }; 