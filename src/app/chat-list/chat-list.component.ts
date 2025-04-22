import { Component, OnInit } from '@angular/core';
import { Chat } from '../Models/chat';
import { ChatService } from '../services/Chat/chat.service';


@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit {
  chats: Chat[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getChatList().subscribe({
      next: (data) => {
        this.chats = data;
      },
      error: (err) => {
        console.error('Error fetching chats:', err);
      }
    });
  }
}