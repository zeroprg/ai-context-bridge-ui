// auth.ts


let token: string | null = null;

export const setToken = (newToken: string): void => {
    token = newToken;
};

export const getToken = (): string | null => {
    return token || getCookie('token');
};

export const getCookie = (name: string): string | null => {
    const cookieArray = document.cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        const cookiePair = cookieArray[i].trim().split('=');
        if (cookiePair[0] === name) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
};

export const setCookie = (name: string, value: string, days: number): void => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value}${expires}; path=/`;
};

export const setJSESSIONID = (): void => {
    const sessionId = getCookie('sessionId');
    if (sessionId) {
        // Set the sessionId as JSESSIONID for further requests
        setCookie('JSESSIONID', sessionId, 1); // 1 day expiry, adjust as needed
    }
};

setJSESSIONID();