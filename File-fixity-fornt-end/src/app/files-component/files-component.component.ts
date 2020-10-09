import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpServices } from '../services/http.service';

@Component({
  selector: 'app-files-component',
  templateUrl: './files-component.component.html',
  styleUrls: ['./files-component.component.css']
})
export class FilesComponentComponent implements OnInit {
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

  getMyFiles(){
    this.http.myFiles().subscribe((files) => {
      this.myFiles = files;
      err => console.log(err);
    });
  }

  getAllUsers(){
    this.http.getAllUsers().subscribe((users) =>{
      console.log(users)
      this.users = users;
      err => console.log(err);
    });
  }

  getFilesFromUser(){
    this.http.getFilesFromUser(this.selectedUser).subscribe((files) =>{
      this.selectedUserFiles = files;
      err => console.log(err);
    })
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

  showRequests(){
    this.showNotification = !this.showNotification;
    //this.ruter.navigate(['notifications'])
  }

  checkShowNotification(){
    return this.showNotification;
  }
}
