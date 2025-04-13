import { Component, ElementRef, ViewChild, AfterViewChecked, EventEmitter, Output } from '@angular/core';

interface Conversation {
  id: number;
  name: string;
  profilePicture?: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
}

@Component({
  selector: 'app-side-bar-chat',
  templateUrl: './side-bar-chat.component.html',
  styleUrls: ['./side-bar-chat.component.css']
})
export class SideBarChatComponent implements AfterViewChecked {
  isOpen: boolean = false;
  searchQuery: string = '';
  selectedConversation: Conversation | null = null; // Track the selected conversation

  conversations: Conversation[] = [
    {
      id: 1,
      name: 'Hằng Mai',
      profilePicture: 'https://example.com/hangmai.jpg',
      lastMessage: 'Bạn: ❤️',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: false
    },
    {
      id: 2,
      name: 'Nhí sư đệ',
      lastMessage: 'Thì đỏ. ❤️',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unread: true
    },
    {
      id: 3,
      name: 'Nhien Nguyen',
      profilePicture: 'https://example.com/nhiennguyen.jpg',
      lastMessage: 'Bạn: đã bốc xương',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      unread: false
    },
    {
      id: 4,
      name: 'Nguyen Khanh',
      lastMessage: 't xem voi',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: true
    },
    {
      id: 5,
      name: 'Ban Căn sự các lớp K19 - K...',
      profilePicture: 'https://example.com/group.jpg',
      lastMessage: 'DCT1221 - Trận Gia Ngu...',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unread: false
    },
    {
      id: 6,
      name: 'Lê Minh Thuận',
      profilePicture: 'https://example.com/leminhthuan.jpg',
      lastMessage: 'oke chưa nè, cảm ơn nha',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      unread: false
    }
  ];
  username: string | null = '';
  email: string | null = '';
  userId: string | null = '';

  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
  }

  @ViewChild('conversationsEnd') conversationsEndRef!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  handleSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
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
  @Output() conversationSelected = new EventEmitter<Conversation>();

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation; // Lưu hội thoại được chọn
    this.conversationSelected.emit(conversation); // Phát sự kiện
    this.isOpen = false; // Đóng sidebar sau khi chọn
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen && !this.selectedConversation) {
      this.selectedConversation = null; // Chỉ reset nếu không có hội thoại được chọn
    }
  }
  

}