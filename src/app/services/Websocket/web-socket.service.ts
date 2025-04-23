// src/app/services/Websocket/web-socket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject, map, of, catchError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChatMessage } from 'src/app/Models/chat.model';
import { environment } from 'src/app/environment';

// Define interfaces for API responses
interface ChatHistoryResponse {
  id?: string;
  messages?: any[];
  participants?: string[];
  created_at?: string;
  [key: string]: any; // Allow other properties
}

interface MessageResponse {
  id?: string;
  content?: string;
  sender?: string;
  chat?: string;
  timestamp?: string;
  [key: string]: any; // Allow other properties
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<ChatMessage>();
  private messageCache = new Set<string>(); // Cache to track message IDs
  private pingInterval: any = null;
  
  // Store the last connection parameters for reconnection
  private lastUserId: string | null = null;
  private lastChatId: string | null = null;
  
  constructor(private http: HttpClient) {}

  // Get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get chat history from API
  getChatHistory(chatId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log(`Getting chat history for chat ID: ${chatId}`);
    
    // Reset message cache when loading a new chat
    this.messageCache.clear();
    
    // Check if the chatId is in a valid format for MongoDB
    if (!this.isValidObjectId(chatId)) {
      console.log(`ID format not valid for MongoDB: ${chatId}`);
      const userId = localStorage.getItem('user_id') || '';
      return of({
        id: chatId,
        participants: [userId, 'unknown_user'],
        messages: [],
        created_at: new Date().toISOString()
      });
    }
    
    return this.http.get<any>(`${environment.apiUrl}/chat/${chatId}/`, { headers }).pipe(
      map((response: any) => {
        console.log('Chat history response:', response);
        
        // Add existing message IDs to cache
        if (response?.messages && Array.isArray(response.messages)) {
          response.messages.forEach((msg: any) => {
            if (msg.id) {
              this.messageCache.add(msg.id);
            }
          });
        }
        
        return response;
      }),
      catchError(error => {
        console.error(`Error fetching chat ${chatId}:`, error);
        // Return a mock response on error for testing purposes
        const userId = localStorage.getItem('user_id') || '';
        return of({
          id: chatId,
          participants: [userId, 'unknown_user'],
          messages: [],
          created_at: new Date().toISOString()
        });
      })
    );
  }

  // Get all chats for current user
  getUserChats(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    console.log('Getting user chats with headers:', headers);
    
    return this.http.get<any>(`${environment.apiUrl}/chat/`, { headers }).pipe(
      map((response: any) => {
        console.log('Raw chats API response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Check if response has a results property (common in REST APIs with pagination)
          if (Array.isArray(response.results)) {
            return response.results;
          }
        }
        
        // If we can't determine the format, return an empty array
        console.error('Unexpected response format from chats API:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching user chats:', error);
        // Return empty array on error
        return of([]);
      })
    );
  }

  // Create a new chat
  createChat(otherUserId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = { participant_id: otherUserId }; 
  
    console.log(`Creating chat with user ID: ${otherUserId} using POST method`);
    return this.http.post<any>(`${environment.apiUrl}/chat/`, payload, { headers }).pipe(
      map(response => {
        console.log('Create chat response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error creating chat:', error);
        const userId = localStorage.getItem('user_id') || '';
        return of({
          id: this.generateTempObjectId(),
          participants: [userId, otherUserId],
          messages: [],
          created_at: new Date().toISOString()
        });
      })
    );
  }

  // Connect to WebSocket
  connect(userId: string, chatId: string): boolean {
    // Store parameters for potential reconnection
    this.lastUserId = userId;
    this.lastChatId = chatId;
    
    // Properly close existing connection if one exists
    this.disconnect();
    
    if (!this.isValidObjectId(chatId)) {
      console.error(`Cannot connect WebSocket with invalid chat ID: ${chatId}`);
      return false;
    }
    
    try {
      // For production:
      // const wsUrl = `${environment.wsUrl}/ws/chat/${userId}/${chatId}/`;
      
      // For local testing:
      const wsUrl = `ws://127.0.0.1:8000/ws/chat/${userId}/${chatId}/`;
      
      console.log(`Connecting to WebSocket URL: ${wsUrl}`);
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established successfully');
        // Start ping interval to keep connection alive
        this.startPingInterval();
      };
      
      this.socket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          
          // Skip ping messages
          if (data.type === 'ping_response') {
            console.log('Received ping response');
            return;
          }
          
          // Extract message ID - try various possible structures
          let messageId;
          if (data.id) {
            messageId = data.id;
          } else if (data.message && data.message.id) {
            messageId = data.message.id;
          } else {
            // If no ID, generate one based on content and timestamp
            const content = data.content || data.message || '';
            const timestamp = data.timestamp || new Date().toISOString();
            messageId = `${content}-${timestamp}`;
          }
          
          // Check if this message is already processed
          if (messageId && !this.messageCache.has(messageId)) {
            // Add to cache and process message
            this.messageCache.add(messageId);
            this.messageSubject.next(data);
          } else {
            console.log('Skipping duplicate message:', messageId);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      // Set up automatic reconnection
      this.setupReconnection();
      
      return true;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      return false;
    }
  }
  
