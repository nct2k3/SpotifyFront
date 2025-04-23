import { Injectable } from '@angular/core';
import { Observable, Subject, map, of, catchError, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChatMessage } from 'src/app/Models/chat.model';
import { environment } from 'src/app/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<ChatMessage>();
  private activeChat = new BehaviorSubject<string>('');
  private userId: string | null = null;
  
  constructor(private http: HttpClient) {
    this.userId = localStorage.getItem('user_id');
  }

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
    
    // Check if the chatId is in a valid format for MongoDB
    if (!this.isValidObjectId(chatId)) {
      console.log(`ID format not valid for MongoDB: ${chatId}`);
      return of({
        id: chatId,
        participants: [localStorage.getItem('user_id'), 'unknown_user'],
        messages: [],
        created_at: new Date().toISOString()
      });
    }
    
    return this.http.get(`${environment.apiUrl}/chat/${chatId}/`, { headers }).pipe(
      map(response => {
        console.log('Chat history response:', response);
        return response;
      }),
      catchError(error => {
        console.error(`Error fetching chat ${chatId}:`, error);
        // Return a mock response on error for testing purposes
        return of({
          id: chatId,
          participants: [localStorage.getItem('user_id'), 'unknown_user'],
          messages: [],
          created_at: new Date().toISOString()
        });
      })
    );
  }

  // Get all chats for current user
  getUserChats(): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('Getting user chats with headers:', headers);
    
    return this.http.get(`${environment.apiUrl}/chat/`, { headers }).pipe(
      map(response => {
        console.log('Raw chats API response:', response);
        
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Check if response has a results property (common in REST APIs with pagination)
          if (Array.isArray((response as any).results)) {
            return (response as any).results;
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

  // Create a new chat - using GET instead of POST based on the API error
  createChat(otherUserId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = { receiver_id: otherUserId }; // Match your API's expected format
  
    console.log(`Creating chat with user ID: ${otherUserId} using POST method`);
    return this.http.post(`${environment.apiUrl}/chat/create/`, payload, { headers }).pipe(
      map(response => {
        console.log('Create chat response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Error creating chat:', error);
        return of({
          id: this.generateTempObjectId(),
          participants: [localStorage.getItem('user_id'), otherUserId],
          messages: [],
          created_at: new Date().toISOString()
        });
      })
    );
  }

  // Set active chat ID
  setActiveChat(chatId: string): void {
    this.activeChat.next(chatId);
    this.connect(this.userId || '', chatId);
  }

  // Get active chat ID as observable
  getActiveChat(): Observable<string> {
    return this.activeChat.asObservable();
  }

  // Connect to WebSocket
  connect(userId: string, chatId: string): void {
    // Close existing connection if any
    this.disconnect();
    
    if (!userId || !chatId) {
      console.error('Cannot connect WebSocket: missing userId or chatId');
      return;
    }
    
    try {
      // Format the WebSocket URL based on your Django Channels routing
      // This should match the route in your routing.py
      const wsUrl = `${environment.wsUrl}/ws/chat/${userId}/${chatId}/`;
      
      console.log(`Connecting to WebSocket URL: ${wsUrl}`);
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
      };
      
      this.socket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          
          // Log message details for debugging
          console.log('Message details:', {
            sender: data.sender,
            currentUser: this.userId,
            chatId: data.chat_id,
            activeChat: this.activeChat.getValue()
          });
          
          // Always emit the message to messageSubject, regardless of active chat
          // The components will filter based on their needs
          this.messageSubject.next(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }
  
  // Send message through WebSocket
  sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log(`Sending message via WebSocket: ${message}`);
      // Format the message as expected by your Django Channels ChatConsumer
      this.socket.send(JSON.stringify({ 
        message: message 
      }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Send message via HTTP API
  sendMessageHttp(chatId: string, message: string): Observable<any> {
    if (!this.isValidObjectId(chatId)) {
      console.error(`Cannot send message to invalid chat ID: ${chatId}`);
      return of({
        success: false, 
        error: 'Invalid chat ID format'
      });
    }
    
    const headers = this.getAuthHeaders();
    const payload = {
      content: message
    };
    
    console.log(`Sending message via HTTP to chat ${chatId}: ${message}`);
    
    return this.http.post(`${environment.apiUrl}/chat/${chatId}/messages/`, payload, { headers }).pipe(
      map(response => {
        console.log('Send message response:', response);
        // Don't manually emit a message here - wait for WebSocket
        return response;
      }),
      catchError(error => {
        console.error('Error sending message with POST:', error);
        
        // For testing purposes, return a mock success response
        return of({
          success: false,
          error: 'Failed to send message'
        });
      })
    );
  }
  
  // Close WebSocket connection
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting WebSocket');
      this.socket.close();
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
  
  /**
   * This function can be used for testing WebSocket connections
   */
  testWebSocketConnection(userId: string, chatId: string): void {
    console.log('Testing WebSocket connection');
    
    // Connect to WebSocket
    this.connect(userId, chatId);
    
    // Wait for connection to establish
    setTimeout(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket connection successful, sending test message');
        // Send a test message
        this.sendMessage('Test message sent at ' + new Date().toISOString());
      } else {
        console.error('WebSocket connection failed or not ready');
      }
    }, 1000);
  }
}