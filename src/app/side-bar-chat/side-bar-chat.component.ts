import { Component, ElementRef, ViewChild, AfterViewChecked, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Conversation } from '../Models/chat.model';
import { WebSocketService } from '../services/Websocket/web-socket.service';

@Component({
  selector: 'app-side-bar-chat',
  templateUrl: './side-bar-chat.component.html',
  styleUrls: ['./side-bar-chat.component.css']
})
export class SideBarChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  isOpen: boolean = false;
  searchQuery: string = '';
  userId: string | null = '';
  username: string | null = '';
  email: string | null = '';
  
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  private chatSubscription: Subscription | null = null;

  @Output() conversationSelected = new EventEmitter<Conversation>();
  @ViewChild('conversationsEnd') conversationsEndRef!: ElementRef;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    
    if (this.userId) {
      this.loadConversations();
    }
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  loadConversations() {
    this.webSocketService.getUserChats().subscribe({
      next: (chats) => {
        // Transform chat data into conversation objects
        this.conversations = chats.map((chat: any) => {
          const otherUser = chat.participants.find((id: string) => id !== this.userId);
          const otherUserName = this.getUserName(otherUser) || 'Unknown User';
          
          return {
            id: chat.chat_id,
            name: otherUserName,
            profilePicture: undefined, // You might want to fetch user profiles separately
            lastMessage: chat.messages.length > 0 
              ? chat.messages[chat.messages.length - 1].content 
              : 'No messages yet',
            timestamp: chat.messages.length > 0 
              ? new Date(chat.messages[chat.messages.length - 1].timestamp) 
              : new Date(chat.created_at),
            unread: this.hasUnreadMessages(chat.messages),
            participants: chat.participants
          };
        });
        
        this.filteredConversations = [...this.conversations];
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
      }
    });
  }

  // Helper function to check for unread messages
  private hasUnreadMessages(messages: any[]): boolean {
    if (!messages.length) return false;
    
    // Check if the last message is from the other user and not read yet
    const lastMessage = messages[messages.length - 1];
    return lastMessage.sender !== this.userId;
  }

  // Helper function to get user name (placeholder - you'll need user data)
  private getUserName(userId: string): string {
    // In a real app, you might fetch user data from a service
    return `User ${userId}`;
  }

  handleSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    
    if (this.searchQuery.trim() === '') {
      this.filteredConversations = [...this.conversations];
    } else {
      this.filteredConversations = this.conversations.filter(conv => 
        conv.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    // Show initials or fallback avatar instead
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    if (this.conversationsEndRef) {
      this.conversationsEndRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return `${Math.floor(diffInMs / (1000 * 60))} phút`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ`;
    } else {
      return `${diffInDays} ngày`;
    }
  }

  selectConversation(conversation: Conversation) {
    // Mark conversation as read
    conversation.unread = false;
    
    // Emit event to parent component
    this.conversationSelected.emit(conversation);
    
    // Close sidebar after selection
    this.isOpen = false;
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}