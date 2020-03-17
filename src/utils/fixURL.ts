export default function fixURL(url: string) {
    while (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
    }
    return url;
}