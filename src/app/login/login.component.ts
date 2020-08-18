import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { AuthenticationService } from './../_service/authentication.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  fg: FormGroup;
  isLoginCalled = false;
  isLoginFailed = false;

  private showLoginPageSub: Subscription;

  constructor(private fb: FormBuilder, private authenticationService: AuthenticationService, private activatedRoute: ActivatedRoute) {
    this.showLoginPageSub = authenticationService.showLoginPage().subscribe((data) => {
      this.isLoginCalled = data;
    });

    this.checkUrlToken();
  }

  ngOnInit(): void {
    this.fg = this.fb.group({
      account: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.showLoginPageSub.unsubscribe();
  }

  get account() { return this.fg.get('account'); }

  get password() { return this.fg.get('password'); }

  login() {
    this.authenticationService.login(this.account.value, this.password.value).then((resolve) => {
      console.log('login component resolve !');
    }, (reject) => {
      console.log('login component reject: ' + JSON.stringify(reject));
      this.isLoginFailed = true;
    });
  }

  checkUrlToken() {
    this.activatedRoute.paramMap.subscribe((param) => {
      const urlToken = param.get('token');
      console.log('urlToken: ' + urlToken);
      this.authenticationService.checkUrlToken(urlToken);
    });
  }
}
