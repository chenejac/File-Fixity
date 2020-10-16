import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpServices } from '../services/http.service';

@Component({
  selector: 'app-my-files',
  templateUrl: './my-files.component.html',
  styleUrls: ['./my-files.component.css']
})
export class MyFilesComponent implements OnInit {
  myFiles: string;
  users: string[];
  selectedUser: string;
  selectedUserFiles: string[];
  selectedFiles: string[];
  showNotification: boolean = false;
  
  constructor(private http: HttpServices, private ruter: Router) { }

  ngOnInit() {
    this.getAllUsers();
    this.getMyFiles();
  }

  getAllUsers(){
    this.http.getAllUsers().subscribe((users) =>{
      console.log(users)
      this.users = users;
      err => console.log(err);
    });
  }

  getMyFiles(){
    this.http.myFiles().subscribe((files) => {
      this.myFiles = files;
      err => console.log(err);
    });
  }
}
