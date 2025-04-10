import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  // private apiUrl =
  //   'https://74653837-8b90-4060-bc25-272391e60ae4.mock.pstmn.io/album';

  private apiUrl = "http://127.0.0.1:8000/api/albums";
  constructor(private http: HttpClient) {}

  getAlbum(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http
      .get<any>(this.apiUrl, {headers})
      .pipe(tap((data) => console.log('Songs data:', data)));
  }

  deleteAlbum(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
