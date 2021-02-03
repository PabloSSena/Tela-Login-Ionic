import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import {map,switchMap, tap} from 'rxjs/operators'
const {Storage} = Plugins;
const TOKENKEY ="my_token";
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  token='';

  constructor(private http: HttpClient) {
    this.loadToken();
   }

   async loadToken() {
     const token = await Storage.get({key: TOKENKEY});
     if(token && token.value) {
       console.log('Set token: ', token.value);
       this.token = token.value;
       this.isAuthenticated.next(true);
     }
     else {
       this.isAuthenticated.next(false);
     }
   }

   login(credentials:{email,password}): Observable<any> {
    return this.http.post(`https://reqres.in/api/login`, credentials).pipe(
      map((data:any) => data.token),
      switchMap(token => {
        return from(Storage.set({key:TOKENKEY, value:this.token}))
      }),
      tap(_ => {
        this.isAuthenticated.next(true);
      })
    )
   }

   logout(): Promise<void>{
     this.isAuthenticated.next(false);
     return Storage.remove({key:TOKENKEY})
   }
}
