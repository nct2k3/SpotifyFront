import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongsService {
  private apiUrl = 'https://9e279ba3-83b0-4fdb-b1a2-4c891154f83a.mock.pstmn.io/songs';
  private apiUrlArtist = 'https://f14c4be8-2a85-4630-a08b-e8cde023ae41.mock.pstmn.io/songsArtiest';  
  private apiUrlMyplaylist = 'https://d2768f67-ebb0-4044-b0de-ee96da3d416c.mock.pstmn.io/myplaylist';

  constructor(private http: HttpClient) {}

  getTrack(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => console.log('Songs data:', data))
    );
  }
  getMyplayList(): Observable<any> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
      tap(data => console.log('Songs my data:', data))
    );
  }
  getAlbum(id: string): Observable<any> {
    const url = `${this.apiUrlArtist}/${id}`;
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Songs album data:', data))
    );
  }
}

