import { Component, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { WebSocketService } from '../services/Websocket/web-socket.service';
import { ChatMessage, Conversation } from '../Models/chat.model';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  sender: string;
}

@Component({
  selector: 'app-general-chat',
  templateUrl: './general-chat.component.html',
  styleUrls: ['./general-chat.component.css']
})
export class GeneralChatComponent implements AfterViewChecked, OnChanges, OnDestroy {
  @Input() selectedConversation: Conversation | null = null;
  @Output() close = new EventEmitter<void>();

  get isOpen(): boolean {
    return this.selectedConversation !== null;
  }

  inputValue: string = '';
  messages: Message[] = [];
  isLoading: boolean = false;
  private messageSubscription: Subscription | null = null;
  
  userId: string | null = '';
  otherUserId: string = '';

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('inputField') inputRef!: ElementRef;

  constructor(private webSocketService: WebSocketService) {
    this.userId = localStorage.getItem('user_id');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedConversation'] && this.selectedConversation) {
      this.isLoading = true;
      this.messages = [];
      
      // Clean up previous subscription
      if (this.messageSubscription) {
        this.messageSubscription.unsubscribe();
        this.webSocketService.disconnect();
      }
      
      // Find the other user in the conversation
      this.otherUserId = this.selectedConversation.participants.find(
        id => id !== this.userId
      ) || '';
      
      // Load chat history
      this.loadChatHistory();
      
      // Connect to WebSocket for this conversation
      if (this.userId && this.otherUserId) {
        this.webSocketService.connect(this.userId, this.otherUserId);
        
        // Subscribe to incoming messages
        this.messageSubscription = this.webSocketService.getMessages().subscribe(
          (data: ChatMessage) => {
            const newMessage: Message = {
              text: data.message,
              isUser: data.sender === this.userId,
              timestamp: new Date(data.timestamp),
              sender: data.sender
            };
            this.messages.push(newMessage);
          }
        );
      }
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  loadChatHistory() {
    if (!this.selectedConversation) return;
    
    this.webSocketService.getChatHistory(this.selectedConversation.id).subscribe({
      next: (data) => {
        // Process chat history
        this.messages = data.messages.map((msg: any) => ({
          text: msg.content,
          isUser: msg.sender === this.userId,
          timestamp: new Date(msg.timestamp),
          sender: msg.sender
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.isLoading = false;
        this.messages = [{
          text: 'Could not load chat history. Please try again.',
          isUser: false,
          timestamp: new Date(),
          sender: 'system'
        }];
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    if (this.isOpen && this.inputRef) {
      this.inputRef.nativeElement.focus();
    }
  }

  toggleChat() {
    this.close.emit(); // Emit close event to parent
  }

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.inputValue.trim()) return;

    const message = this.inputValue.trim();
    this.inputValue = '';
    
    // Send message through WebSocket
    this.webSocketService.sendMessage(message);
    
    // Optimistically add message to UI
    // The actual message will be added when received from WebSocket
    const userMessage: Message = {
      text: message,
      isUser: true,
      timestamp: new Date(),
      sender: this.userId || ''
    };
    
    this.messages.push(userMessage);
    
    // Update last message in conversation
    if (this.selectedConversation) {
      this.selectedConversation.lastMessage = message;
      this.selectedConversation.timestamp = new Date();
    }
  }

  private scrollToBottom() {
    if (this.messagesEndRef) {
      this.messagesEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}