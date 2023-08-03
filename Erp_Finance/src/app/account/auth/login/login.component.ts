import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../../core/services/authfake.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators'; 
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

/**
 * Login component
 */
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  submitted = false;
  error = '';
  returnUrl: string;

  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private authFackservice: AuthfakeauthenticationService, private authservice:AuthenticationService, private toastr:ToastrService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['admin@themesbrand.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
    });

    // reset login status
    // this.authenticationService.logout();
    // get return url from route parameters or default to '/'
    // tslint:disable-next-line: no-string-literal
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
  onSubmit() {
    console.log(this.loginForm.value);
    this.submitted = true;
    if (this.loginForm.valid) {
      this.authservice.login(this.loginForm.value).subscribe(
        (res: any) => {
          console.log(res, 'RESPONSE FROM API AFTER LOGIN');
          if (res) {
            localStorage.setItem('ERP_NEW_WEB_USERID', res.data.id);
            localStorage.setItem('ERP_NEW_WEB_TOKEN', res.data.jwtToken);
            console.log(localStorage.getItem('ERP_NEW_WEB_TOKEN'));
            this.router.navigate(['/dashboard']);
            this.toastr.success('Login Successfully', 'Success');
          }
        },
        (error: any) => {
          this.toastr.error('An error occurred', 'Error');
          this.router.navigate(['/account/login']);
        }
      );
    }
  }
}
