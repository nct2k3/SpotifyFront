// src/app/general-chat/general-chat.component.ts
import { Component, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { Conversation, ChatMessage } from '../Models/chat.model';
import { WebSocketService } from '../services/Websocket/web-socket.service';
import { Subscription } from 'rxjs';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  id?: string; // Add ID for deduplication
}

@Component({
  selector: 'app-general-chat',
  templateUrl: './general-chat.component.html',
  styleUrls: ['./general-chat.component.css']
})
export class GeneralChatComponent implements AfterViewChecked, OnChanges, OnInit, OnDestroy {
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
  isConnected: boolean = false;
  private processedMessageIds = new Set<string>(); // Track processed message IDs
  private messageSubscription: Subscription | null = null;

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('inputField') inputRef!: ElementRef;

  constructor(
    private webSocketService: WebSocketService
  ) {
    this.userId = localStorage.getItem('user_id');
  }

  ngOnInit(): void {
    // Subscribe to incoming messages
    this.messageSubscription = this.webSocketService.getMessages().subscribe(
      chatMessage => {
        this.handleIncomingMessage(chatMessage);
      }
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    
    // Disconnect WebSocket
    this.webSocketService.disconnect();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedConversation'] && this.selectedConversation) {
      // Reset messages and tracking
      this.messages = [];
      this.processedMessageIds.clear();
      this.isLoading = true;
      this.chatId = this.selectedConversation.id;
      
      console.log('Selected conversation changed:', this.selectedConversation);
      
      // Check if this is a new conversation that has just been created
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
        // This is an existing conversation with a valid ID, load chat history
        this.loadChatHistory(this.selectedConversation.id);
        
        // Connect to WebSocket for real-time updates
        if (this.userId) {
          this.isConnected = this.webSocketService.connect(this.userId, this.selectedConversation.id);
        }
      }
    }
  }

  private handleIncomingMessage(chatMessage: ChatMessage): void {
    console.log('Processing incoming message:', chatMessage);
    
    // Extract message ID and content
    const messageId = chatMessage.id || 
                     (chatMessage.content && chatMessage.timestamp ? 
                      `${chatMessage.content}-${chatMessage.timestamp}` : 
                      `${new Date().getTime()}`);
                      
    // Skip if we've already processed this message
    if (this.processedMessageIds.has(messageId)) {
      console.log('Skipping duplicate message:', messageId);
      return;
    }
    
    // Add to processed set
    this.processedMessageIds.add(messageId);
    
    // Extract data from various possible message formats
    const content = chatMessage.content || chatMessage.message || '';
    const sender = chatMessage.sender || '';
    const timestamp = chatMessage.timestamp || chatMessage.created_at || new Date().toISOString();
    
    // Convert to our message format
    const message: Message = {
      text: content,
      isUser: sender === this.userId,
      timestamp: new Date(timestamp),
      id: messageId
    };
    
    // Add to messages array
    this.messages = [...this.messages, message];
    
    // Scroll to bottom after a brief delay
    setTimeout(() => this.scrollToBottom(), 100);
    
    // Update conversation if this is from the current chat
    if (this.selectedConversation && 
        (chatMessage.chat === this.selectedConversation.id || 
         chatMessage.chat_id === this.selectedConversation.id)) {
      
      this.selectedConversation.lastMessage = content;
      this.selectedConversation.timestamp = new Date(timestamp);
    }
  }

  loadChatHistory(chatId: string): void {
    console.log(`Loading chat history for chat ID: ${chatId}`);
    
    this.webSocketService.getChatHistory(chatId).subscribe({
      next: (chatData) => {
        console.log('Chat history loaded:', chatData);
        
        if (chatData.messages && chatData.messages.length > 0) {
          // Convert chat messages to our Message format and add to processed IDs
          this.messages = chatData.messages.map((msg: any) => {
            const messageId = msg.id || `${msg.content}-${msg.timestamp}`;
            this.processedMessageIds.add(messageId);
            
            return {
              text: msg.content,
              isUser: msg.sender === this.userId,
              timestamp: new Date(msg.timestamp),
              id: messageId
            };
          });
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
        
        // Scroll to bottom after loading history
        setTimeout(() => this.scrollToBottom(), 100);
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
    // Disconnect WebSocket when closing chat
    this.webSocketService.disconnect();
    this.isConnected = false;
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
    this.inputValue = ''; // Clear input immediately

    // If we have a valid chat ID, send the message through the API
    if (this.chatId && !this.chatId.startsWith('new-')) {
      this.sendMessageToChat(this.chatId, userPrompt);
    } else {
      // For new conversations, simulate a response
      setTimeout(() => {
        const aiMessage: Message = {
          text: `I received your message: "${userPrompt}"`,
          isUser: false,
          timestamp: new Date()
        };
        this.messages = [...this.messages, aiMessage];

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
    
    // Try both WebSocket and HTTP for better reliability
    if (this.isConnected) {
      this.webSocketService.sendMessage(message);
    }
    
    // Always use HTTP as well
    this.webSocketService.sendMessageHttp(chatId, message).subscribe({
      error: (error) => {
        console.error('Error sending message:', error);
        
        const errorMessage: Message = {
          text: 'Could not send message. Please try again later.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages = [...this.messages, errorMessage];
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