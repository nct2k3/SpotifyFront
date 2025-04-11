import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service có thể dùng ở mọi nơi
})
export class LoginService {
  private baseUrl = 'http://127.0.0.1:8000/api/auth'; // URL của API
  private token: string = '';
  private user: string = '';
  private email: string = '';
  private userId: number = 0;

  constructor(private http: HttpClient) {}

  // Hàm login
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, credentials);
  }

  // Lưu thông tin đăng nhập
  setAuthData(token: string, user: string, email: string, user_id: number): void {
    this.token = token;
    this.user = user;
    this.email = email;
    this.userId = user_id;
  }

  // Lấy thông tin đăng nhập
  getAuthData(): { token: string; user: string; email: string, user_id: number } {
    return { token: this.token, user: this.user, email: this.email, user_id: this.userId };
  }

  // Hàm logout
  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }
}
