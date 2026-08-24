import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

// Load env variables
dotenv.config();

import apiRoutes from './routes';
import { initializeSocket } from './sockets/socket';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize real-time Socket.IO mapping
initializeSocket(httpServer);

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off for easier swagger/images loading in dev
  })
);

// 2. CORS setup supporting cookie transmission
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// 3. Parser Middlewares
app.use(express.json({ limit: '10mb' })); // Max payload for base64 uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. Rate Limiter to guard production API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// 5. Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CivicLink API Documentation',
      version: '1.0.0',
      description: 'AI-Powered Citizen Connect Platform REST API backend specs.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [path.join(__dirname, './routes/*.ts'), path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Base Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date() });
});

// 7. Mount Main API Router
app.use('/api', apiRoutes);

// 8. Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error Caught:', err);
  const status = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';
  return res.status(status).json({ error: message });
});

// 9. Startup Listener
httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` CivicLink Backend Server Online        `);
  console.log(` Port: ${PORT}                          `);
  console.log(` API Docs: http://localhost:${PORT}/api/docs `);
  console.log(`========================================`);
});

export default app;
