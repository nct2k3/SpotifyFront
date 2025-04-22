import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from 'src/app/Models/message';
import { Chat } from 'src/app/Models/chat';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://127.0.0.1:8000/api/chat/';
  private token: string = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  getChatList(): Observable<Chat[]> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`
    });
    return this.http.get<Chat[]>(this.apiUrl, { headers });
  }

  getChatDetail(chatId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`
    });
    return this.http.get<any>(`${this.apiUrl}${chatId}/`, { headers });
  }

  getMyMessages(): Observable<Message[]> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`
    });
    return this.http.get<Message[]>(`${this.apiUrl}messages/my/`, { headers });
  }

  createChat(receiverId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`
    });
    return this.http.post(`${this.apiUrl}create/`, { receiver_id: receiverId }, { headers });
  }
}