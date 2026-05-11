import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import db from '../models/index';

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;
const REDIS_CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 2000;

const isBrowserFormRequest = (req) => {
    const contentType = req.headers['content-type'] || '';
    const accept = req.headers.accept || '';
    return contentType.includes('application/x-www-form-urlencoded') && accept.includes('text/html');
};

const redirectToLoginWithMessage = (res, message, email = '') => {
    const query = new URLSearchParams({
        message,
        success: 'false',
        email,
    });
    return res.redirect(`/login?${query.toString()}`);
};

const getRedisClient = (() => {
    let client;

    return () => {
        if (client) return client;

        const url = process.env.REDIS_URL;
        if (url) {
            client = createClient({ url });
        } else {
            client = createClient({
                socket: {
                    host: process.env.REDIS_HOST || '127.0.0.1',
                    port: Number(process.env.REDIS_PORT) || 6379,
                },
            });
        }

        client.on('error', (err) => {
            console.error('Redis client error:', err);
        });

        return client;
    };
})();

const ensureRedisConnected = async (client) => {
    if (!client.isOpen) {
        await Promise.race([
            client.connect(),
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Redis connect timeout')), REDIS_CONNECT_TIMEOUT_MS);
            }),
        ]);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            if (isBrowserFormRequest(req)) {
                return redirectToLoginWithMessage(res, 'Vui long nhap day du email va mat khau.', email || '');
            }
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            if (isBrowserFormRequest(req)) {
                return redirectToLoginWithMessage(res, 'He thong chua cau hinh token.', email);
            }
            return res.status(500).json({ message: 'Token secrets not configured.' });
        }

        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            if (isBrowserFormRequest(req)) {
                return redirectToLoginWithMessage(res, 'Tai khoan khong ton tai.', email);
            }
            return res.status(404).json({ message: 'User not found.' });
        }

        const passwordOk = await bcrypt.compare(password, user.password);
        if (!passwordOk) {
            if (isBrowserFormRequest(req)) {
                return redirectToLoginWithMessage(res, 'Sai mat khau.', email);
            }
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role || 'user' },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_EXPIRES_IN }
        );

        try {
            const redisClient = getRedisClient();
            await ensureRedisConnected(redisClient);
            await redisClient.set(`refresh_token:${user.id}`, refreshToken, {
                EX: REFRESH_TTL_SECONDS,
            });
        } catch (redisError) {
            // Avoid hanging login flow if Redis is unavailable in local/dev setup.
            console.error('Redis unavailable, skip storing refresh token:', redisError.message);
        }

        // Store tokens in HttpOnly cookies to reduce XSS exposure.
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        if (isBrowserFormRequest(req)) {
            return res.redirect(`/profile?email=${encodeURIComponent(user.email)}`);
        }

        return res.status(200).json({
            message: 'Login successful.',
            role: user.role || 'user',
            user: {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
            },
        });
    } catch (error) {
        console.error('login controller error:', error);
        if (isBrowserFormRequest(req)) {
            return redirectToLoginWithMessage(res, 'Loi server.', req.body?.email || '');
        }
        return res.status(500).json({ message: 'Server error.' });
    }
};

export default { login };
