import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl = 'http://127.0.0.1:8000/api/auth/users/';
  private userId: string = '';
  private token: string = '';

  constructor(private http: HttpClient) {
    this.userId = localStorage.getItem('user_id') || '';
    this.token = localStorage.getItem('token') || '';
  }

  // Lấy thông tin người dùng
  getUserProfile(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`,
    });

    return this.http.get(`${this.baseUrl}${this.userId}/`, { headers });
  }
   // Cập nhật thông tin người dùng
   updateUserProfile(updatedProfile: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Token ${this.token}`,
      'Content-Type': 'application/json',
    });
  
   // console.log('Token gửi đi:', this.token);
  
    return this.http.put(`${this.baseUrl}${this.userId}/`, updatedProfile, { headers });
  }
 
  

}