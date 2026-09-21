class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_SERVER_ERROR', errors = null) {
    const response = {
      success: false,
      message,
      code
    };
    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }

  static badRequest(res, message = 'Invalid request parameters', code = 'BAD_REQUEST', errors = null) {
    return ApiResponse.error(res, message, 400, code, errors);
  }

  static unauthorized(res, message = 'Unauthorized access', code = 'UNAUTHORIZED') {
    return ApiResponse.error(res, message, 401, code);
  }

  static forbidden(res, message = 'Access forbidden', code = 'FORBIDDEN') {
    return ApiResponse.error(res, message, 403, code);
  }

  static notFound(res, message = 'Resource not found', code = 'NOT_FOUND') {
    return ApiResponse.error(res, message, 404, code);
  }

  static conflict(res, message = 'Resource already exists', code = 'CONFLICT') {
    return ApiResponse.error(res, message, 409, code);
  }
}

module.exports = ApiResponse;
