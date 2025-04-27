// src/app/components/chat/chat.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService, ChatMessage, UserEvent } from '../services/genaralWebsocket/genaralWebsocket';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  userId: string = '';
  messages: ChatMessage[] = [];
  newMessage: string = '';
  activeUsers: string[] = [];
  selectedUser: string = '';
  username: string | null = '';


  private messageSubscription!: Subscription;
  private userEventSubscription!: Subscription;
  
  constructor(private websocketService: WebsocketService) { }
  
  ngOnInit(): void {
    this.username = localStorage.getItem('user');
    if (this.username) {
      this.userId = this.username ;
      this.connectWebSocket();
    }
  }
  
  connectWebSocket(): void {
    this.websocketService.connect(this.userId);
    
    // Đăng ký lắng nghe tin nhắn
    this.messageSubscription = this.websocketService.onMessage().subscribe(
      (message: ChatMessage) => {
        this.messages.push(message);
      }
    );
    
    // Đăng ký lắng nghe sự kiện người dùng
    this.userEventSubscription = this.websocketService.onUserEvent().subscribe(
      (event: UserEvent) => {
        this.activeUsers = event.users.filter(user => user !== this.userId);
        
        // Hiển thị thông báo về người dùng tham gia/rời đi
        if (event.type === 'user_joined') {
          console.log(`Người dùng ${event.user_id} đã tham gia`);
        } else if (event.type === 'user_left') {
          console.log(`Người dùng ${event.user_id} đã rời đi`);
          
          // Nếu người dùng đang trò chuyện với rời đi, đặt lại người dùng đã chọn
          if (this.selectedUser === event.user_id) {
            this.selectedUser = '';
          }
        }
      }
    );
  }
  
  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.websocketService.sendMessage(this.newMessage, this.selectedUser);
      
  
      const message: ChatMessage = {
        type: 'chat',
        sender_id: this.userId,
        recipient_id: this.selectedUser,
        content: this.newMessage,
        timestamp: new Date().toISOString()
      };
      this.messages.push(message);
      
      this.newMessage = '';
    }
  }
  
  selectUser(userId: string): void {
    this.selectedUser = userId;
  }
  
  isMyMessage(message: ChatMessage): boolean {
    return message.sender_id === this.userId;
  }
  
  isRelevantMessage(message: ChatMessage): boolean {

    
    if (!this.selectedUser) {
      return !message.recipient_id || message.recipient_id === '';
    }
    
    return (
      (message.sender_id === this.userId && message.recipient_id === this.selectedUser) ||
      (message.sender_id === this.selectedUser && message.recipient_id === this.userId)
    );
  }
  
  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.userEventSubscription) {
      this.userEventSubscription.unsubscribe();
    }
    
    // Đóng kết nối WebSocket
    this.websocketService.disconnect();
  }
}