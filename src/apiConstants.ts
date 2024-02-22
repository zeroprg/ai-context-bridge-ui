const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL;


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
    AssignRole: `${BASE_URL}/user/assignRole`,
    StoreContext: `${BASE_URL}/user/context/store`,
    GetContext: (sessionId: string) => `${BASE_URL}/user/context/${sessionId}`,
    GPTAssistantRoles: `${BASE_URL}/user/GPTAssistantRoles`,
    GPTAssistantRole: `${BASE_URL}/user/GPTAssistantRole`,
    SetGPTAssistantRole: `${BASE_URL}/user/setGPTAssistantRole`,   
    DeleteFileFromContext: (fileId: string) => `${BASE_URL}/user/context/deleteFile?fileId=${encodeURIComponent(fileId)}`,
    StripeCheckout: `${BASE_URL}/stripepayment/create-checkout-session`,
    //WsTransript: `${BASE_URL}/topic/transcription`,
    //WsAudio: `${WS_BASE_URL}/ws/audio`,
    HttpAudioTranscript: `${BASE_URL}/api/v1/transcription`,
    TTS: (voice: string) =>`${BASE_URL}/api/v1/tts?voice=${voice}`,

};

export const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
export const BACKEND_REDIRECT_URI = process.env.REACT_APP_BACKEND_REDIRECT_URI;