import { Component, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
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
  private messageSubscription: Subscription | null = null;

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('inputField') inputRef!: ElementRef;

  constructor(
    private geminiApiService: GeminiApiService,
    private webSocketService: WebSocketService
  ) {
    this.userId = localStorage.getItem('user_id');
  }

  ngOnInit() {
    // Subscribe to incoming WebSocket messages
    this.messageSubscription = this.webSocketService.getMessages().subscribe(
      (message: ChatMessage) => {
        console.log('New WebSocket message received in component:', message);
        
        // For messages to be displayed, either:
        // 1. The chat_id must match our current chatId, or
        // 2. For new conversations, our userId must be among participants
        
        // Skip messages for other chats
        if (this.chatId && message.chat_id !== this.chatId) {
          console.log('Message is for a different chat, ignoring');
          return;
        }
        
        // Prevent duplicate messages by checking if it already exists
        const messageExists = this.messages.some(m => 
          m.isUser === (message.sender === this.userId) && 
          m.text === message.message &&
          // Allow for small time differences (3 seconds)
          Math.abs(m.timestamp.getTime() - new Date(message.timestamp).getTime()) < 3000
        );
        
        if (!messageExists) {
          console.log('Adding new message to chat view');
          
          // Convert the WebSocket message to our Message format
          const newMessage: Message = {
            text: message.message,
            isUser: message.sender === this.userId,
            timestamp: new Date(message.timestamp)
          };
          
          // Add the message to our messages array
          this.messages = [...this.messages, newMessage];
          this.scrollToBottom();
        } else {
          console.log('Duplicate message detected, not adding to UI');
        }
      }
    );
  }

  ngOnDestroy() {
    // Clean up subscription when component is destroyed
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    
    // Disconnect WebSocket
    this.webSocketService.disconnect();
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
        // This is an existing conversation with a valid MongoDB ID
        // Set this as the active chat in the WebSocketService
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
    // Disconnect WebSocket when closing chat
    this.webSocketService.disconnect();
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
    
    // If we have a valid chat ID, send the message through the API
    // Don't add it to UI - it will come through WebSocket
    if (this.chatId && !this.chatId.startsWith('new-')) {
      this.sendMessageToChat(this.chatId, userPrompt);
    } else {
      // For new conversations, show message right away and then create chat
      // This is because new chats don't have WebSocket yet
      const userMessage: Message = {
        text: userPrompt,
        isUser: true,
        timestamp: new Date()
      };
      
      this.messages = [...this.messages, userMessage];
      
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
            }
          });
        }
      }
    }
  }

  private sendMessageToChat(chatId: string, message: string): void {
    console.log(`Sending message to chat ${chatId}: ${message}`);
    
    this.webSocketService.sendMessageHttp(chatId, message).subscribe({
      next: (response) => {
        console.log('Message sent successfully:', response);
        // No need to add to UI here, message will come through WebSocket
      },
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