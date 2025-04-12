import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MyPlayListComponent } from './my-play-list/my-play-list.component';
import { ProductComponent } from './product/product.component';
import { AdminComponent } from './admin/admin.component';
import { AlbumComponent } from './album/album.component';
import { DetailComponent } from './detail/detail.component';
import { VideoComponent } from './video/video.component';
import { SearchComponent } from './search/search.component';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './verify/verify.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  { path: 'login', component:LoginComponent  },
  { path: 'register', component: RegisterComponent },
  {path:'home',component:HomeComponent},
  {path:'myplaylist',component:MyPlayListComponent},
  {path:'product',component:ProductComponent},
  { path: 'admin', component:AdminComponent},
  {path:'album',component:AlbumComponent},
  {path:'detail',component:DetailComponent},
  {path:'video',component:VideoComponent},
  {path:'search',component:SearchComponent},
  // { path: '**', redirectTo: 'home' },
  { path: 'verify', component: VerifyComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
