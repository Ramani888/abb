import { Request, Response, NextFunction } from 'express';
import Validator from 'validatorjs';
import { StatusCodes } from 'http-status-codes';

enum RouteSource {
  Body,
  Query,
  Params
}

interface ValidationRules {
  [key: string]: string;
}

// Middleware function to validate request body
// export const validateBody = (rules: ValidationRules, source?: number) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if ((!req.body || Object.keys(req.body).length === 0) && !source) {
//       return res.status(StatusCodes.BAD_REQUEST).json({ errors: ['Request body is missing'] });
//     }
//     let body;
//     if (source === RouteSource?.Params) {
//       body = req?.params;
//     } else if (source === RouteSource?.Query) {
//       body = req?.query;
//     } else {
//       body = req?.body;
//     }
//     const validator = new Validator(body, rules);

//     if (validator.fails()) {
//       const errors = validator.errors.all();
//       return res.status(StatusCodes.BAD_REQUEST).json({ errors });
//     }

//     next();
//   };
// };

export const validateBody = (rules: ValidationRules, source?: RouteSource) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if ((!req.body || Object.keys(req.body).length === 0) && source === undefined) {
        res.status(StatusCodes.BAD_REQUEST).json({ errors: ['Request body is missing'] });
        return; // Ensure function exits after sending response
      }
  
      let body;
      if (source === RouteSource.Params) {
        body = req.params;
      } else if (source === RouteSource.Query) {
        body = req.query;
      } else {
        body = req.body;
      }
  
      const validator = new Validator(body, rules);
  
      if (validator.fails()) {
        const errors = validator.errors.all();
        res.status(StatusCodes.BAD_REQUEST).json({ errors });
        return; // Ensure function exits after sending response
      }
  
      next(); // Call next() if validation passes
    };
};

// You can add more validation rules for different routes as needed
export const extendedRules: ValidationRules = {
  name: 'required|string',
  isPrivate: 'required|boolean',
  color: 'required|string',
  cardTypeId: 'required|string',
  age: 'numeric|min:0|max:150',
  email: 'required|email',
  dateOfBirth: 'required|date_format:YYYY-MM-DD',
  birthDate: 'required|date_format:MM/DD/YYYY'
};
