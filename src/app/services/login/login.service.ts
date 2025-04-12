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
    localStorage.setItem('token', token);
    localStorage.setItem('user', user);
    localStorage.setItem('email', email);
    localStorage.setItem('user_id', user_id.toString());
  }

  // Hàm logout
  logout(): Observable<any> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    return this.http.post(`${this.baseUrl}/logout`, {});
  }
}
