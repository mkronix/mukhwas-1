export const parameters = {
  Page: {
    in: "query",
    name: "page",
    schema: { type: "integer", minimum: 1, default: 1 },
    description: "Page number",
  },
  Limit: {
    in: "query",
    name: "limit",
    schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    description: "Items per page",
  },
  SortBy: {
    in: "query",
    name: "sort_by",
    schema: { type: "string" },
    description: "Field to sort by",
  },
  SortOrder: {
    in: "query",
    name: "sort_order",
    schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
    description: "Sort direction",
  },
  IdPath: {
    in: "path",
    name: "id",
    required: true,
    schema: { type: "string", format: "uuid" },
    description: "Resource UUID",
  },
};
