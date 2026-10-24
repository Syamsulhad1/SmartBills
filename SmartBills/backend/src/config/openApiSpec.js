
const openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "SmartBills API",
        version: "1.0.0",
        description: "Interactive API documentation and testing for SmartBills."
    },

    servers: [
        {
            url: "http://localhost:5000",
            description: "Local development server"
        }
    ],

    tags: [
        { name: "Authentication" },
        { name: "Users" },
        { name: "Categories" },
        { name: "Transactions" },
        { name: "Analytics" }
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },

        schemas: {
            AuthRequest: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    name: {
                        type: "string",
                        example: "Penguji SmartBills"
                    },
                    email: {
                        type: "string",
                        format: "email",
                        example: "penguji@example.com"
                    },
                    password: {
                        type: "string",
                        format: "password",
                        example: "password123"
                    }
                }
            },

            UserProfile: {
                type: "object",
                properties: {
                    user_id: {
                        type: "integer",
                        example: 1
                    },
                    name: {
                        type: "string",
                        example: "Aldi"
                    },
                    email: {
                        type: "string",
                        format: "email",
                        example: "aldi@example.com"
                    },
                    role: {
                        type: "string",
                        example: "user"
                    },
                    current_balance: {
                        type: "string",
                        example: "500000.00"
                    },
                    initial_balance: {
                        type: "string",
                        nullable: true,
                        example: "500000.00"
                    },
                    initial_balance_set_at: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-10-22T09:30:00Z"
                    },
                    has_initial_balance: {
                        type: "boolean",
                        example: true
                    },
                    created_at: {
                        type: "string",
                        format: "date-time"
                    }
                }
            },

            InitialBalanceRequest: {
                type: "object",
                required: ["amount"],
                properties: {
                    amount: {
                        type: "number",
                        minimum: 0,
                        maximum: 9999999999999.99,
                        example: 500000,
                        description:
                            "Saldo awal dalam satuan mata uang yang digunakan SmartBills. Maksimal dua angka desimal."
                    }
                }
            },

            Transaction: {
                type: "object",
                properties: {
                    transaction_id: {
                        type: "integer",
                        example: 1
                    },
                    type: {
                        type: "string",
                        enum: ["INCOME", "EXPENSE"]
                    },
                    amount: {
                        type: "string",
                        example: "45000.00"
                    },
                    merchant_name: {
                        type: "string",
                        nullable: true
                    },
                    category_name: {
                        type: "string",
                        nullable: true
                    },
                    receipt_url: {
                        type: "string",
                        nullable: true,
                        example: "/api/transactions/1/receipt"
                    },
                    transaction_date: {
                        type: "string",
                        format: "date-time"
                    }
                }
            },

            ApiError: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: false
                    },
                    message: {
                        type: "string",
                        example: "Authentication required"
                    }
                }
            }
        }
    },

    paths: {
        "/api/categories": {
            get: {
                tags: ["Categories"],
                summary: "List available transaction categories",
                description:
                    "Returns seeded categories. Filter by INCOME or EXPENSE; an authenticated JWT is required.",
                security: [{ bearerAuth: [] }],

                parameters: [
                    {
                        name: "type",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["INCOME", "EXPENSE"]
                        }
                    }
                ],

                responses: {
                    200: {
                        description:
                            "Categories with their IDs and transaction types",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean"
                                        },
                                        message: {
                                            type: "string"
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                categories: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            category_id: {
                                                                type: "integer"
                                                            },
                                                            name: {
                                                                type: "string"
                                                            },
                                                            type: {
                                                                type: "string",
                                                                enum: [
                                                                    "INCOME",
                                                                    "EXPENSE"
                                                                ]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: "Unsupported category type"
                    },
                    401: {
                        description: "Authentication required"
                    }
                }
            }
        },

        "/api/auth/register": {
            post: {
                tags: ["Authentication"],
                summary: "Register a user for testing",

                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                allOf: [
                                    {
                                        $ref: "#/components/schemas/AuthRequest"
                                    },
                                    {
                                        type: "object",
                                        required: ["name"]
                                    }
                                ]
                            }
                        }
                    }
                },

                responses: {
                    201: {
                        description: "User registered successfully"
                    },
                    400: {
                        description: "Invalid request",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError"
                                }
                            }
                        }
                    },
                    409: {
                        description: "Email is already registered"
                    }
                }
            }
        },

        "/api/auth/login": {
            post: {
                tags: ["Authentication"],
                summary: "Log in and obtain a JWT",

                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/AuthRequest"
                            }
                        }
                    }
                },

                responses: {
                    200: {
                        description:
                            "Login successful; copy data.token to Authorize",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                token: {
                                                    type: "string"
                                                },
                                                user: {
                                                    $ref: "#/components/schemas/UserProfile"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: "Invalid email or password"
                    }
                }
            }
        },

        "/api/users/me": {
            get: {
                tags: ["Users"],
                summary: "Get the authenticated user's profile",
                description:
                    "Returns the profile and initial balance status of the authenticated user.",
                security: [{ bearerAuth: [] }],

                responses: {
                    200: {
                        description: "User profile retrieved successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        message: {
                                            type: "string",
                                            example: "Profile retrieved"
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                user: {
                                                    $ref: "#/components/schemas/UserProfile"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description:
                            "Authentication required or user not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError"
                                }
                            }
                        }
                    }
                }
            }
        },

        "/api/users/me/initial-balance": {
            post: {
                tags: ["Users"],
                summary: "Set the authenticated user's initial balance",
                description:
                    "Sets the initial balance once. The authenticated user's identity is taken from the JWT, not from the request body.",
                security: [{ bearerAuth: [] }],

                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/InitialBalanceRequest"
                            },
                            example: {
                                amount: 500000
                            }
                        }
                    }
                },

                responses: {
                    200: {
                        description: "Initial balance set successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        message: {
                                            type: "string",
                                            example:
                                                "Initial balance set successfully"
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                user: {
                                                    $ref: "#/components/schemas/UserProfile"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    400: {
                        description: "Invalid initial balance amount",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/ApiError"
                                }
                            }
                        }
                    },
                    401: {
                        description:
                            "Authentication required or user not found"
                    },
                    409: {
                        description:
                            "Initial balance has already been set and cannot be changed"
                    }
                }
            }
        },

        "/api/transactions": {
            get: {
                tags: ["Transactions"],
                summary:
                    "List the authenticated user's transactions (gallery)",
                security: [{ bearerAuth: [] }],

                parameters: [
                    {
                        name: "limit",
                        in: "query",
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 50
                        }
                    },
                    {
                        name: "offset",
                        in: "query",
                        schema: {
                            type: "integer",
                            minimum: 0,
                            default: 0
                        }
                    }
                ],

                responses: {
                    200: {
                        description:
                            "Transactions belonging to the authenticated user",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean"
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Transaction"
                                            }
                                        },
                                        pagination: {
                                            type: "object"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: {
                        description: "Authentication required"
                    }
                }
            },

            post: {
                tags: ["Transactions"],
                summary:
                    "Create a transaction and optionally upload its receipt",
                description:
                    "Receipt must be JPEG, PNG, or WebP and no larger than 5 MB. Items is a JSON string containing an array.",
                security: [{ bearerAuth: [] }],

                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["type", "amount"],
                                properties: {
                                    type: {
                                        type: "string",
                                        enum: ["INCOME", "EXPENSE"]
                                    },
                                    amount: {
                                        type: "number",
                                        exclusiveMinimum: 0,
                                        example: 45000
                                    },
                                    categoryId: {
                                        type: "integer",
                                        nullable: true
                                    },
                                    merchantName: {
                                        type: "string",
                                        maxLength: 100
                                    },
                                    notes: {
                                        type: "string"
                                    },
                                    transactionDate: {
                                        type: "string",
                                        format: "date-time"
                                    },
                                    items: {
                                        type: "string",
                                        example:
                                            '[{"itemName":"Beras","quantity":1,"unitPrice":45000}]'
                                    },
                                    receipt: {
                                        type: "string",
                                        format: "binary",
                                        description:
                                            "Optional JPEG, PNG, or WebP image; maximum 5 MB."
                                    }
                                }
                            }
                        }
                    }
                },

                responses: {
                    201: {
                        description:
                            "Transaction and optional receipt created"
                    },
                    400: {
                        description:
                            "Invalid transaction data or unsupported image"
                    },
                    401: {
                        description: "Authentication required"
                    },
                    413: {
                        description:
                            "Receipt exceeds the 5 MB size limit"
                    }
                }
            }
        },

        "/api/transactions/{transactionId}": {
            get: {
                tags: ["Transactions"],
                summary: "Get transaction details and items",
                security: [{ bearerAuth: [] }],

                parameters: [
                    {
                        name: "transactionId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        }
                    }
                ],

                responses: {
                    200: {
                        description:
                            "Transaction belonging to the authenticated user"
                    },
                    401: {
                        description: "Authentication required"
                    },
                    404: {
                        description: "Transaction not found"
                    }
                }
            }
        },

        "/api/transactions/{transactionId}/receipt": {
            get: {
                tags: ["Transactions"],
                summary: "View a private receipt image",
                description:
                    "The request requires a JWT and the transaction must belong to the authenticated user.",
                security: [{ bearerAuth: [] }],

                parameters: [
                    {
                        name: "transactionId",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        }
                    }
                ],

                responses: {
                    200: {
                        description: "Receipt image",
                        content: {
                            "image/jpeg": {
                                schema: {
                                    type: "string",
                                    format: "binary"
                                }
                            },
                            "image/png": {
                                schema: {
                                    type: "string",
                                    format: "binary"
                                }
                            },
                            "image/webp": {
                                schema: {
                                    type: "string",
                                    format: "binary"
                                }
                            }
                        }
                    },
                    401: {
                        description: "Authentication required"
                    },
                    404: {
                        description:
                            "Receipt not found or not owned by this user"
                    }
                }
            }
        },

        "/api/analytics": {
            get: {
                tags: ["Analytics"],
                summary: "Get financial analytics for a calendar period",
                description:
                    "Returns current balance, full-period cash-flow totals, trend buckets, and expense totals by category.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "period",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["daily", "weekly", "monthly"],
                            default: "monthly"
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Analytics overview for the authenticated user"
                    },
                    400: {
                        description: "Unsupported analytics period"
                    },
                    401: {
                        description: "Authentication required"
                    }
                }
            }
        },

        "/api/analytics/receipts": {
            get: {
                tags: ["Analytics"],
                summary: "List private receipt gallery entries",
                description:
                    "Returns receipt metadata for the authenticated user. Fetch each image from its protected transaction receipt endpoint.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: "period",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            enum: ["daily", "weekly", "monthly"],
                            default: "monthly"
                        }
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 12
                        }
                    },
                    {
                        name: "offset",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 0,
                            default: 0
                        }
                    }
                ],
                responses: {
                    200: {
                        description: "Paginated private receipt metadata"
                    },
                    400: {
                        description: "Invalid period or pagination"
                    },
                    401: {
                        description: "Authentication required"
                    }
                }
            }
        }
    }
};

module.exports = openApiSpec;
