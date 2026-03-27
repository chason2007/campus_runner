import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    let status = err.status || 500;
    let message = err.message || 'Something went wrong on the server';

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        status = 400;
        message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    }

    // Handle MongoDB Duplicate Key Errors (e.g., email already exists)
    if (err.code === 11000) {
        status = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use another one.`;
    }

    console.error(`[Error ${status}]: ${message}`);

    res.status(status).json({
        success: false,
        status,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export class AppError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        Error.captureStackTrace(this, this.constructor);
    }
}
