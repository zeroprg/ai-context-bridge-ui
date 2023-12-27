import axios from 'axios';
import {API_URLS} from '../apiConstants';

export async function storeContext(contextName: string, documents: string[]): Promise<string> {
    const response = await axios.post(API_URLS.StoreContext, { name: contextName, documents: documents }, { withCredentials: true });
    return response.data; // Assuming the backend returns whole user object with contextId
}

export async function getContext(sessionId: string): Promise<string> {
    const response = await axios.get(API_URLS.GetContext(sessionId), { withCredentials: true });
    return response.data; // Assuming the backend returns an Context with sessionId (as primaryKey)
}

export async function queryIndex(indexId: string, query: string): Promise<any> {
    const response = await axios.post('/api/queryIndex', { indexId, query }, { withCredentials: true });
    return response.data; // Response data format depends on your backend implementation
}
