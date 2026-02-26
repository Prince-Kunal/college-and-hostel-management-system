// Utility function to format API responses
export const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};
