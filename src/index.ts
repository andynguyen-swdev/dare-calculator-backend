import express, { json, urlencoded } from "express";
import cors from "cors";
import qs from "qs";
import asyncHandler from './middlewares/asyncHandler';
import HttpError from './models/HttpError';
import axios from './bootstrapping/axios';
import fixURL from './utils/fixURL';
import { errors, celebrate, Segments, Joi } from 'celebrate';

const app = express();
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cors());
app.options('*', cors());

app.post('/login', celebrate({
    [Segments.BODY]: {
        username: Joi.string().required(),
        password: Joi.string().required(),
        pin: Joi.string().required(),
        oscarURL: Joi.string().uri().required()
    }
}, { abortEarly: false }), asyncHandler(async (req, res) => {
    try {
        const { username, password, pin } = req.body;
        const data = qs.stringify({
            username,
            password,
            pin,
        });

        let oscarURL = fixURL(req.body.oscarURL);
        const oscarRes = await axios.post(oscarURL + '/login.do', data, {
            maxRedirects: 0
        });

        throw new HttpError(500, 'Unexpected response from oscar, your account might be blocked', oscarRes.data);
    } catch (e) {
        if (e instanceof HttpError || e.response.status != 302) {
            throw e;
        }

        if (e.response.headers.location == "index.jsp") {
            // Could be due to other reasons, not sure
            throw new HttpError(500, 'Wrong password');
        }

        const cookies: string[] = e.response.headers['set-cookie'];
        const jsessionIdCookie = cookies.find(val => val.startsWith('JSESSIONID'));
        if (jsessionIdCookie == null) {
            throw new HttpError(500, 'Unable to get JSESSIONID cookie');
        }

        const JSESSIONID = jsessionIdCookie.split(';')[0].split('=')[1];
        return res.json({ JSESSIONID });
    }
}));

app.use(errors()); // 'celebrate' lib error

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("App listening at port " + PORT));