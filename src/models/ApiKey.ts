export interface ApiKey {
    keyId: string,
    defaultKey: boolean,
    disabled: boolean,
    keyValue: string,
    name: string,
    uri: string,
    homepage: string,
    userId: string,
    maxContextLength: number, // Max context length
    totalCost: number,
    publicAccessed: boolean,
    model: string,
    description: string,
  }