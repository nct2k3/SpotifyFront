import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private apiUrl = 'https://74653837-8b90-4060-bc25-272391e60ae4.mock.pstmn.io/album'; 

  constructor(private http: HttpClient) {}

  getAlbum(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => console.log('Songs data:', data))
    );
  }
}
