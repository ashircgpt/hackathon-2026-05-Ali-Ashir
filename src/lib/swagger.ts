// SERVER-ONLY — generates the OpenAPI spec from JSDoc @swagger annotations
// in all API route files. Used by /api-doc page.

import { createSwaggerSpec } from "next-swagger-doc";

export function getApiDocs() {
  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Pizza3.14 API",
        version: "1.0.0",
        description:
          "REST API for the Pizza3.14 tabletop ordering system. " +
          "Covers customer pizza building, order lifecycle, kitchen Kanban, " +
          "admin dashboard, feedback ledger, and authentication.",
        contact: {
          name: "Pizza3.14 Hackathon",
        },
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          description: "Application server",
        },
      ],
      tags: [
        { name: "menu",     description: "Menu items and combo endpoint" },
        { name: "orders",   description: "Order creation and status lifecycle" },
        { name: "feedback", description: "Customer feedback (blockchain ledger)" },
        { name: "auth",     description: "Kitchen / admin authentication" },
        { name: "admin",    description: "Admin-only statistics and management" },
        { name: "system",   description: "Health check" },
      ],
      components: {
        securitySchemes: {
          kitchenCookie: {
            type: "apiKey",
            in: "cookie",
            name: "pizza314_kitchen_auth",
            description: "Set by POST /api/auth/login with role=kitchen",
          },
          adminCookie: {
            type: "apiKey",
            in: "cookie",
            name: "pizza314_admin_auth",
            description: "Set by POST /api/auth/login with role=admin",
          },
        },
        schemas: {
          // ── Enums ────────────────────────────────────────────────────────
          OrderStatus: {
            type: "string",
            enum: ["NEW", "PREPARING", "BAKING", "READY", "SERVED"],
            description: "Order lifecycle status",
          },
          LayerType: {
            type: "string",
            enum: ["BASE", "SAUCE", "CHEESE", "TOPPING"],
          },

          // ── Core models ──────────────────────────────────────────────────
          MenuItem: {
            type: "object",
            properties: {
              id:          { type: "integer", example: 1 },
              name:        { type: "string",  example: "Classic Dough" },
              layerType:   { $ref: "#/components/schemas/LayerType" },
              imageUrl:    { type: "string",  example: "/assets/pizza/bases/1.jpg" },
              price:       { type: "number",  format: "float", example: 3.99 },
              calories:    { type: "integer", example: 280 },
              protein:     { type: "number",  format: "float", example: 8.5 },
              fats:        { type: "number",  format: "float", example: 1.2 },
              carbs:       { type: "number",  format: "float", example: 52.0 },
              sortOrder:   { type: "integer", example: 1 },
              isAvailable: { type: "boolean", example: true },
              createdAt:   { type: "string",  format: "date-time" },
            },
          },

          OrderLayer: {
            type: "object",
            properties: {
              id:         { type: "integer" },
              orderId:    { type: "integer" },
              menuItemId: { type: "integer" },
              zIndex:     { type: "integer", description: "Server-assigned render order" },
              menuItem:   { $ref: "#/components/schemas/MenuItem" },
            },
          },

          Feedback: {
            type: "object",
            properties: {
              id:          { type: "integer" },
              orderId:     { type: "integer" },
              content:     { type: "string" },
              contentHash: { type: "string", description: "SHA-256 of content" },
              prevHash:    { type: "string", description: "blockHash of previous block, or '0' for genesis" },
              timestamp:   { type: "string", format: "date-time" },
              blockHash:   { type: "string", description: "SHA-256(prevHash + timestamp + contentHash)" },
              createdAt:   { type: "string", format: "date-time" },
            },
          },

          Order: {
            type: "object",
            properties: {
              id:         { type: "integer", example: 42 },
              tableId:    { type: "integer", example: 1 },
              status:     { $ref: "#/components/schemas/OrderStatus" },
              totalPrice: { type: "number",  format: "float", example: 14.97 },
              totalCals:  { type: "integer", example: 820 },
              createdAt:  { type: "string",  format: "date-time" },
              updatedAt:  { type: "string",  format: "date-time" },
              layers:     { type: "array", items: { $ref: "#/components/schemas/OrderLayer" } },
              feedback:   { oneOf: [{ $ref: "#/components/schemas/Feedback" }, { type: "null" }] },
            },
          },

          TopCombo: {
            type: "object",
            properties: {
              ingredients: {
                type: "array",
                items: { $ref: "#/components/schemas/MenuItem" },
              },
              count: { type: "integer", description: "Number of times this combo was ordered" },
            },
          },

          AdminStats: {
            type: "object",
            properties: {
              totalOrders:           { type: "integer" },
              activeOrders:          { type: "integer" },
              servedOrders:          { type: "integer" },
              totalRevenue:          { type: "number", format: "float" },
              todayOrders:           { type: "integer" },
              todayRevenue:          { type: "number", format: "float" },
              averageRating:         { type: "null" },
              verifiedFeedbackCount: { type: "integer" },
              ordersByStatus: {
                type: "object",
                additionalProperties: { type: "integer" },
              },
              hourlyBreakdown: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    hour:    { type: "integer", minimum: 0, maximum: 23 },
                    count:   { type: "integer" },
                    revenue: { type: "number", format: "float" },
                  },
                },
              },
              topCombo: {
                oneOf: [{ $ref: "#/components/schemas/TopCombo" }, { type: "null" }],
              },
            },
          },

          // ── Request payloads ─────────────────────────────────────────────
          CreateOrderPayload: {
            type: "object",
            required: ["tableId", "layers"],
            properties: {
              tableId: { type: "integer", minimum: 1, example: 1 },
              layers: {
                type: "array",
                items: { type: "integer", minimum: 1 },
                minItems: 1,
                description: "Array of MenuItem IDs — must include exactly one BASE",
                example: [1, 4, 8, 11],
              },
            },
          },

          // ── Response wrappers ────────────────────────────────────────────
          ApiSuccess: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data:    { description: "Payload — varies by endpoint" },
            },
          },
          ApiError: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              message: { type: "string",  example: "Validation failed" },
              errors:  { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
  });
}
