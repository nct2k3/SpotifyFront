import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private baseUrl = 'http://127.0.0.1:8000/api/auth/users/';
  private userId: string = '';
  private token: string = 'd1f5240d67f8550f4872697af9455c06afafd128';

  constructor(private http: HttpClient) {
    this.userId = localStorage.getItem('user_id') || '';
   // this.token = localStorage.getItem('token') || '';
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Token ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  // Lấy thông tin người dùng
  getUserProfile(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}${this.userId}/`, { headers });
  }

  // Lấy tất cả người dùng
  getAllUsers(): Observable<any> {
    const headers = this.getHeaders();

    return this.http.get(this.baseUrl, { headers }).pipe(
      map(response => {


        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          // Check if response has a results property (common in REST APIs with pagination)
          if (Array.isArray((response as any).results)) {
            return (response as any).results;
          }
        }

        // If we can't determine the format, return an empty array
        console.error('Unexpected response format from users API:', response);
        return [];
      })
    );
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
