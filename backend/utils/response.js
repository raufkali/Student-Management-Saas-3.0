// Success response
const sendSuccess = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Created response (201)
const sendCreated = (res, data = null, message = "Created successfully") => {
  return sendSuccess(res, data, message, 201);
};

// Error response
const sendError = (
  res,
  message = "Error occurred",
  statusCode = 400,
  errors = null,
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Unauthorized response (401)
const sendUnauthorized = (res, message = "Unauthorized") => {
  return sendError(res, message, 401);
};

// Forbidden response (403)
const sendForbidden = (res, message = "Forbidden") => {
  return sendError(res, message, 403);
};

// Not found response (404)
const sendNotFound = (res, message = "Resource not found") => {
  return sendError(res, message, 404);
};

// Validation error response (422)
const sendValidationError = (
  res,
  message = "Validation error",
  errors = null,
) => {
  return sendError(res, message, 422, errors);
};

// Paginated response
const sendPaginated = (res, items, total, page, limit, message = "Success") => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const data = {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };

  return sendSuccess(res, data, message);
};

// Download response
const sendDownload = (
  res,
  data,
  filename,
  contentType = "application/octet-stream",
) => {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  return res.send(data);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendValidationError,
  sendPaginated,
  sendDownload,
};
