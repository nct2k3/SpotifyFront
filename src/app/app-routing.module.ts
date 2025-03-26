import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MyPlayListComponent } from './my-play-list/my-play-list.component';
import { ProductComponent } from './product/product.component';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
  { path: 'login', component:LoginComponent  },
  {path:'home',component:HomeComponent},
  {path:'myplaylist',component:MyPlayListComponent},
  {path:'product',component:ProductComponent},
  { path: 'admin', component:AdminComponent},
  { path: '**', redirectTo: 'home' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
