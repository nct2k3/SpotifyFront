// src/app/Models/chat.model.ts
export interface Conversation {
  id: string;  // MongoDB ObjectId as string or temporary ID (new-* or temp-*)
  name: string;
  profilePicture?: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  participants: string[];
}

export interface Chat {
  id: string;
  sender: string;
  receiver: string;
  created_at: string;
  messages?: Message[];
  participants: string[];
}

export interface Message {
  id: string;
  chat: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  id?: string;
  chat?: string;
  chat_id?: string;
  sender?: string;
  content?: string;
  message?: string;  // Alternative field name for content
  timestamp?: string;
  created_at?: string; // Alternative field name for timestamp
  type?: string; // Type of message (e.g., 'ping', 'connection_established')
}