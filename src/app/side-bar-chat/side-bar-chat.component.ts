import { Component, ElementRef, ViewChild, AfterViewChecked, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Conversation } from '../Models/chat.model';
import { WebSocketService } from '../services/Websocket/web-socket.service';
import { ProfileService } from '../services/profile/profile.service';

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
  allUsers: any[] = [];
  private chatSubscription: Subscription | null = null;

  @Output() conversationSelected = new EventEmitter<Conversation>();
  @ViewChild('conversationsEnd') conversationsEndRef!: ElementRef;

  constructor(
    private webSocketService: WebSocketService,
    private profileService: ProfileService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    
    if (this.userId) {
      // First load users, then load conversations
      this.loadUsers();
    }
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  loadUsers() {
    this.profileService.getAllUsers().subscribe({
      next: (users) => {
        
        // Filter out the current user
        this.allUsers = users.filter((user: any) => user.id != this.userId);
        
        // Create conversation objects for each user
        const userConversations = this.allUsers.map((user: any) => {
          return {
            id: `new-${user.id}`, // Use a prefix to identify new conversations
            name: user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
            profilePicture: user.profile_picture || undefined,
            lastMessage: 'Start a new conversation',
            timestamp: new Date(),
            unread: false,
            participants: [this.userId as string, user.id]
          } as Conversation;
        });
        
        // Add these to the conversations list
        this.conversations = [...userConversations];
        this.filteredConversations = [...this.conversations];
        
        // Now load existing conversations
        this.loadConversations();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        
        // Create some sample users for development
        const sampleUsers = [
          { id: '2', username: 'TranNguyen', first_name: 'Tran', last_name: 'Nguyen' },
          { id: '3', username: 'NamHoang', first_name: 'Nam', last_name: 'Hoang' }
        ];
        
        this.allUsers = sampleUsers;
        
        // Create conversations from sample users
        const userConversations = sampleUsers.map((user) => {
          return {
            id: `new-${user.id}`,
            name: user.username,
            profilePicture: undefined,
            lastMessage: 'Start a new conversation',
            timestamp: new Date(),
            unread: false,
            participants: [this.userId as string, user.id]
          } as Conversation;
        });
        
        this.conversations = [...userConversations];
        this.filteredConversations = [...this.conversations];
        
        // Try to load conversations anyway
        this.loadConversations();
      }
    });
  }

  loadConversations() {
    this.webSocketService.getUserChats().subscribe({
      next: (chats) => {
        console.log('Chats API response:', chats);
        
        // Process existing chats
        const existingConversations = chats.map((chat: any) => {
          // Determine other user
          const otherUserId = chat.other_user_id || (
            chat.participants ? 
              chat.participants.find((id: string) => id !== this.userId) : 
              '2' // Fallback user ID
          );
          
          // Find other user info
          const otherUserInfo = this.allUsers.find((user: any) => user.id == otherUserId);
          
          // Get user name
          const otherUserName = otherUserInfo ? 
            otherUserInfo.username : 
            `User ${otherUserId}`;
          
          // Get last message
          let lastMessage = 'No messages yet';
          let messageTime = new Date();
          
          if (chat.last_message) {
            lastMessage = chat.last_message.content || chat.last_message.message || 'No content';
            messageTime = new Date(chat.last_message.timestamp || chat.created_at);
          }
          
          return {
            id: chat.id,
            name: otherUserName,
            profilePicture: otherUserInfo?.profile_picture,
            lastMessage: lastMessage,
            timestamp: messageTime,
            unread: chat.last_message ? chat.last_message.sender !== this.userId : false,
            participants: chat.participants || [this.userId as string, otherUserId]
          } as Conversation;
        });
        
        // Keep track of users we already have conversations with
        const existingUserIds = new Set(existingConversations.map((conv: Conversation) => 
          conv.participants.find((id: string) => id !== this.userId)));
        
        // Filter out new conversations for users we already have chats with
        const newUserConversations = this.conversations
          .filter((conv: Conversation) => typeof conv.id === 'string' && conv.id.startsWith('new-'))
          .filter((conv: Conversation) => {
            const otherUser = conv.participants.find((id: string) => id !== this.userId);
            return !existingUserIds.has(otherUser);
          });
        
        // Combine existing and new conversations
        this.conversations = [...existingConversations, ...newUserConversations];
        
        // Sort by timestamp (newest first)
        this.conversations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        this.filteredConversations = [...this.conversations];
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
        // Keep the user-based conversations we already created
        this.filteredConversations = [...this.conversations];
      }
    });
  }

  // Helper method to check if a conversation is new
  isNewConversation(conversation: Conversation): boolean {
    return typeof conversation.id === 'string' && conversation.id.startsWith('new-');
  }

  // Helper method to check if there are any existing conversations
  hasExistingConversations(): boolean {
    return this.filteredConversations.some(conv => !this.isNewConversation(conv));
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
      return `${Math.floor(diffInMs / (1000 * 60))} m`;
    } else if (diffInHours < 24) {
      return `${diffInHours} h`;
    } else {
      return `${diffInDays} d`;
    }
  }

  selectConversation(conversation: Conversation) {
    // Mark conversation as read
    conversation.unread = false;
    
    // If this is a new conversation, create a real chat first
    if (this.isNewConversation(conversation)) {
      const otherUserId = conversation.participants.find(id => id !== this.userId);
      
      if (!otherUserId) {
        console.error('Cannot determine the other user ID for this conversation');
        return;
      }
      
      console.log('Creating new chat with user:', otherUserId);
      
      // Create a new chat with the backend
      this.webSocketService.createChat(otherUserId).subscribe({
        next: (newChat) => {
          console.log('New chat created:', newChat);
          
          // Update the conversation with the real ID
          conversation.id = newChat.id;
          
          // Emit the event with the updated conversation
          this.conversationSelected.emit(conversation);
          
          // Close sidebar after selection
          this.isOpen = false;
        },
        error: (error) => {
          console.error('Failed to create new chat:', error);
          
          // For development, still emit the event with the temp ID
          this.conversationSelected.emit(conversation);
          this.isOpen = false;
        }
      });
    } else {
      // This is an existing conversation, simply emit the event
      this.conversationSelected.emit(conversation);
      
      // Close sidebar after selection
      this.isOpen = false;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}