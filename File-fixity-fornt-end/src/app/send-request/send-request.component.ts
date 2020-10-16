import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpServices } from '../services/http.service';

@Component({
  selector: 'app-send-request',
  templateUrl: './send-request.component.html',
  styleUrls: ['./send-request.component.css']
})
export class SendRequestComponent implements OnInit {
  myFiles: string;
  users: string[];
  selectedUser: string;
  selectedUserFiles: string[];
  selectedFiles: string[];
  showNotification: boolean = false;

  constructor(private http: HttpServices, private ruter: Router) { }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers(){
    this.http.getAllUsers().subscribe((users) =>{
      console.log(users)
      this.users = users;
      err => console.log(err);
    });
  }

  sendRequestForFileSharing(){
    this.http.sendRequestForFileSharing(this.selectedUser).subscribe((response) =>{
      //set notification
      err => console.log(err);
    });
  }
  
  onOptionsSelected(value:string){
    console.log("the selected value is " + value);
    this.selectedUser = value;
    //this.getFilesFromUser();
  }

}
