// auth.ts
import { BACKEND_REDIRECT_URI, CLIENT_ID } from './apiConstants';

let token: string | null = null;

export const initiateGoogleOAuth = () => {
    const redirectUri = encodeURIComponent(BACKEND_REDIRECT_URI || "not founded in .env file");
    const scope = encodeURIComponent('email');
    const state = generateRandomString();
    const nonce = generateRandomString();
    const client_id = CLIENT_ID + ".apps.googleusercontent.com";
    const oauth2Url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${client_id}&scope=${scope}&state=${state}&redirect_uri=${redirectUri}&nonce=${nonce}`;
    window.location.href = oauth2Url;
};

const generateRandomString = () => {
    return Math.random().toString(36).substring(2, 15);
};

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