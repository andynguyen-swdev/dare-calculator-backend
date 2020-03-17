import { RequestHandler } from 'express';
import HttpError from '../models/HttpError';

const asyncHandler = (handler: RequestHandler): RequestHandler => async (req, res, next) => {
    try {
        return await handler(req, res, next);
    } catch (err) {
        return res
            .status(err.status || 500)
            .json({
                statusCode: err.status || 500,
                message: err.message, 
                extraData: err.extraData, 
            });
    }
};

export default asyncHandler;