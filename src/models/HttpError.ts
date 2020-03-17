export default class HttpError extends Error {
    public status: number;
    public extraData?: any;

    constructor(status: number, message: string, extraData?: any) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.extraData = extraData;
    }
}