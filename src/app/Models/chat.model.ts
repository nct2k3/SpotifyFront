export interface Conversation {
  id: string;  // This is a MongoDB ObjectId or a temporary "new-{userId}" format
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
  id?: string;
  chat?: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  message: string;
  sender: string;
  chat_id: string;
  timestamp: string;
}