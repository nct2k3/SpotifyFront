import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { GeminiApiService } from '../services/Gemini-chat/gemini-api.service';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-gemini-chat',
  templateUrl: './gemini-chat.component.html'
})
export class GeminiChatComponent implements AfterViewChecked {
  isOpen: boolean = false;
  inputValue: string = '';
  messages: Message[] = [
    {
      text: "Hi! I'm Gemini AI. How can I help you with your donation activities today?",
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
  }

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
  }

  handleSubmit(event: Event) {
    event.preventDefault();

    if (!this.inputValue.trim()) return;

    const userMessage: Message = {
      text: this.inputValue,
      isUser: true,
      timestamp: new Date()
    };

    this.messages = [...this.messages, userMessage];
    this.inputValue = '';
    this.isLoading = true;

    // Replace toPromise() with subscribe
    this.geminiApiService.getMessage(this.inputValue).subscribe({
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
          text: "Sorry, I couldn't process your request. Please try again.",
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