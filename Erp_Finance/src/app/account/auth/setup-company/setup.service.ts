import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';
// import { env } from 'process';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SetupCompanyServiceService {
  // http: any;

  constructor(private http:HttpClient) { }

  addcompany(payload) {
   return this.http.post('', payload);
}
fetchRoles(){
  return this.http.get<any>('')

}



addUser(payload) {
  return this.http.post('', payload);
}


}
