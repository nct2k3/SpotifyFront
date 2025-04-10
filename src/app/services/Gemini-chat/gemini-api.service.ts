import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private apiUrl = 'http://your-api-endpoint'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  getMessage(message: string): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/message`, { message });
  }
}