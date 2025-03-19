import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongsService {
  private apiUrl = 'https://40733aaf-b85f-4031-9bd3-4c7699e98edf.mock.pstmn.io/songs'; 

  constructor(private http: HttpClient) {}

  getTrack(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => console.log('Songs data:', data))
    );
  }
}

