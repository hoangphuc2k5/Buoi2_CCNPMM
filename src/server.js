import express from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import webRouter from './route/web';
import authRoutes from './route/auth';
import configViewEngine from './config/viewEngine';

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

configViewEngine(app);

// Fallback route to ensure /login resolves even if the web router is not loaded.
app.get('/login', (req, res) => res.render('login', {
    message: req.query.message || null,
    success: req.query.success === 'true',
    email: req.query.email || '',
}));

app.use('/', webRouter);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
