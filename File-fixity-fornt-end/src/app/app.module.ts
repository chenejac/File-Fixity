import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FilesComponentComponent } from './files-component/files-component.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpServices } from './services/http.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationsComponentComponent } from './notifications-component/notifications-component.component';
import { HomeComponent } from './home/home.component';
import { MyFilesComponent } from './my-files/my-files.component';
import { SendRequestComponent } from './send-request/send-request.component';

const routes: Routes = [
  // { path: "", component: FilesComponentComponent },
  { path: "", component: HomeComponent },
  { path: "home", component:HomeComponent },
  { path: "notifications", component: NotificationsComponentComponent },
  { path: "myfiles", component: MyFilesComponent },
  { path: "sendRequest", component: SendRequestComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    FilesComponentComponent,
    NotificationsComponentComponent,
    HomeComponent,
    MyFilesComponent,
    SendRequestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [HttpServices],
  bootstrap: [AppComponent]
})
export class AppModule { }
