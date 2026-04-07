import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Route files
import authRoutes from './routes/authRoutes.js';
import turfRoutes from './routes/turfRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import errorHandler from './middleware/error.js';

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://turf.rumon.top',
  'https://admin.turf.rumon.top',
  'https://api.turf.rumon.top'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Log origin for debugging
    console.log('Incoming Origin:', origin);
    
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed by list or by subdomain pattern
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.rumon.top');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('CORS Blocked for Origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cookie']
};

// Enable CORS with options
app.use(cors(corsOptions));
// Handle preflight requests globally
app.options('*', cors(corsOptions));

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Disable to prevent conflicts with CORS
}));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
