import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import cheerio from 'cheerio';
import qs from 'qs';
import asyncHandler from '../middlewares/asyncHandler';
import fixBaseURL from '../helpers/fixBaseURL';
import axios from '../helpers/axios';
import config from '../config';
import HttpError from '../models/HttpError';
import authFailed from '../helpers/authFailed';

const runTemplateRoute = Router();

runTemplateRoute.post('/', celebrate({
    [Segments.BODY]: {
        JSESSIONID: Joi.string(),
        templateID: Joi.number().integer().required(),
        oscarURL: Joi.string().uri().required(),
        queryString: Joi.string(),
    }
}, { abortEarly: false }), asyncHandler(async (req, res) => {
    try {
        const { JSESSIONID, templateID, queryString } = req.body;
        const data = {
            templateId: templateID,
            queryString: (config.ALLOW_ARBITRARY_QUERY && queryString) || config.QUERY_STRING,
        };

        const oscarURL = fixBaseURL(req.body.oscarURL);
        const oscarRes = await axios.post(oscarURL + '/oscarReport/reportByTemplate/GenerateReportAction.do',
            qs.stringify(data),
            {
                maxRedirects: 0,
                headers: {
                    Cookie: 'JSESSIONID=' + JSESSIONID, // authenticate request with oscar
                },
            }
        );

        const csv = parseResult(oscarRes.data);
        return res.json({ csv });
    } catch (e) {
        // Rethrow the HttpError that was thrown in try block
        if (e instanceof HttpError)
            throw e;

        if (e.response.status == 404)
            throw new HttpError(404, 'OSCAR was not found at the supplied URL');

        if (authFailed(e))
            throw new HttpError(401, 'Session invalid or expired');

        throw e;
    }
}));

function parseResult(html: string) {
    const $ = cheerio.load(html);
    const csv = $('input[type="hidden"][name="csv"]').attr('value');
    if (csv) return csv;

    const sqlErrorMessage = $('div.reportBorderDiv').text().trim();
    if (sqlErrorMessage) {
        throw new HttpError(422, 'Invalid SQL', sqlErrorMessage);
    }

    throw new HttpError(404, 'Incorrect template id, or the template was not found',
        {
            warning: $('div.warning').text(),
            reportTitle: $('div.reportTitle').text(),
        }
    );
}

export default runTemplateRoute;
