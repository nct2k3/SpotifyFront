import { Component, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { GeminiApiService } from '../services/Gemini-chat/gemini-api.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Conversation {
  id: number;
  name: string;
  profilePicture?: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
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

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('inputField') inputRef!: ElementRef;

  constructor(private geminiApiService: GeminiApiService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedConversation'] && this.selectedConversation) {
      // Khi hội thoại thay đổi, reset hoặc tải tin nhắn cho người được chọn
      this.messages = [
        {
          text: `Xin chào! Bắt đầu trò chuyện với ${this.selectedConversation.name}!`,
          isUser: false,
          timestamp: new Date()
        }
      ];
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
    if (this.isOpen && this.inputRef) {
      this.inputRef.nativeElement.focus();
    }
  }

  toggleChat() {
    this.close.emit(); // Đóng chat
  }

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.inputValue.trim()) return;

    const userPrompt = this.inputValue.trim();
    const userMessage: Message = {
      text: userPrompt,
      isUser: true,
      timestamp: new Date()
    };

    this.messages = [...this.messages, userMessage];
    this.inputValue = '';
    this.isLoading = true;

    this.geminiApiService.getMessage(userPrompt).subscribe({
      next: (response) => {
        const aiMessage: Message = {
          text: response,
          isUser: false,
          timestamp: new Date()
        };
        this.messages = [...this.messages, aiMessage];
        this.isLoading = false;

        // Cập nhật lastMessage và timestamp trong selectedConversation
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = userPrompt;
          this.selectedConversation.timestamp = new Date();
          this.selectedConversation.unread = false;
        }
      },
      error: (error) => {
        console.error('Error getting response from Gemini:', error);
        const errorMessage: Message = {
          text: 'Xin lỗi, mình không thể xử lý yêu cầu. Bạn thử lại nhé!',
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