  // Setup reconnection logic
  private setupReconnection(): void {
    if (!this.socket) return;
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed with code:', event.code);
      
      // Clear ping interval
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      
      // Don't attempt to reconnect if this was an intentional closure (code 1000)
      if (event.code !== 1000) {
        console.log('Attempting to reconnect in 3 seconds...');
        setTimeout(() => {
          if (this.lastUserId && this.lastChatId) {
            this.connect(this.lastUserId, this.lastChatId);
          }
        }, 3000);
      }
    };
  }
  
  // Keep WebSocket connection alive with periodic pings
  private startPingInterval(): void {
    // Clear any existing interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    // Send a ping every 30 seconds to keep the connection alive
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }
  
  // Send message through WebSocket
  sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`Sending message via WebSocket: ${message}`);
      this.socket.send(JSON.stringify({ message }));
    } else {
      console.error('WebSocket is not connected');
      
      // Attempt to reconnect if socket is closed or closing
      if (this.socket && (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING)) {
        console.log('Socket is closed or closing, attempting to reconnect...');
        if (this.lastUserId && this.lastChatId) {
          this.connect(this.lastUserId, this.lastChatId);
          
          // Retry sending message after a short delay
          setTimeout(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              this.socket.send(JSON.stringify({ message }));
            }
          }, 1000);
        }
      }
    }
  }

  // Send message via HTTP API and handle local update for immediate display
  sendMessageHttp(chatId: string, message: string): Observable<any> {
    if (!this.isValidObjectId(chatId)) {
      console.error(`Cannot send message to invalid chat ID: ${chatId}`);
      return of({
        success: false, 
        error: 'Invalid chat ID format'
      });
    }
    
    const headers = this.getAuthHeaders();
    const userId = localStorage.getItem('user_id') || '';
    const payload = {
      content: message,
      chat_id: chatId
    };
    
    // Generate a unique ID for this message
    const tempId = this.generateTempObjectId();
    
    // Create local message for immediate display
    const localMessage: ChatMessage = {
      id: tempId,
      content: message,
      sender: userId,
      chat: chatId,
      chat_id: chatId,
      timestamp: new Date().toISOString()
    };
    
    // Add to cache to prevent duplicates
    this.messageCache.add(tempId);
    
    // Emit the message locally for immediate display
    this.messageSubject.next(localMessage);
    
    console.log(`Sending message via HTTP to chat ${chatId}: ${message}`);
    
    // Send message via HTTP
    return this.http.post<any>(`${environment.apiUrl}/chat/${chatId}/messages/`, payload, { headers }).pipe(
      map((response: any) => {
        console.log('Send message response:', response);
        
        // If the server returned a different ID, add it to the cache too
        if (response?.id && response.id !== tempId) {
          this.messageCache.add(response.id);
        }
        
        return response;
      }),
      catchError(error => {
        console.error('Error sending message with POST:', error);
        
        // For testing purposes, return the local message
        return of(localMessage);
      })
    );
  }
  
  // Close WebSocket connection
  disconnect(): void {
    // Clear ping interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      
      // Remove event handlers to prevent reconnection attempts
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      // Close with code 1000 (normal closure) to indicate intentional disconnect
      this.socket.close(1000, 'Intentional disconnect');
      this.socket = null;
    }
  }
  
  // Get messages as observable
  getMessages(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }
  
  // Helper method to check if a string is a valid MongoDB ObjectId
  private isValidObjectId(id: string): boolean {
    // MongoDB ObjectId is a 24-character hex string
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
  
  // Helper to generate a temporary ObjectId for development
  private generateTempObjectId(): string {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
    const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    return timestamp + machineId + processId + counter;
  }
}