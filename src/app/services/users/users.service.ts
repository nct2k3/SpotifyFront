import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Import map cùng với tap
import { User, UserReponse, UserCreate } from 'src/app/Models/user.model';
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = 'http://127.0.0.1:8000/api/auth/users/';
  private createUrl = 'http://127.0.0.1:8000/api/auth/register/';

  constructor(private http: HttpClient) {}
  getTrack(): Observable<any[]> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    return this.http.get<any>(this.apiUrl, {headers}).pipe(
      map(data => data.results || data) 
    );
  }

  createUser(user: UserCreate): Observable<UserCreate> {
    return this.http.post<UserCreate>(`${this.createUrl}`, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user, {headers});
  }
}
