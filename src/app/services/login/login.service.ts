import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environment.prod';


@Injectable({
  providedIn: 'root', // Service có thể dùng ở mọi nơi
})
export class LoginService {
  private baseUrl = `${environment.apiUrl}/api/auth `; // URL của API

  constructor(private http: HttpClient) {}

  // Hàm login
  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/`, credentials);
  }

  // Lưu thông tin đăng nhập
  setAuthData(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', response.username);
    localStorage.setItem('email', response.email);
    localStorage.setItem('user_id', response.user_id.toString());
    if (response.is_staff.toString() == 'true') {
      localStorage.setItem('is_staff', response.is_staff.toString());
      localStorage.setItem('is_superuser', response.is_superuser.toString());
    }
  }

  // Hàm logout
  logout(): Observable<any> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_staff');
    localStorage.removeItem('is_superuser');
    return this.http.post(`${this.baseUrl}/logout`, {});
  }
}
