import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject, map, of, catchError, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor(private http: HttpClient, private ngZone: NgZone) {
    this.userId = localStorage.getItem('user_id');
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getChatHistory(chatId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!this.isValidObjectId(chatId)) {
      return of({
        id: chatId,
        participants: [localStorage.getItem('user_id'), 'unknown_user'],
        messages: [],
        created_at: new Date().toISOString()
      });
    }
    return this.http.get(`${environment.apiUrl}/chat/${chatId}/`, { headers }).pipe(
      map(response => response),
      catchError(error => {
        return of({
          id: chatId,
          participants: [localStorage.getItem('user_id'), 'unknown_user'],
          messages: [],
          created_at: new Date().toISOString()
        });
      })
    );
  }

  getUserChats(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${environment.apiUrl}/chat/`, { headers }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object' && Array.isArray((response as any).results)) {
          return (response as any).results;
        }
        return [];
      }),
      catchError(() => of([]))
    );
  }

  createChat(otherUserId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const payload = { receiver_id: otherUserId };
    return this.http.post(`${environment.apiUrl}/chat/create/`, payload, { headers }).pipe(
      map(response => response),
      catchError(() => {
        return of({
          id: this.generateTempObjectId(),
          participants: [localStorage.getItem('user_id'), otherUserId],
          messages: [],
          created_at: new Date().toISOString()
        });
      })
    );
  }

  setActiveChat(chatId: string): void {
    this.activeChat.next(chatId);
    if (this.userId) {
      this.connect(this.userId, chatId);
    }
  }

  getActiveChat(): Observable<string> {
    return this.activeChat.asObservable();
  }

  connect(userId: string, chatId: string): void {
    if (!userId || !chatId) return;
    if (userId) this.userId = userId;
    this.disconnect();
    try {
      const wsUrl = `${environment.wsUrl}/ws/chat/${userId}/${chatId}/`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.sendPing();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Skip ping/pong messages
          if (data.type === 'ping' || data.type === 'pong') {
            return;
          }
          
          console.log('WebSocket message received:', data);
          
          // ALWAYS use ngZone.run to ensure Angular's change detection is triggered
          this.ngZone.run(() => {
            // Format and emit message
            const formattedMessage: ChatMessage = {
              message: data.message || data.content || '',
              sender: data.sender || data.user_id || '',
              chat_id: data.chat_id || chatId,
              timestamp: data.timestamp || new Date().toISOString()
            };
            
            console.log('Broadcasting message to subscribers:', formattedMessage);
            this.messageSubject.next(formattedMessage);
          });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      this.socket.onerror = () => {
        this.isConnected = false;
        this.attemptReconnect(userId, chatId);
      };

      this.socket.onclose = (event) => {
        this.isConnected = false;
        if (event.code !== 1000) {
          this.attemptReconnect(userId, chatId);
        }
      };
    } catch {
      this.isConnected = false;
      this.attemptReconnect(userId, chatId);
    }
  }

  private attemptReconnect(userId: string, chatId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    setTimeout(() => {
      this.connect(userId, chatId);
    }, delay);
  }

  private sendPing(): void {
    if (this.isSocketConnected()) {
      this.socket?.send(JSON.stringify({ type: 'ping' }));
      setTimeout(() => this.sendPing(), 30000);
    }
  }

  sendMessage(message: string): void {
    if (this.isSocketConnected()) {
      this.socket?.send(JSON.stringify({ message }));
    }
  }

  sendMessageHttp(chatId: string, message: string): Observable<any> {
    if (!this.isValidObjectId(chatId)) {
      return of({ success: false, error: 'Invalid chat ID format' });
    }
    const headers = this.getAuthHeaders();
    const payload = { content: message };
    return this.http.post(`${environment.apiUrl}/chat/${chatId}/messages/`, payload, { headers }).pipe(
      map(response => {
        const localMessage: ChatMessage = {
          message: message,
          sender: this.userId || '',
          chat_id: chatId,
          timestamp: new Date().toISOString()
        };
        this.ngZone.run(() => {
          this.messageSubject.next(localMessage);
        });
        return response;
      }),
      catchError(() => of({ success: false, error: 'Failed to send message' }))
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'User disconnected');
      this.socket = null;
      this.isConnected = false;
    }
  }

  getMessages(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  private generateTempObjectId(): string {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
    const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    return timestamp + machineId + processId + counter;
  }

  testWebSocketConnection(userId: string, chatId: string): void {
    this.connect(userId, chatId);
    setTimeout(() => {
      if (this.isSocketConnected()) {
        this.sendMessage('Test message sent at ' + new Date().toISOString());
      }
    }, 1000);
  }
}
