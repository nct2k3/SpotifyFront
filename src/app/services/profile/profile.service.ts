import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Users } from 'src/app/Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private baseUrl = 'http://127.0.0.1:8000/api/auth/users/';
  private userId: string = '';
  private token: string = '';

  constructor(private http: HttpClient) {
    this.userId = localStorage.getItem('user_id') || '';
    this.token = localStorage.getItem('token') || '';
  }

  // Lấy thông tin người dùng hiện tại
  getUserProfile(): Observable<Users> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`
    });
    return this.http.get<any>(`${this.baseUrl}${this.userId}/`, { headers }).pipe(
      map(data => ({
        id: data.id,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        created_at: new Date(data.date_joined || data.created_at)
      }))
    );
  }

  // Lấy danh sách tất cả người dùng
  getAllUsers(): Observable<Users[]> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`
    });

    return this.http.get<any>(this.baseUrl, { headers }).pipe(
      map(response => {
        console.log('API Response:', response);
        const users = Array.isArray(response) ? response : response.results || [];

        return users.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          created_at: new Date(user.date_joined || user.created_at)
        }));
      })
    );
  }

  // Nếu muốn lấy raw dữ liệu người dùng (không map lại)
  getUserProfiles(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`,
    });
    return this.http.get(`${this.baseUrl}${this.userId}/`, { headers });
  }
}
