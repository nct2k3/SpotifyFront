import { Component, ElementRef, ViewChild, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';
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
export class GeneralChatComponent implements AfterViewChecked {
  @Input() selectedConversation: Conversation | null = null; // Receive the selected conversation
  @Output() close = new EventEmitter<void>(); // Emit event when chat is closed

  isOpen: boolean = true; // Always open when the component is rendered
  inputValue: string = '';
  messages: Message[] = [
    {
      text: "Xin chào! Mình có thể giúp gì cho bạn hôm nay?",
      isUser: false,
      timestamp: new Date()
    }
  ];
  isLoading: boolean = false;

  @ViewChild('messagesEnd') messagesEndRef!: ElementRef;
  @ViewChild('inputField') inputRef!: ElementRef;

  constructor(private geminiApiService: GeminiApiService) {}

  ngAfterViewChecked() {
    this.scrollToBottom();
    if (this.isOpen && this.inputRef) {
      this.inputRef.nativeElement.focus();
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.close.emit(); // Emit close event when chat is closed
    }
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
      },
      error: (error) => {
        console.error('Error getting response from Gemini:', error);
        const errorMessage: Message = {
          text: "Xin lỗi, mình không thể xử lý yêu cầu. Bạn thử lại nhé!",
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