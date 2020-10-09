import { Component, OnInit } from '@angular/core';
import { HttpServices } from '../services/http.service';

@Component({
  selector: 'app-notifications-component',
  templateUrl: './notifications-component.component.html',
  styleUrls: ['./notifications-component.component.css']
})
export class NotificationsComponentComponent implements OnInit {
  
  notificationFromUsers: string[] = [];

  constructor(private http: HttpServices) { }

  //proveriti sa servera da li ima zahteva za deljenje
  ngOnInit() {
    this.http.checkNotification().subscribe((notifications) =>{
      console.log(notifications)
      if(notifications.message != null){
        this.notificationFromUsers = notifications.message;
      } else{
        notifications.usersGuests.forEach(element => {
          this.notificationFromUsers.push(element.usename)
        });
        //this.notificationFromUsers = notifications.usersGuests[0].usename;
        console.log("debug " + this.notificationFromUsers[0]);
      }
      err => console.log(err);
    });
  }

  accept(decision: number, userResponse: string){
    console.log(decision, userResponse);//1 prihvati 0 odbij zahtev
    //prihvatiti zahtev, iz pending promeniti u accept
    this.http.respoundSharingRequest(decision, userResponse).subscribe((response) =>{
      console.log(response.message)
      err => console.log(err);
    });
  }

}
