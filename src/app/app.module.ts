import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MyPlayListComponent } from './my-play-list/my-play-list.component';
import { ProductComponent } from './product/product.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { TimeFormatPipe } from './footer/time-format.pipe';
import { AdminComponent } from './admin/admin.component';
import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminUserManagementComponent } from './admin-user-management/admin-user-management.component';
import { AdminSongsManagementComponent } from './admin-songs-management/admin-songs-management.component';
import { AlbumComponent } from './album/album.component';
import { DetailComponent } from './detail/detail.component';
import { SearchComponent } from './search/search.component';
import { VideoComponent } from './video/video.component';
import { GeminiChatComponent } from './gemini-chat/gemini-chat.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MyPlayListComponent,
    ProductComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    TimeFormatPipe,
    AdminComponent,
    AdminNavbarComponent,
    AdminHeaderComponent,
    AdminUserManagementComponent,
    AdminSongsManagementComponent,
    AlbumComponent,
    DetailComponent,
    SearchComponent,
    VideoComponent,
    GeminiChatComponent,
    
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
