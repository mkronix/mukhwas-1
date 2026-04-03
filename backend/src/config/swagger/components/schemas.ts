export const schemas = {
  ApiSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { type: "object" },
      meta: { type: "object" },
    },
    required: ["success", "data"],
  },
  ApiErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "VALIDATION_ERROR" },
          message: { type: "string", example: "Validation failed" },
          details: { type: "object" },
        },
        required: ["code", "message"],
      },
    },
    required: ["success", "error"],
  },
  PaginationMeta: {
    type: "object",
    properties: {
      page: { type: "integer" },
      limit: { type: "integer" },
      total: { type: "integer" },
      total_pages: { type: "integer" },
      has_next: { type: "boolean" },
      has_prev: { type: "boolean" },
    },
  },
  ValidationErrorDetail: {
    type: "object",
    additionalProperties: { type: "string" },
    example: { "body.email": "Invalid email format" },
  },
  UploadResult: {
    type: "object",
    properties: {
      url: { type: "string", example: "https://res.cloudinary.com/xxx/image/upload/v123/mukhwas/products/abc.jpg" },
      public_id: { type: "string", example: "mukhwas/products/abc" },
      width: { type: "integer", example: 800 },
      height: { type: "integer", example: 600 },
      format: { type: "string", example: "jpg" },
      bytes: { type: "integer", example: 45230 },
      resource_type: { type: "string", example: "image" },
    },
    required: ["url", "public_id"],
  },
};
