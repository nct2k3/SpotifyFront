import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service có thể dùng ở mọi nơi
})
export class LoginService {
  private baseUrl = 'https://api.example.com/auth'; // Thay bằng URL của API

  constructor(private http: HttpClient) {}

  // Hàm login
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  // Hàm logout
  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }
}
