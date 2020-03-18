import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import qs from 'qs';
import asyncHandler from '../middlewares/asyncHandler';
import fixBaseURL from '../helpers/fixBaseURL';
import axios from '../helpers/axios';
import HttpError from '../models/HttpError';
import authFailed from '../helpers/authFailed';

const loginRoute = Router();
loginRoute.post('/', celebrate({
    [Segments.BODY]: {
        username: Joi.string().required(),
        password: Joi.string().required(),
        pin: Joi.string().required(),
        oscarURL: Joi.string().uri().required(),
    }
}, { abortEarly: false }), asyncHandler(async (req, res) => {
    try {
        const { username, password, pin } = req.body;
        const data = qs.stringify({
            username,
            password,
            pin,
        });

        const oscarURL = fixBaseURL(req.body.oscarURL);
        const oscarRes = await axios.post(oscarURL + '/login.do', data, {
            maxRedirects: 0
        });

        throw new HttpError(401, 'Unexpected response from oscar, your account might be blocked', oscarRes.data);
    } catch (e) {
        // Rethrow the HttpError that was thrown in try block
        if (e instanceof HttpError)
            throw e;

        // Wrong oscar url
        if (e.response.status == 404)
            throw new HttpError(404, 'OSCAR was not found at the supplied URL');

        // If not redirected then something is really wrong
        if (e.response.status != 302)
            throw e;

        // When redirected back to index page, login probably failed
        if (authFailed(e)) {
            // Could be due to other reasons, not sure
            throw new HttpError(401, 'Wrong username, password or pin');
        }

        const cookies: string[] = e.response.headers['set-cookie'];
        const jsessionIdCookie = cookies.find(val => val.startsWith('JSESSIONID'));
        if (jsessionIdCookie == null) {
            throw new HttpError(500, 'Unable to get JSESSIONID cookie', { cookies });
        }

        const JSESSIONID = jsessionIdCookie.split(';')[0].split('=')[1];
        return res.json({ JSESSIONID });
    }
}));

export default loginRoute;