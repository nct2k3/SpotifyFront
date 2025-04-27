import { Component, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy, ChangeDetectorRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { GeminiApiService } from '../services/Gemini-chat/gemini-api.service';
import { Conversation, ChatMessage } from '../Models/chat.model';
import { WebSocketService } from '../services/Websocket/web-socket.service';
import { Subscription } from 'rxjs';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-general-chat',
  templateUrl: './general-chat.component.html',
  styleUrls: ['./general-chat.component.css'],
  // Use OnPush change detection for better performance
  changeDetection: ChangeDetectionStrategy.OnPush
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
  private messageSubscription: Subscription | null = null;
  private activeChatSubscription: Subscription | null = null;
  private connectionCheckInterval: any = null;

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('inputField') inputRef!: ElementRef;

  constructor(
    private geminiApiService: GeminiApiService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.userId = localStorage.getItem('user_id');
  }

  ngOnInit() {
    console.log('General chat component initialized');
    
    // Subscribe to incoming WebSocket messages
    this.messageSubscription = this.webSocketService.getMessages().subscribe(
      (message: ChatMessage) => {
        console.log('Message received in component:', message);
        
        // Run inside NgZone to ensure Angular knows about the update
        this.zone.run(() => {
          // Skip messages for other chats
          if (this.chatId && message.chat_id !== this.chatId) {
            console.log(`Message is for chat ${message.chat_id}, we're in ${this.chatId} - ignoring`);
            return;
          }
          
          // Simpler duplicate check with better timestamp handling
          const messageTimestamp = new Date(message.timestamp);
          const messageExists = this.messages.some(m => 
            m.isUser === (message.sender === this.userId) && 
            m.text === message.message &&
            Math.abs(m.timestamp.getTime() - messageTimestamp.getTime()) < 3000
          );
          
          if (!messageExists) {
            console.log('Adding new message to chat view');
            
            // Convert the WebSocket message to our Message format
            const newMessage: Message = {
              text: message.message,
              isUser: message.sender === this.userId,
              timestamp: messageTimestamp
            };
            
            // Add the message to our messages array
            this.messages = [...this.messages, newMessage];
            
            // Force change detection cycle
            this.cdr.detectChanges();
            
            // Ensure scrolling happens after view is updated
            setTimeout(() => this.scrollToBottom(), 0);
          } else {
            console.log('Duplicate message detected, not adding to UI');
          }
        });
      }
    );
    
    // Subscribe to active chat changes
    this.activeChatSubscription = this.webSocketService.getActiveChat().subscribe(
      (chatId) => {
        console.log('Active chat changed in service:', chatId);
        // We'll handle changes in ngOnChanges
      }
    );
    
    // Add a periodic connection check
    this.connectionCheckInterval = setInterval(() => {
      this.checkConnectionStatus();
    }, 10000);
  }

  ngOnDestroy() {
    console.log('General chat component destroyed');
    
    // Clean up subscriptions
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    
    if (this.activeChatSubscription) {
      this.activeChatSubscription.unsubscribe();
    }
    
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
  }

  private checkConnectionStatus() {
    if (this.chatId && !this.webSocketService.isSocketConnected()) {
      console.log('WebSocket connection lost. Reconnecting...');
      if (this.userId) {
        this.webSocketService.connect(this.userId, this.chatId);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedConversation'] && this.selectedConversation) {
      // Reset messages
      this.messages = [];
      this.isLoading = true;
      this.chatId = this.selectedConversation.id;
      
      console.log('Selected conversation changed:', this.selectedConversation);
      
      // Check if this is a new conversation
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
        this.cdr.detectChanges();
      } else {
        // This is an existing conversation with a valid MongoDB ID
        // Make sure we're connected to the correct WebSocket and set as active chat
        this.webSocketService.setActiveChat(this.selectedConversation.id);
        
        // Load chat history
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
        this.cdr.detectChanges();
        this.scrollToBottom();
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
        this.cdr.detectChanges();
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
    
    // Clear input immediately to prevent double-sending
    this.inputValue = '';
    
    // Add message to UI immediately for better user experience
    const userMessage: Message = {
      text: userPrompt,
      isUser: true,
      timestamp: new Date()
    };
    
    // Only add if not a duplicate
    const isDuplicate = this.messages.some(m => 
      m.isUser && m.text === userPrompt && 
      (new Date().getTime() - m.timestamp.getTime()) < 3000
    );
    
    if (!isDuplicate) {
      this.messages = [...this.messages, userMessage];
      this.cdr.detectChanges();
      this.scrollToBottom();
    }
    
    // If we have a valid chat ID, send the message through the API
    if (this.chatId && !this.chatId.startsWith('new-')) {
      this.sendMessageToChat(this.chatId, userPrompt);
    } else {
      // For new conversations, we need to create the chat first
      if (this.selectedConversation && typeof this.selectedConversation.id === 'string' && 
          this.selectedConversation.id.startsWith('new-')) {
        // Extract the user ID from the conversation ID (assuming format new-userId)
        const otherUserId = this.selectedConversation.id.substring(4);
        
        if (otherUserId) {
          this.webSocketService.createChat(otherUserId).subscribe({
            next: (newChat) => {
              console.log('New chat created:', newChat);
              // Update chat ID
              this.chatId = newChat.id;
              
              // Now send the message to the new chat
              this.sendMessageToChat(newChat.id, userPrompt);
              
              // Update the selected conversation with the new ID
              if (this.selectedConversation) {
                this.selectedConversation.id = newChat.id;
              }
              
              // Connect to WebSocket for this chat
              this.webSocketService.setActiveChat(newChat.id);
            },
            error: (error) => {
              console.error('Error creating chat:', error);
              // Show error in chat
              const errorMessage: Message = {
                text: 'Failed to create conversation. Please try again.',
                isUser: false,
                timestamp: new Date()
              };
              this.messages = [...this.messages, errorMessage];
              this.cdr.detectChanges();
            }
          });
        }
      }
    }
  }

  private sendMessageToChat(chatId: string, message: string): void {
    console.log(`Sending message to chat ${chatId}: ${message}`);
    
    // Try sending via WebSocket first (if connected)
    if (this.webSocketService.isSocketConnected()) {
      this.webSocketService.sendMessage(message);
    } else {
      // Fallback to HTTP API
      this.sendMessageViaHttp(chatId, message);
    }
  }

  private sendMessageViaHttp(chatId: string, message: string): void {
    this.webSocketService.sendMessageHttp(chatId, message).subscribe({
      next: (response) => {
        console.log('Message sent successfully via HTTP:', response);
        // Message should be added through the WebSocket broadcast or local feedback
      },
      error: (error) => {
        console.error('Error sending message via HTTP:', error);
        
        const errorMessage: Message = {
          text: 'Could not send message. Please try again later.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages = [...this.messages, errorMessage];
        this.cdr.detectChanges();
      }
    });
  }

  private scrollToBottom() {
    if (this.messagesEndRef) {
      try {
        this.messagesEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}