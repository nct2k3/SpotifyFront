import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private baseUrl = `${environment.apiUrl}/api/auth/register/`;

  constructor(private http: HttpClient) {}

  register(payload: {
    username: string;
    password: string;
    password2: string;
    email: string;
    first_name: string;
    last_name: string;
  }): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }
}
