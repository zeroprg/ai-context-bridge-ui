const BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const OAuthToken = localStorage.getItem('oauthToken');
export const API_URLS = {
    GetApiKeys: `${BASE_URL}/api/v1/keys/manage`,
    CreateApiKey: `${BASE_URL}/api/v1/keys/manage`,
    ViewAllProfiles: `${BASE_URL}/api/v1/client/profiles`,
    ViewClientProfile: (clientId: any) => `${BASE_URL}/api/v1/client/${clientId}/profile`,
    ManageClientProfile: `${BASE_URL}/api/v1/client/profile`,
    UpdateClientProfile: `${BASE_URL}/api/v1/client/profile`,
    CustomerQuery: `${BASE_URL}/api/v1/customer/query`,
    GetUserInfo: `${BASE_URL}/user/info`,
    SelectAPI: (apiKey: string) => `${BASE_URL}/user/selectAPI/${apiKey}`,
    AttachUserToClient: (userId: any, clientId: any) => `${BASE_URL}/user/${userId}/attach/${clientId}`,
    FindUserByEmail: `${BASE_URL}/user/findByEmail`,
    FindUserByName: `${BASE_URL}/user/findByName`,
    AssignRole: `${BASE_URL}/user/assignRole`
};
export const GOOGLE_AUTH={
    CLIENT_ID: process.env.REACT_APP_CLIENT_ID,
    REDIRECT_URI: process.env.REACT_APP_BACKEND_REDIRECT_URI
};
export const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID
;
export const BACKEND_REDIRECT_URI = process.env.REACT_APP_BACKEND_REDIRECT_URI;
