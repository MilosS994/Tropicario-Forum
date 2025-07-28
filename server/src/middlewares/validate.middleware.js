import { validationResult } from "express-validator";

export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = {};
    errors.array().forEach((error) => {
      if (!extractedErrors[error.path]) {
        extractedErrors[error.path] = error.msg;
      }
    });
    return res.status(400).json({ success: false, errors: extractedErrors });
  }

  next();
};
