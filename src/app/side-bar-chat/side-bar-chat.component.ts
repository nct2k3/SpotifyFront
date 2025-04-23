// src/app/side-bar-chat/side-bar-chat.component.ts
import { Component, ElementRef, ViewChild, AfterViewChecked, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Conversation } from '../Models/chat.model';
import { WebSocketService } from '../services/Websocket/web-socket.service';
import { ProfileService } from '../services/profile/profile.service';

interface UserProfile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
  [key: string]: any;
}

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
  allUsers: UserProfile[] = [];
  private chatSubscription: Subscription | null = null;
  private messageSubscription: Subscription | null = null;
  private refreshInterval: any = null;

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
      
      // Subscribe to new messages to update conversation list
      this.messageSubscription = this.webSocketService.getMessages().subscribe(message => {
        this.handleNewMessage(message);
      });
      
      // Setup periodic refresh of conversation list
      this.startRefreshInterval();
    }
  }
  
  // Start a periodic refresh of the conversation list
  private startRefreshInterval(): void {
    // Clear any existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Refresh conversation list every 30 seconds
    this.refreshInterval = setInterval(() => {
      if (this.isOpen) {
        console.log('Refreshing conversation list...');
        this.loadConversations();
      }
    }, 30000); // 30 seconds
  }

  // Handle a new message that arrives via WebSocket
  private handleNewMessage(message: any): void {
    console.log('Message received in sidebar:', message);
    
    // Find the conversation this message belongs to
    const conversationIndex = this.conversations.findIndex(
      conv => conv.id === (message.chat_id || message.chat)
    );
    
    if (conversationIndex >= 0) {
      // Update the conversation with new message info
      const updatedConversation = { ...this.conversations[conversationIndex] };
      updatedConversation.lastMessage = message.content || message.message || '';
      updatedConversation.timestamp = new Date(message.timestamp || message.created_at || new Date());
      updatedConversation.unread = message.sender !== this.userId;
      
      // Create a new array to trigger change detection
      const updatedConversations = [...this.conversations];
      updatedConversations[conversationIndex] = updatedConversation;
      
      // Sort by most recent message
      this.conversations = updatedConversations.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      
      // Update filtered conversations if search is active
      if (this.searchQuery.trim() !== '') {
        this.filterConversations();
      } else {
        this.filteredConversations = [...this.conversations];
      }
    } else {
      // If conversation not found, it might be a new conversation
      // Reload all conversations to get the latest
      console.log('Message for unknown conversation, reloading conversations...');
      this.loadConversations();
    }
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
    
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadUsers() {
    this.profileService.getAllUsers().subscribe({
      next: (response: any) => {
        console.log('Users API response:', response);
        
        // Handle different response formats
        let users: UserProfile[] = [];
        if (Array.isArray(response)) {
          users = response;
        } else if (response && typeof response === 'object') {
          // Check if response has a results property (common in REST APIs)
          if (response.results && Array.isArray(response.results)) {
            users = response.results;
          } else {
            // Convert object to array if needed
            users = Object.values(response);
          }
        }
        
        // Filter out the current user if users is an array
        if (Array.isArray(users)) {
          this.allUsers = users.filter((user: UserProfile) => user && user.id && user.id !== this.userId);
          
          // Create conversation objects for each user
          const userConversations = this.allUsers.map((user: UserProfile) => {
            return {
              id: `new-${user.id}`, // Use a prefix to identify new conversations (not an ObjectId yet)
              name: user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown User',
              profilePicture: user.profile_picture || undefined,
              lastMessage: 'Start a new conversation',
              timestamp: new Date(),
              unread: false,
              participants: [this.userId as string, user.id]
            } as Conversation;
          });
          
          // Add these user-based conversations to the existing ones
          this.conversations = [...userConversations];
          this.filteredConversations = [...this.conversations];
          
          // Now load conversations after users are loaded
          this.loadConversations();
        } else {
          console.error('Unexpected users data format:', response);
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadConversations() {
    this.webSocketService.getUserChats().subscribe({
      next: (response: any) => {
        console.log('Chats API response:', response);
        
        // Handle different response formats
        let chats = [];
        if (Array.isArray(response)) {
          chats = response;
        } else if (response && typeof response === 'object') {
          // Check if response has a results property (common in REST APIs)
          if (response.results && Array.isArray(response.results)) {
            chats = response.results;
          } else {
            // Convert object to array if needed
            chats = Object.values(response);
          }
        }
        
        // Process chats only if we have a valid array
        if (!Array.isArray(chats) || chats.length === 0) {
          console.log('No existing chats found');
          return;
        }
        
        // Transform chat data into conversation objects
        const existingConversations = chats.filter(Boolean).map((chat: any) => {
          // Safety checks
          if (!chat) {
            console.log('Invalid chat object: null or undefined');
            return null;
          }

          // Log the chat structure to understand what fields are available
          console.log('Chat structure:', JSON.stringify(chat, null, 2));
          
          // Determine the participants
          let participants: string[] = [];
          if (Array.isArray(chat.participants)) {
            participants = chat.participants;
          } else if (chat.other_user_id) {
            // If the API returns a different structure with other_user_id
            participants = [this.userId || '', chat.other_user_id];
          }
          
          if (participants.length === 0) {
            console.log('Chat has no participants:', chat);
            return null;
          }
          
          const otherUser = participants.find((id: string) => id !== this.userId) || '';
          const otherUserInfo = this.allUsers.find((user: UserProfile) => user.id == otherUser);
          
          // Determine the name of the other user
          const otherUserName = otherUserInfo ? 
            (otherUserInfo.username || `${otherUserInfo.first_name || ''} ${otherUserInfo.last_name || ''}`.trim() || 'Unknown User') : 
            `User ${otherUser || 'Unknown'}`;
          
          // Determine the last message
          let lastMessage = 'No messages yet';
          let messageTimestamp = chat.created_at ? new Date(chat.created_at) : new Date();
          
          if (Array.isArray(chat.messages) && chat.messages.length > 0) {
            const lastMsg = chat.messages[chat.messages.length - 1];
            lastMessage = lastMsg.content || lastMsg.message || 'No content';
            messageTimestamp = new Date(lastMsg.timestamp || lastMsg.created_at || messageTimestamp);
          } else if (chat.last_message) {
            // Some APIs might return the last message directly
            lastMessage = chat.last_message.content || chat.last_message.message || 'No content';
            messageTimestamp = new Date(chat.last_message.timestamp || chat.last_message.created_at || messageTimestamp);
          }
          
          return {
            id: chat.id || '', // Use the MongoDB ObjectID directly
            name: otherUserName,
            profilePicture: otherUserInfo?.profile_picture,
            lastMessage: lastMessage,
            timestamp: messageTimestamp,
            unread: this.hasUnreadMessages(chat.messages || [chat.last_message].filter(Boolean)),
            participants: participants
          } as Conversation;
        }).filter((conv: Conversation | null) => conv !== null) as Conversation[];
        
        // Merge existing conversations with user-based ones
        // First, filter out duplicates (users we already have conversations with)
        const existingParticipantSets = existingConversations.map((conv: Conversation) => 
          new Set(conv.participants.filter((p: string) => p !== this.userId)));
          
        const uniqueUserConversations = this.conversations
          .filter(conv => typeof conv.id === 'string' && conv.id.startsWith('new-'))
          .filter(conv => {
            const otherParticipant = conv.participants.find(p => p !== this.userId);
            return !existingParticipantSets.some((set: Set<string>) => otherParticipant && set.has(otherParticipant));
          });
          
        this.conversations = [...existingConversations, ...uniqueUserConversations];
        // Sort by timestamp (most recent first)
        this.conversations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        this.filteredConversations = [...this.conversations];
      },
      error: (error) => {
        console.error('Error loading conversations:', error);
      }
    });
  }

  // Helper function to check for unread messages
  private hasUnreadMessages(messages: any[]): boolean {
    if (!messages || !messages.length) return false;
    
    // Check if the last message is from the other user and not read yet
    const lastMessage = messages[messages.length - 1];
    return lastMessage && lastMessage.sender !== this.userId;
  }

  // Helper method to check if a conversation is new (for template use)
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
    this.filterConversations();
  }
  
  filterConversations() {
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
      return `${Math.floor(diffInMs / (1000 * 60))} min`;
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
          
          // If we got a chat back (either from the API or the mock)
          if (newChat) {
            // Update the conversation with the real ID
            conversation.id = newChat.id || `temp_${Date.now()}`;
            
            // Emit the event with the updated conversation
            this.conversationSelected.emit(conversation);
            
            // Close sidebar after selection
            this.isOpen = false;
          }
        },
        error: (error) => {
          console.error('Failed to create new chat:', error);
          
          // For development, we'll still emit the event with a temporary ID
          conversation.id = `temp_${Date.now()}`;
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
    
    // When opening the chat sidebar, refresh the conversation list
    if (this.isOpen && this.userId) {
      this.loadConversations();
    }
  }
}