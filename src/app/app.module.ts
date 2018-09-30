// modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatModule } from './mat/mat.module';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from'@angular/forms';
import { ShareButtonsModule } from '@ngx-share/buttons';

// pipes
import { FormatPipe } from './format.pipe';

// environment
import { environment } from '../environments/environment';

// services / guards
import { AuthService } from './auth.service';
import { AuthGuardService } from './auth-guard.service';
import { AdminGuard } from './admin.guard';

// angularfire
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';

// components
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { PostComponent } from './post/post.component';
import { ManageComponent } from './manage/manage.component';
import { EditComponent } from './edit/edit.component';
import { HttpClientModule } from '@angular/common/http';

// routes
const appRoutes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full'},
  { path: 'main', component: MainComponent },
  { path: 'login', component: LoginComponent, canActivate: [AdminGuard] },
  { path: 'manage', component: ManageComponent, canActivate: [AdminGuard] },
  { path: 'edit', component: EditComponent, canActivate: [AdminGuard] },
  { path: 'edit/:id', component: EditComponent, canActivate: [AdminGuard] },
  { path: 'post/:id', component: PostComponent },
  { path: '**', component: MainComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    PostComponent,
    ManageComponent,
    EditComponent,
    FormatPipe
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    BrowserAnimationsModule,
    MatModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ShareButtonsModule.forRoot()
  ],
  providers: [ AuthService, AuthGuardService, AdminGuard ],
  bootstrap: [AppComponent]
})
export class AppModule { }
