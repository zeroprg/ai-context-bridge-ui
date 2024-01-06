export interface Context {
    sessionId: string;
    name: string;
    lastUsed: Date;
    userId: string;
    documents: string[];
    conversationHistory: string; // Adjust according to the structure of your JSON array
    assistantRoleMessage: string;
}
  