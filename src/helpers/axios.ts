import AxiosStatic from "axios";
import https from "https";
import http from "http";

const axios = AxiosStatic.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true
    }),
    httpAgent: new http.Agent({
        keepAlive: true
    }),
});


export default axios;