// src/app/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ChatMessage {
  type: string;
  sender_id: string;
  recipient_id?: string;
  content: string;
  timestamp: string;
}

export interface UserEvent {
  type: string;
  user_id: string;
  users: string[];
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket!: WebSocket;
  private userId: string = '';
  private username: string | null = null;

  private messageSubject = new Subject<ChatMessage>();
  private userEventSubject = new Subject<UserEvent>();
  
  constructor() { }
  
  // Kết nối tới server WebSocket
  
  public connect(userId: string): void {

    this.userId = userId;
    this.socket = new WebSocket(`ws://localhost:8001/ws/${userId}`);
    
    
    
    this.socket.onopen = (event) => {
      console.log('WebSocket đã kết nối:', event);
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Phân loại tin nhắn nhận được
      if (data.type === 'chat') {
        this.messageSubject.next(data as ChatMessage);
      } else if (data.type === 'user_joined' || data.type === 'user_left') {
        this.userEventSubject.next(data as UserEvent);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('Lỗi WebSocket:', error);
    };
    
    this.socket.onclose = (event) => {
      console.log('WebSocket đã đóng:', event);
    };
  }
  
  // Gửi tin nhắn qua WebSocket
  public sendMessage(content: string, recipientId?: string): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat',
        sender_id: this.userId,
        recipient_id: recipientId || '',
        content: content,
        timestamp: new Date().toISOString()
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket không ở trạng thái mở');
    }
  }
  
  // Lắng nghe tin nhắn chat
  public onMessage(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }
  
  // Lắng nghe sự kiện người dùng
  public onUserEvent(): Observable<UserEvent> {
    return this.userEventSubject.asObservable();
  }
  
  // Đóng kết nối WebSocket
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
  
  // Lấy ID của người dùng hiện tại
  public getCurrentUserId(): string {
    return this.userId;
  }
}