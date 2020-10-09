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

const routes: Routes = [
  { path: "", component: FilesComponentComponent },
  { path: "notifications", component: NotificationsComponentComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    FilesComponentComponent,
    NotificationsComponentComponent
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
