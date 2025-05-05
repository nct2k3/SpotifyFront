import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Import map cùng với tap
import { environment } from 'src/app/environment.prod';
import { User, UserReponse, UserCreate } from 'src/app/Models/user.model';
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/api/auth/users/`;
  private createUrl = `${environment.apiUrl}/api/auth/register/`;
  private apiUrlss = `${environment.apiUrl}/api`;

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
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlss}/password-reset/request/`, { email });
  }
  verifyPasswordReset(data: {
    email: string,
    code: string,
    new_password: string,
    new_password2: string
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrlss}/password-reset/verify/`, data);
  }
}
