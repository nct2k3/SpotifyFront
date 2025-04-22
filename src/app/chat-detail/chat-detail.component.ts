import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../services/Chat/chat.service';
import { WebSocketService } from '../services/webSocket/web-socket.service';
import { Message } from '../Models/message';


@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.component.html',
  styleUrls: ['./chat-detail.component.css']
})
export class ChatDetailComponent implements OnInit, OnDestroy {
  chatId: string = '';
  messages: Message[] = [];
  userId: string = localStorage.getItem('user_id') || '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private wsService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';
    this.loadChatDetails();
    this.wsService.connect(this.userId, this.chatId).subscribe({
      next: (message) => {
        this.messages.push(message);
      },
      error: (err) => {
        console.error('WebSocket error:', err);
      }
    });
  }

  loadChatDetails(): void {
    this.chatService.getChatDetail(this.chatId).subscribe({
      next: (data) => {
        this.messages = data.messages;
      },
      error: (err) => {
        console.error('Error fetching chat details:', err);
      }
    });
  }

  sendMessage(content: string): void {
    this.wsService.sendMessage(content);
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }
}