export interface ApiKey {
    keyId: string;
    keyValue: string;
    name: string;
    uri: string;
    homepage: string;
    userId: string;
    maxContextLength: number; // Max context length
    totalCost: number;
    publicAccessed: boolean;
    defaultKey: boolean;
    model: string;
    description: string;

  }