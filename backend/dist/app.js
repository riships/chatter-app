import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import chatRoutes from './routes/chat.routes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const createApp = () => {
    const app = express();
    // Middleware
    app.use(cors({ origin: config.CLIENT_ORIGIN }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // Static Assets serving client folder
    const clientPath = path.resolve(__dirname, '../../client');
    app.use(express.static(clientPath));
    // REST API Routes
    app.use(chatRoutes);
    // Fallback route serving frontend index.html
    app.get('/', (_req, res) => {
        res.sendFile(path.join(clientPath, 'index.html'));
    });
    return app;
};
export default createApp;
