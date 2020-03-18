import { AxiosError } from 'axios';

export default function authFailed(e: AxiosError): boolean {
    const location: string = e.response!.headers.location;
    return location == 'index.jsp' || location.endsWith('logout.jsp');
}