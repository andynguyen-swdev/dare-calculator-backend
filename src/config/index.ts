let ALLOW_ARBITRARY_QUERY = true;
if (process.env.ALLOW_ARBITRARY_QUERY) {
    const opt = process.env.ALLOW_ARBITRARY_QUERY.trim().toLowerCase();
    ALLOW_ARBITRARY_QUERY = opt == "1" || opt == "true";
}

const config = {
    ALLOW_ARBITRARY_QUERY,
    PORT: process.env.PORT,
    QUERY_STRING: process.env.QUERY_STRING,
}

export default config;