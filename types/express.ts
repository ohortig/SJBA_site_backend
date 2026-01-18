import type { Request, Response, NextFunction, RequestHandler } from 'express';

export type AsyncRequestHandler = (
     req: Request,
     res: Response,
     next: NextFunction
) => Promise<unknown>;

export type ErrorRequestHandler = (
     err: Error & { status?: number; code?: string },
     req: Request,
     res: Response,
     next: NextFunction
) => void;

export type { Request, Response, NextFunction, RequestHandler };
