"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const roles_routes_1 = __importDefault(require("./modules/roles/roles.routes"));
const categories_routes_1 = __importDefault(require("./modules/categories/categories.routes"));
const listings_routes_1 = __importDefault(require("./modules/listings/listings.routes"));
const stores_routes_1 = __importDefault(require("./modules/stores/stores.routes"));
const requests_routes_1 = __importDefault(require("./modules/requests/requests.routes"));
const offers_routes_1 = __importDefault(require("./modules/offers/offers.routes"));
const wholesale_routes_1 = __importDefault(require("./modules/wholesale/wholesale.routes"));
const transactions_routes_1 = __importDefault(require("./modules/transactions/transactions.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const logistics_routes_1 = __importDefault(require("./modules/logistics/logistics.routes"));
const trust_routes_1 = __importDefault(require("./modules/trust/trust.routes"));
const social_routes_1 = __importDefault(require("./modules/social/social.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const disputes_routes_1 = __importDefault(require("./modules/disputes/disputes.routes"));
const escrow_routes_1 = __importDefault(require("./modules/escrow/escrow.routes"));
const chat_routes_1 = __importDefault(require("./modules/chat/chat.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const createApp = () => {
    const app = (0, express_1.default)();
    // Universal CORS & Preflight handler (runs before anything else)
    app.use((req, res, next) => {
        const origin = req.headers.origin || '*';
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
        if (req.method === 'OPTIONS') {
            res.sendStatus(204);
            return;
        }
        next();
    });
    // Standard Middlewares
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    // Dynamic origin reflection: reflects requesting origin so Access-Control-Allow-Credentials works with https://www.dukaamionline.com
    const corsMiddleware = (0, cors_1.default)({
        origin: (_origin, callback) => {
            callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
    });
    app.use(corsMiddleware);
    app.options('*', corsMiddleware);
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Root & Health check endpoints (essential for Render / Cloud port scanners)
    app.get('/', (_req, res) => {
        res.status(200).json({
            status: 'UP',
            service: 'HUDI-SOFT CANONICAL API (Fududeeye App)',
            timestamp: new Date().toISOString(),
            launchMarket: 'Garoowe, Puntland, Somalia',
            version: '1.0.0',
        });
    });
    app.get('/health', (_req, res) => {
        res.status(200).json({
            status: 'UP',
            service: 'HUDI-SOFT CANONICAL API (Fududeeye App)',
            timestamp: new Date().toISOString(),
            launchMarket: 'Garoowe, Puntland, Somalia',
            version: '1.0.0',
        });
    });
    app.get('/healthz', (_req, res) => {
        res.status(200).send('OK');
    });
    // Canonical Versioned API Routes (/api/v1)
    const apiV1 = express_1.default.Router();
    apiV1.use('/auth', auth_routes_1.default);
    apiV1.use('/users', users_routes_1.default);
    apiV1.use('/roles', roles_routes_1.default);
    apiV1.use('/categories', categories_routes_1.default);
    apiV1.use('/listings', listings_routes_1.default);
    apiV1.use('/stores', stores_routes_1.default);
    apiV1.use('/requests', requests_routes_1.default);
    apiV1.use('/offers', offers_routes_1.default);
    apiV1.use('/wholesale', wholesale_routes_1.default);
    apiV1.use('/transactions', transactions_routes_1.default);
    apiV1.use('/payments', payments_routes_1.default);
    apiV1.use('/logistics', logistics_routes_1.default);
    apiV1.use('/trust', trust_routes_1.default);
    apiV1.use('/social', social_routes_1.default);
    apiV1.use('/admin', admin_routes_1.default);
    apiV1.use('/inventory', inventory_routes_1.default);
    apiV1.use('/disputes', disputes_routes_1.default);
    apiV1.use('/escrow', escrow_routes_1.default);
    apiV1.use('/chat', chat_routes_1.default);
    app.use('/api/v1', apiV1);
    // Error Handling Middleware
    app.use(errorHandler_1.errorHandler);
    return app;
};
exports.createApp = createApp;
exports.default = exports.createApp;
