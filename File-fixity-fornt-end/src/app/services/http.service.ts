import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpServices{
    private base_url = 'http://localhost:52296';
    private base_url_central_server = 'http://192.168.1.10:52295';
    constructor(private http: HttpClient){ }

    myFiles() : Observable<any>{
        return this.http.get<any>(this.base_url + '/api/GetMyFiles');
    }

    getAllUsers() : Observable<any>{
        //return this.http.get<any>(this.base_url_central_server + '/api/GetAllUsers');
        return this.http.get<any>(this.base_url + '/api/GetAllUsers');
    }

    getFilesFromUser(user: string) : Observable<any>{
        return this.http.get<any>(this.base_url + '/api/GetAllUserFiles/' + user);
    }

    sendRequestForFileSharing(user: string) : Observable<any>{
        return this.http.get<any>(this.base_url + '/api/RequestForFileSharing/' + user);
    }

    checkNotification() : Observable<any>{
        return this.http.get<any>(this.base_url + '/api/CheckNotification');
    }

    respoundSharingRequest(decision: number, userResponse: string) : Observable<any>{
        return this.http.get<any>(this.base_url + '/api/RespondSharingRequest/' + decision + '/' + userResponse);
    }

}