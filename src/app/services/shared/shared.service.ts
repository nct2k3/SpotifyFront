import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SongsService } from '../Songs/songs.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private sharedDataSubject = new BehaviorSubject<any[]>([]);
  public sharedData$ = this.sharedDataSubject.asObservable();

  constructor(private songsService: SongsService) {
    this.songsService.getTrack().subscribe((data: any[]) => {
      this.sharedDataSubject.next(data);
      //console.log('share',data);
    });
  }

  updateSharedData(newData: any[]): void {
    this.sharedDataSubject.next(newData);
  }

  addToSharedData(item: any): void {
    const currentData = this.sharedDataSubject.getValue();
    this.sharedDataSubject.next([...currentData, item]);
  }
}
