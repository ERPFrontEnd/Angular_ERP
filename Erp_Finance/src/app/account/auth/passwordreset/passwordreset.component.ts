import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { Subscription, timer } from 'rxjs';

const OTP_EXPIRY_TIME = 30; // 30 seconds
@Component({
  selector: 'app-passwordreset',
  templateUrl: './passwordreset.component.html',
  styleUrls: ['./passwordreset.component.scss']
})

/**
 * Reset-password component
 */
export class PasswordresetComponent implements OnInit, AfterViewInit {

  EmailForm: UntypedFormGroup;
  OTPForm: UntypedFormGroup;
  ResetForm:UntypedFormGroup;
  submitted = false;
  error = '';
  success = '';
  loading = false;
  ShowEmail: boolean = true;
  ShowOTP: boolean = false;
  ShowReset:boolean = false;
  confirmation:boolean = false;
  // set the currenr year
  year: number = new Date().getFullYear();
  receivedOTP: any;

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute, private router: Router,
    public toastr: ToastrService, private authService: AuthenticationService) { }


  // =========================OTP UI=========================
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    containerStyles: {},
    inputStyles: {
      'width': '40px',
      'height': '40px'
    },

  };
  ngOnInit() {

    this.EmailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });


    this.OTPForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.ResetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      ConfirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });
  }


    // ====================PASSWORD MATCH VALIDATOR======================
    passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
      const password = control.get('password');
      const ConfirmPassword = control.get('ConfirmPassword');
      if (password.value !== ConfirmPassword.value) {
        return { passwordMismatch: true };
      }
      return null;
    }
    // ========================STRONG PASSWORD========================
    strongPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
      const password = control.value;
      if (!password) {
        return { required: true };
      }
  
      if (password.length < 8) {
        return { minlength: true };
      }
  
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumeric = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
  
      if (!hasUpperCase || !hasLowerCase || !hasNumeric || !hasSpecialChar) {
        return { weakPassword: true };
      }
  
      return null;
    }
  ngAfterViewInit() {
  }

  // convenience getter for easy access to form fields
  get f() { return this.EmailForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;
    console.log(this.EmailForm.value);
    // if (this.EmailForm.valid) {
    //   console.log(this.EmailForm.value);
    //   this.authService.loginEmail(this.EmailForm.value).subscribe(
    //     (res: any) => {
    //       console.log(res, 'RESPONSE FROM API');
    //       this.ShowOTP = true;
    //       this.ShowEmail = false;
    //       this.toastr.success('OTP has been sent to your mail', 'Please Enter OTP');
    //       this.receivedOTP = res;
    //       console.log(this.receivedOTP, 'sssssssssssss');
    //       setTimeout(() => {
    //         this.toastr.clear();
    //       }, 2000);

    //       this.otpExpired = false; // Reset the OTP expiration status

    //       // Reset the countdown timer
    //       if (this.countdownSubscription) {
    //         this.countdownSubscription.unsubscribe();
    //       }
    //       this.showCountdownTimer = false;
    //       this.countdown = OTP_EXPIRY_TIME;
    //       this.startCountdownTimer();
    //     }
    //   );
    // }
    this.ShowOTP = true;
    this.ShowEmail = false;
  }

  // ==================OTP VERIFICATION SUBMIT METHOD================

  onOtpChange(event) {
    console.log(event, '>>>>>>>>>>>>>');
    this.OTPForm.controls.otp.setValue(event);
  }

  onOTPSubmit() {
    if (this.otpExpired && !this.resending) {
      this.toastr.error('OTP has expired. Please generate a new OTP.', 'OTP Expired');
      return;
    }

    this.submitted = true;
    const enteredotp = this.OTPForm.value;
    console.log('Entered OTP:', enteredotp);
    console.log('Received OTP:', this.receivedOTP);

    // this.authservice.emailOTP(enteredotp).subscribe(
    //   (verificationRes: any) => {
    //     if (verificationRes) {
    //       this.showRegistration = true;
    //       this.currentStep++;
    //       this.toastr.success('OTP Verified Successfully', 'Success');
    //     }
    //   },
    //   (error: any) => {
    //     if (this.resending) {
    //       // console.log('Invalid OTP, but ignoring error message for resend');
    //       return;
    //     }
    //     this.toastr.error('Invalid OTP', 'Error');
    //     console.error(error);
    //     this.otpExpired = true; // Set otpExpired flag to true on error
    //   }
    // );
    this.ShowReset = true;
    this.ShowOTP = false;
  }

  OnResetSubmit(){
    this.submitted = true;
    console.log(this.ResetForm.value);
    // if (this.ResetForm.valid) {
    //   console.log(this.ResetForm.value);
    //   this.authService.loginReset(this.ResetForm.value).subscribe(
    //     (res: any) => {
    //       console.log(res, 'RESPONSE FROM API');
    //       this.ShowReset = true;
    //       this.ShowOTP = false;
    //       this.toastr.success('OTP has been sent to your mail', 'Please Enter OTP');
    //       this.receivedOTP = res;
    //       console.log(this.receivedOTP, 'sssssssssssss');
    //       setTimeout(() => {
    //         this.toastr.clear();
    //       }, 2000);

    //       this.otpExpired = false; // Reset the OTP expiration status

    //       // Reset the countdown timer
    //       if (this.countdownSubscription) {
    //         this.countdownSubscription.unsubscribe();
    //       }
    //       this.showCountdownTimer = false;
    //       this.countdown = OTP_EXPIRY_TIME;
    //       this.startCountdownTimer();
    //     }
    //   );
    // }
    this.confirmation = true;
    this.ShowReset = false;
  
  }


  // ================BACT TO COMPANY STATUS==================
  back() {
    this.ShowEmail = true;
    this.EmailForm.reset();
    this.ShowOTP = false;
  }

  // ==========================RESEND OTP==========================
  resending = false;
  showCountdownTimer = false;
  countdown = OTP_EXPIRY_TIME;
  countdownSubscription: Subscription | undefined;
  otpExpired: boolean = false;


  resendOTP() {
    const RETRY_DELAY = 30000; // Set the delay before resending OTP (e.g., 30 seconds)

    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }

    this.OTPForm.reset();
    this.submitted = false;
    this.showCountdownTimer = true;
    this.countdown = OTP_EXPIRY_TIME;

    this.countdownSubscription = timer(0, 1000).subscribe(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.showCountdownTimer = false;
        this.countdownSubscription?.unsubscribe();
        this.OTPForm.reset();
      }
    });

    this.resending = true; // Set isResendingOTP flag to true

    timer(RETRY_DELAY).subscribe(() => {
      this.OTPForm.reset();
      this.showCountdownTimer = false;
      this.countdownSubscription?.unsubscribe();
      this.countdown = OTP_EXPIRY_TIME;
      this.otpExpired = false; // Reset the otpExpired flag
      this.resending = false; // Set isResendingOTP flag back to false
      this.onSubmit(); // Call the onOTPSubmit() method to generate a new OTP
    });
  }

  startCountdownTimer() {
    // Start the countdown timer
    this.countdownSubscription = timer(0, 1000).subscribe(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.showCountdownTimer = false;
        // this.toastr.error('Time expired. Please generate a new OTP.', 'OTP Expired');
        this.otpExpired = true; // Set the OTP expiration status
        this.countdownSubscription?.unsubscribe();
        this.OTPForm.reset(); // Reset the form
      }
    });
  }


}
