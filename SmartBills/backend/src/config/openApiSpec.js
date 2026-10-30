const createTransactionOperation = (type) => ({
    tags: ["Transactions"],
    summary: `Create an ${type.toLowerCase()} transaction`,
    description:
        `Creates only ${type.toLowerCase()} transactions. Receipt must be JPEG, PNG, or WebP and no larger than 5 MB. Items is a JSON string containing an array.`,
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
                            enum: [type],
                            example: type
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
            description: "Transaction and optional receipt created"
        },
        400: {
            description: "Invalid transaction data or unsupported image"
        },
        401: {
            description: "Authentication required"
        },
        413: {
            description: "Receipt exceeds the 5 MB size limit"
        }
    }
});

const updateTransactionOperation = (type) => ({
    tags: ["Transactions"],
    summary: `Update an ${type.toLowerCase()} transaction`,
    description:
        `Updates only ${type.toLowerCase()} transactions. The transaction must belong to the authenticated user. Updates that would make the balance negative are rejected.`,
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
    requestBody: {
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    required: ["type", "amount"],
                    properties: {
                        type: {
                            type: "string",
                            enum: [type],
                            example: type
                        },
                        amount: {
                            type: "number",
                            exclusiveMinimum: 0,
                            example: 120000
                        },
                        categoryId: {
                            type: "integer",
                            nullable: true,
                            example: 3
                        },
                        merchantName: {
                            type: "string",
                            nullable: true,
                            maxLength: 100,
                            example: `Tes ${type === "INCOME" ? "pemasukan" : "pengeluaran"} diubah`
                        },
                        notes: {
                            type: "string",
                            nullable: true,
                            example: "Uji pembaruan transaksi"
                        },
                        transactionDate: {
                            type: "string",
                            format: "date",
                            example: "2026-10-30"
                        },
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["itemName", "quantity"],
                                properties: {
                                    itemName: {
                                        type: "string",
                                        example: "Beras"
                                    },
                                    quantity: {
                                        type: "integer",
                                        minimum: 1,
                                        example: 1
                                    },
                                    unitPrice: {
                                        type: "number",
                                        minimum: 0,
                                        nullable: true,
                                        example: 120000
                                    },
                                    totalPrice: {
                                        type: "number",
                                        minimum: 0,
                                        nullable: true,
                                        example: 120000
                                    }
                                }
                            }
                        }
                    },
                    example: {
                        type,
                        amount: 120000,
                        categoryId: 3,
                        merchantName: `Tes ${type === "INCOME" ? "pemasukan" : "pengeluaran"} diubah`,
                        notes: "Uji pembaruan transaksi",
                        transactionDate: "2026-10-30",
                        items: []
                    }
                }
            }
        }
    },
    responses: {
        200: {
            description: "Transaction updated"
        },
        400: {
            description:
                "Invalid transaction data, transaction type mismatch, or update would make the balance negative"
        },
        401: {
            description: "Authentication required"
        },
        404: {
            description: "Transaction not found"
        }
    }
});

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
        { name: "Analytics" },
        { name: "AI" },
        { name: "News" }
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

        "/api/transactions/income": {
            post: createTransactionOperation("INCOME")
        },

        "/api/transactions/expense": {
            post: createTransactionOperation("EXPENSE")
        },

        "/api/transactions/income/{transactionId}": {
            put: updateTransactionOperation("INCOME")
        },

        "/api/transactions/expense/{transactionId}": {
            put: updateTransactionOperation("EXPENSE")
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
            },

            put: {
                tags: ["Transactions"],
                summary: "Update a transaction and its items",
                description:
                    "Replaces the transaction fields and item list. The transaction must belong to the authenticated user. Updates that would make the balance negative are rejected.",
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
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
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
                                        example: 120000
                                    },
                                    categoryId: {
                                        type: "integer",
                                        nullable: true,
                                        example: 3
                                    },
                                    merchantName: {
                                        type: "string",
                                        nullable: true,
                                        maxLength: 100,
                                        example: "Tes pemasukan diubah"
                                    },
                                    notes: {
                                        type: "string",
                                        nullable: true,
                                        example: "Uji pembaruan transaksi"
                                    },
                                    transactionDate: {
                                        type: "string",
                                        format: "date",
                                        example: "2026-10-30"
                                    },
                                    items: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            required: ["itemName", "quantity"],
                                            properties: {
                                                itemName: {
                                                    type: "string",
                                                    example: "Beras"
                                                },
                                                quantity: {
                                                    type: "integer",
                                                    minimum: 1,
                                                    example: 1
                                                },
                                                unitPrice: {
                                                    type: "number",
                                                    minimum: 0,
                                                    nullable: true,
                                                    example: 120000
                                                },
                                                totalPrice: {
                                                    type: "number",
                                                    minimum: 0,
                                                    nullable: true,
                                                    example: 120000
                                                }
                                            }
                                        }
                                    }
                                },
                                example: {
                                    type: "INCOME",
                                    amount: 120000,
                                    categoryId: 3,
                                    merchantName: "Tes pemasukan diubah",
                                    notes: "Uji pembaruan transaksi",
                                    transactionDate: "2026-10-30",
                                    items: []
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Transaction updated"
                    },
                    400: {
                        description:
                            "Invalid transaction data or update would make the balance negative"
                    },
                    401: {
                        description: "Authentication required"
                    },
                    404: {
                        description: "Transaction not found"
                    }
                }
            },

            delete: {
                tags: ["Transactions"],
                summary: "Delete a transaction",
                description:
                    "Deletes the transaction belonging to the authenticated user and reverses its effect on the current balance.",
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
                        description: "Transaction deleted",
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
                                            example: "Transaction deleted"
                                        },
                                        data: {
                                            type: "object",
                                            properties: {
                                                transaction_id: {
                                                    type: "integer",
                                                    example: 11
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
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

        "/api/news": {
            get: {
                tags: ["News"],
                summary: "Get recent food price and IHSG news",
                description:
                    "Returns recent CNBC Indonesia RSS articles with source links and image URLs when available. Results are cached briefly and require authentication.",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: "Dashboard news sections and unavailable source identifiers"
                    },
                    401: {
                        description: "Authentication required"
                    },
                    502: {
                        description: "News providers are unavailable"
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
        },

        "/api/ai/ocr": {
            post: {
                tags: ["AI"],
                summary: "Extract raw text from a receipt image",
                description:
                    "Uploads a private receipt image to the local Tesseract OCR service and returns raw text. This does not save a transaction or change the balance.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "multipart/form-data": {
                            schema: {
                                type: "object",
                                required: ["receipt"],
                                properties: {
                                    receipt: {
                                        type: "string",
                                        format: "binary"
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Extracted receipt text" },
                    400: {
                        description: "Image missing or format unsupported"
                    },
                    401: { description: "Authentication required" },
                    413: { description: "Image exceeds the 4 MB limit" },
                    422: { description: "No readable text found" },
                    502: { description: "OCR service failed" },
                    503: { description: "OCR service is unavailable" },
                    504: { description: "OCR service request timed out" }
                }
            }
        },

        "/api/ai/parse-transaction": {
            post: {
                tags: ["AI"],
                summary: "Parse OCR text into a transaction draft",
                description:
                    "Sends text to Gemini and returns a validated draft only. This endpoint does not create a transaction or update the user's balance.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["text"],
                                properties: {
                                    text: {
                                        type: "string",
                                        maxLength: 20000,
                                        example: "TOKO CONTOH\\nTOTAL Rp 25.000"
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description:
                            "Validated transaction draft. Review the status and warnings before saving."
                    },
                    400: {
                        description: "OCR text is missing or invalid"
                    },
                    401: {
                        description: "Authentication required"
                    },
                    502: {
                        description: "Gemini provider request failed"
                    },
                    503: {
                        description: "Gemini is unavailable or rate limited"
                    },
                    504: {
                        description: "Gemini request timed out"
                    }
                }
            }
        }
    }
};

module.exports = openApiSpec;
