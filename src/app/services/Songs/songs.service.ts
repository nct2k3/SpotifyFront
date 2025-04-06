import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongsService {
  private apiUrl = 'http://127.0.0.1:8000/api/songs/';
  private apiUrlArtist = 'https://f14c4be8-2a85-4630-a08b-e8cde023ae41.mock.pstmn.io/songsArtiest';  
  private apiUrlMyplaylist = 'http://127.0.0.1:8000/api/playlists/?mine=1';

  constructor(private http: HttpClient) {}

  getTrack(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(data => data.results)
    );
  }
  getMyplayList(userId: string): Observable<any[]> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
      map(data => {
        const playlists = data.results.filter((item: any) => item.user === userId); 
        return playlists.flatMap((playlist: any) => playlist.songs); 
      }),
      tap(songs => console.log('Songs from playlists:', songs))
    );
  }
  getAlbum(id: string): Observable<any> {
    const url = `${this.apiUrlArtist}/${id}`;
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Songs album data:', data))
    );
  }
}

