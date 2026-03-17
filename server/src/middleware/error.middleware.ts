import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Error]: ${err.stack || err.message}`);

    const status = err.status || 500;
    const message = err.message || 'Something went wrong on the server';

    res.status(status).json({
        success: false,
        status,
        message,
        // Only include stack trace in development
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
