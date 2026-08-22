const { validationResult } = require("express-validator");

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Extract error messages
    const errorMessages = errors.array().map((error) => error.msg);

    // Send first error message
    return res.status(400).json({
      success: false,
      message: errorMessages[0],
      errors: errorMessages,
    });
  };
};

module.exports = {
  validate,
};
