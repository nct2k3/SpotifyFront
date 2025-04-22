import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { ChatMessage, Message } from 'src/app/Models/chat.model';
import { environment } from 'src/app/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private messageSubject = new Subject<ChatMessage>();
  private apiUrl = `${environment.apiUrl}/chat`; // Ví dụ: http://127.0.0.1:8000/api/chat
  private wsUrl = `${environment.wsUrl}/chat`; // Ví dụ: ws://127.0.0.1:8000/ws/chat

  constructor(private http: HttpClient) {}

  // Lấy header xác thực
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Token ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // Kết nối WebSocket
  connect(userId: string, chatWithId: string): Observable<any> {
    if (this.socket$) {
      this.socket$.complete(); // Đóng kết nối cũ nếu có
    }

    this.socket$ = webSocket(`${this.wsUrl}/${userId}/${chatWithId}/`);
    return this.socket$.asObservable().pipe(
      catchError(error => {
        console.error('WebSocket connection error:', error);
        return throwError(error);
      })
    );
  }

  // Nhận tin nhắn từ WebSocket
  getMessages(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  // Gửi tin nhắn qua WebSocket
  sendMessage(content: string): void {
    if (this.socket$ && this.socket$.closed === false) {
      this.socket$.next({ message: content });
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Ngắt kết nối WebSocket
  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }

  // Lấy lịch sử chat qua HTTP
  getChatHistory(chatId: string): Observable<any> {
    console.log(`Getting chat history for chat ID: ${chatId}`);
    return this.http.get(`${this.apiUrl}/${chatId}/`, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        console.log('Chat history response:', response);
        return response;
      }),
      catchError(this.handleError(`fetch chat ${chatId}`))
    );
  }

  // Lấy danh sách chat của người dùng
  getUserChats(): Observable<any> {
    console.log('Getting user chats with headers:', this.getAuthHeaders());
    return this.http.get(`${this.apiUrl}/`, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        console.log('Raw chats API response:', response);
        return response;
      }),
      catchError(this.handleError('fetch user chats'))
    );
  }

  // Tạo chat mới
  createChat(otherUserId: string): Observable<any> {
    console.log(`Creating chat with user ID: ${otherUserId}`);
    const payload = { receiver_id: String(otherUserId) };  // Chuyển thành chuỗi
    return this.http.post(`${this.apiUrl}/create/`, payload, { headers: this.getAuthHeaders() }).pipe(
        map(response => {
            console.log('New chat created:', response);
            return response;
        }),
        catchError(this.handleError('create chat'))
    );
}

  // Gửi tin nhắn qua HTTP (dự phòng nếu WebSocket không hoạt động)
  sendMessageHttp(chatId: string, content: string): Observable<any> {
    console.log(`Sending message via HTTP to chat ${chatId}: ${content}`);
    const payload = { content };
    return this.http.post(`${this.apiUrl}/${chatId}/messages/`, payload, { headers: this.getAuthHeaders() }).pipe(
      map(response => {
        console.log('Message sent successfully:', response);
        return response;
      }),
      catchError(this.handleError('send message'))
    );
  }

  // Xử lý lỗi HTTP
  private handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      console.error(`Error ${operation}:`, error);
      const message = error.error?.detail || error.message || 'An error occurred';
      return throwError(() => new Error(message));
    };
  }
}