import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
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
import { RegisterComponent } from './register/register.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AdminAlbumManagementComponent } from './admin-album-management/admin-album-management.component';
import { ProfileComponent } from './profile/profile.component';
import { RouterModule } from '@angular/router';
import { ToastMessageComponent } from './shared/toast-message/toast-message.component';
import { AdminArtistManagementComponent } from './admin-artist-management/admin-artist-management.component';
import { ListAlbumComponent } from './list-album/list-album.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminDashboardManagementComponent } from './admin-dashboard-management/admin-dashboard-management.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChatComponent } from './chat/chat.component';

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
    RegisterComponent,
    SidebarComponent,
    SidebarComponent,
    AdminAlbumManagementComponent,
    ProfileComponent,
    ToastMessageComponent,
    AdminArtistManagementComponent,
    ProfileComponent,
    ListAlbumComponent,
    AdminDashboardManagementComponent,
    NotificationsComponent,
    ResetPasswordComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
