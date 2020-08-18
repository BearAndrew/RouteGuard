import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private dTokenLoginUrl = 'http://192.168.1.224:8500/Service.svc/DTokenLogin';
  private dLoginUrl = 'http://192.168.1.224:8500/Service.svc/DLogin';

  private userTokenSubject: BehaviorSubject<string>;
  private logStateSubject: BehaviorSubject<boolean>; // if login success, set true (Usage: auth guard)
  private showLoginPageSubject: BehaviorSubject<boolean>; // if login failed, set true (Usage: hide login page until login() is called)

  constructor(private http: HttpClient, private router: Router, private activatedRoute: ActivatedRoute) {
    this.logStateSubject = new BehaviorSubject<boolean>(false);
    this.showLoginPageSubject = new BehaviorSubject<boolean>(false);
  }

  // Check login state
  isLoginSuccess(): Observable<boolean> {
    return this.logStateSubject as Observable<boolean>;
  }


  // Show login page if first time login is called or logout
  showLoginPage(): Observable<boolean> {
    return this.showLoginPageSubject as Observable<boolean>;
  }


  checkUrlToken(urlToken: string) {
    if (urlToken) {
      this.userTokenSubject = new BehaviorSubject<string>(urlToken);
    } else {
      this.userTokenSubject = new BehaviorSubject<string>(localStorage.getItem('CTWDriverToken'));
    }

    console.log('token: ' + this.userTokenSubject.value);
    this.tokenLogin();
  }


  // Login by account and password
  login(account, password): Promise<any> {
    console.log('account: ' + account + ', password:' + password);
    return new Promise((resolve, reject) => {
      this.http.post(this.dLoginUrl, {Account: account, Password: password}).toPromise().then(
        (data: any) => {
          console.log('DLogin response: ' + JSON.stringify(data));
          if (data.IsSuccess) {
            this.logStateSubject.next(data.IsSuccess);
            localStorage.setItem('CTWDriverToken', data.Token);
            this.loginRoute();
            resolve();
          } else {
            reject(data);
          }
        });
    });
  }


  // Login by token
  tokenLogin() {
    if (this.userTokenSubject.value) {
      // If there is token
      console.log('There is token');
      this.http.post(this.dTokenLoginUrl, {Token: this.userTokenSubject.value})
      .subscribe((data: any) => {
        console.log('DTokenLogin response: ' + JSON.stringify(data));
        // login success, change state to "true", route
        if (data.IsSuccess) {
          this.logStateSubject.next(data.IsSuccess);
          this.loginRoute();
        } else {
          this.showLoginPageSubject.next(true);
        }
      });
    } else {
      // If there isn't token
      this.logStateSubject.next(false);
      this.showLoginPageSubject.next(true);
    }
  }


  private loginRoute() {
    // get return url from route parameters or default to '/'
    const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigate([returnUrl]);
  }


  logout() {
    console.log('logout !');
    localStorage.removeItem('CTWDriverToken');
    this.showLoginPageSubject.next(true);
    this.router.navigate(['/login']);
  }
}
