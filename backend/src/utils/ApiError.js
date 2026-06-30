// Main: consistent error shape for API responses.
class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errorCode = "ERROR", stack = "") {
        // Backward compatibility for old usage: new ApiError(message, statusCode)
        if (typeof statusCode !== "number" && typeof message === "number") {
            const legacyMessage = statusCode;
            statusCode = message;
            message = legacyMessage;
        }

        // Backward compatibility for old usage: new ApiError(statusCode, errorCode, message)
        if (typeof errorCode === "string" && typeof message === "string" && /^[A-Z0-9_]+$/.test(message)) {
            const tmpMessage = errorCode;
            errorCode = message;
            message = tmpMessage;
        }

        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errorCode = errorCode;
        this.data = null;
        this.success = false;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError }