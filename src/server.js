import express from 'express';
import 'dotenv/config';
import webRouter from './route/web';
import configViewEngine from './config/viewEngine';

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configViewEngine(app);

app.use('/', webRouter);

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
