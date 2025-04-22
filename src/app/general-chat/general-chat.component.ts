import { Component, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { GeminiApiService } from '../services/Gemini-chat/gemini-api.service';
import { Conversation } from '../Models/chat.model';
import { WebSocketService } from '../services/Websocket/web-socket.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-general-chat',
  templateUrl: './general-chat.component.html',
  styleUrls: ['./general-chat.component.css']
})
export class GeneralChatComponent implements AfterViewChecked, OnChanges {
  @Input() selectedConversation: Conversation | null = null;
  @Output() close = new EventEmitter<void>();

  get isOpen(): boolean {
    return this.selectedConversation !== null;
  }

  inputValue: string = '';
  messages: Message[] = [];
  isLoading: boolean = false;
  userId: string | null = '';
  chatId: string | null = null;

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('inputField') inputRef!: ElementRef;

  constructor(
    private geminiApiService: GeminiApiService,
    private webSocketService: WebSocketService
  ) {
    this.userId = localStorage.getItem('user_id');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedConversation'] && this.selectedConversation) {
      // Reset messages
      this.messages = [];
      this.isLoading = true;
      this.chatId = this.selectedConversation.id;
      
      console.log('Selected conversation changed:', this.selectedConversation);
      
      // Check if this is a new conversation that has just been created
      // The ID should no longer start with 'new-' if it was properly created
      if (typeof this.selectedConversation.id === 'string' && this.selectedConversation.id.startsWith('new-')) {
        // This is a new conversation that hasn't been properly created yet
        this.messages = [
          {
            text: `Start a new conversation with ${this.selectedConversation.name}`,
            isUser: false,
            timestamp: new Date()
          }
        ];
        this.isLoading = false;
      } else {
        // This is an existing conversation with a valid MongoDB ID, load chat history
        this.loadChatHistory(this.selectedConversation.id);
      }
    }
  }

  loadChatHistory(chatId: string): void {
    console.log(`Loading chat history for chat ID: ${chatId}`);
    
    this.webSocketService.getChatHistory(chatId).subscribe({
      next: (chatData) => {
        console.log('Chat history loaded:', chatData);
        
        if (chatData.messages && chatData.messages.length > 0) {
          // Convert chat messages to our Message format
          this.messages = chatData.messages.map((msg: any) => ({
            text: msg.content,
            isUser: msg.sender === this.userId,
            timestamp: new Date(msg.timestamp)
          }));
        } else {
          // No messages yet
          this.messages = [
            {
              text: `Start your conversation with ${this.selectedConversation?.name}`,
              isUser: false,
              timestamp: new Date()
            }
          ];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.messages = [
          {
            text: 'Could not load chat history. Please try again later.',
            isUser: false,
            timestamp: new Date()
          }
        ];
        this.isLoading = false;
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
    this.close.emit(); // Close chat
  }

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.inputValue.trim() || !this.selectedConversation) return;

    const userPrompt = this.inputValue.trim();
    const userMessage: Message = {
      text: userPrompt,
      isUser: true,
      timestamp: new Date()
    };

    this.messages = [...this.messages, userMessage];
    this.inputValue = '';
    this.isLoading = true;

    // If we have a valid chat ID, send the message through the API
    if (this.chatId && !this.chatId.startsWith('new-')) {
      this.sendMessageToChat(this.chatId, userPrompt);
    } else {
      // For now, just simulate a response
      setTimeout(() => {
        const aiMessage: Message = {
          text: `I received your message: "${userPrompt}"`,
          isUser: false,
          timestamp: new Date()
        };
        this.messages = [...this.messages, aiMessage];
        this.isLoading = false;

        // Update conversation details
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = userPrompt;
          this.selectedConversation.timestamp = new Date();
          this.selectedConversation.unread = false;
        }
      }, 1000);
    }
  }

  private sendMessageToChat(chatId: string, message: string): void {
    console.log(`Sending message to chat ${chatId}: ${message}`);
    
    this.webSocketService.sendMessageHttp(chatId, message).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        
        // In a real app, the message might come back through the WebSocket
        // For now, let's simulate a response
        const aiMessage: Message = {
          text: `Message sent successfully. Waiting for reply...`,
          isUser: false,
          timestamp: new Date()
        };
        this.messages = [...this.messages, aiMessage];
        this.isLoading = false;

        // Update conversation details
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = message;
          this.selectedConversation.timestamp = new Date();
          this.selectedConversation.unread = false;
        }
      },
      error: (error) => {
        console.error('Error sending message:', error);
        
        const errorMessage: Message = {
          text: 'Could not send message. Please try again later.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages = [...this.messages, errorMessage];
        this.isLoading = false;
      }
    });
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