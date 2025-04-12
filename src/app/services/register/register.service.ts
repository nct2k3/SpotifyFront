import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private baseUrl = 'http://127.0.0.1:8000/api/auth/register/';

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
