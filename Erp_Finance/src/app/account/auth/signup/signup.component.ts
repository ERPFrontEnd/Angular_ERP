import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, timer } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { UserProfileService } from 'src/app/core/services/user.service';

const OTP_EXPIRY_TIME = 30; // 30 seconds

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent  {

  error = '';
  successmsg = false;
  currentstep: number = 1;
  CompanyForm: FormGroup;
  isSubmitted = false;
  emailForm: FormGroup;
  otpForm: FormGroup;
  // set the currenr year
  year: number = new Date().getFullYear();
  awWizardComponent: any;
  selectedOption: string;
  receivedOTPTime: any;
  firstCard:boolean=true;

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authservice: AuthenticationService,
    private userService: UserProfileService,
    public toastr: ToastrService,) { }
  email: string;
  currentStep = 1; // Start at step 1

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

    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });


    this.otpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    // ===========MobileForm==========

    // this.MobileForm = this.formBuilder.group({
    //   countryCode: ['+91', Validators.required],
    //   mobileNo: ['', Validators.required]

    // });

    // ==================CompanyForm==================
    this.CompanyForm = this.formBuilder.group({
      adminDisplayName: ['',],
      adminFirstName: ['', Validators.required],
      adminLastName: ['', Validators.required],
      businessPhoneNo: ['', Validators.required],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', Validators.required],
      organizationCountry: ['', Validators.required],
      ownershipType: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), this.strongPasswordValidator]],
      ConfirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordMatchValidator });

    this.emailForm.controls['email'].valueChanges.subscribe((value) => {
      this.CompanyForm.controls['email'].patchValue(value);
    });
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
  // ==================VALIDATORS=====================
  get type() {
    return this.emailForm.controls;
  }
  get f() {
    return this.MobileForm.controls;
  }
  // ====================================================

  displayemail: boolean = true;
  // close: boolean = true;
  otpopen: boolean = false
  receivedOTP: string;

  // ========================OPEN EMAIL======================
  openemail() {
    this.displayemail = true;
    // this.close = false;
  }
  // ===========================EMAIL SUBMIT METHOD=====================
 


  onSubmit() {
    this.isSubmitted = true;
    console.log(this.emailForm.value);
    if (this.emailForm.valid) {
      console.log(this.emailForm.value);
      this.authservice.Email(this.emailForm.value).subscribe(
        (res: any) => {
          console.log(res, 'RESPONSE FROM API');
          this.otpopen = true;
          this.displayemail = false;
          this.toastr.success('OTP has been sent to your mail', 'Please Enter OTP');
          this.receivedOTP = res;
          console.log(this.receivedOTP, 'sssssssssssss');
          setTimeout(() => {
            this.toastr.clear();
          }, 2000);

          this.otpExpired = false; // Reset the OTP expiration status

          // Reset the countdown timer
          if (this.countdownSubscription) {
            this.countdownSubscription.unsubscribe();
          }
          this.showCountdownTimer = false;
          this.countdown = OTP_EXPIRY_TIME;
          this.startCountdownTimer();
        }
      );
    }
    
  }


  // ================== OTP VERIFICATION SUBMIT METHOD================

  onOtpChange(event) {
    console.log(event, '>>>>>>>>>>>>>');
    this.otpForm.controls.otp.setValue(event);
  }

  onOTPSubmit() {
    if (this.otpExpired && !this.resending) {
      this.toastr.error('OTP has expired. Please generate a new OTP.', 'OTP Expired');
      return;
    }
  
    this.isSubmitted = true;
    const enteredotp = this.otpForm.value;
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
    this.showRegistration = true;
          this.currentStep++;
  }
  

  // ================BACT TO COMPANY STATUS==================
  back() {
    this.displayemail = true;
    this.emailForm.reset();
    this.otpopen = false;
  }

  // // ===================
  // backtoEmail() {
  //   this.showRegistration = false;
  //   this.emailForm.reset();
  //   this.close = true;
  //   this.isSubmitted = false;
  //   this.displayemail = true;
  //   this.otpopen = false;
  // }

  // ======================SELECT CARD IN COMPANT STATUS====================
  // In your component class
  selectedCard: string = '';
  selectCard(card: string) {
    this.selectedCard = card;
    this.CompanyForm.controls['ownershipType'].setValue(this.selectedCard)
  }


  // =============================CREATE ACCOUNT============================
  showOTP = false;
  showRegistration = false;
  // showMobileNumber = true;
  MobileForm: FormGroup;
  OTPForm: FormGroup;
  confirmation: boolean = false

  // =============================Account details=========================

  verifyaccount() {
    this.isSubmitted = true;
    // this.authservice.AddAdminUser(this.CompanyForm.value).subscribe((res: any) => {
    //   console.log(res, '>>>>>>>>>>>>>');
    //   console.log(this.CompanyForm.value, '9999999999999999');
    //   if (this.CompanyForm.valid) {
    //     console.log(this.CompanyForm.value, '----------------------');
    //     this.showRegistration = false;
    //     this.confirmation = true;
    //     // this.firstCard=false;
    //     this.currentStep++;
    //     this.toastr.success('SignUp Successful', 'Success');
    //   }
    // });
  }

  // ================Country codes=======================

  selectedCountryCode: string = '+91'; // default country code
  countryCodes: string[] = ['+1', '+44', '+91'];
  onSelectCountryCode(event: any) {
    this.selectedCountryCode = event.target.value;
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
  
    this.otpForm.reset();
    this.isSubmitted = false;
    this.showCountdownTimer = true;
    this.countdown = OTP_EXPIRY_TIME;
  
    this.countdownSubscription = timer(0, 1000).subscribe(() => {
      this.countdown--;
      if (this.countdown === 0) {
        this.showCountdownTimer = false;
        this.countdownSubscription?.unsubscribe();
        this.otpForm.reset();
      }
    });
  
    this.resending = true; // Set isResendingOTP flag to true
  
    timer(RETRY_DELAY).subscribe(() => {
      this.otpForm.reset();
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
        this.otpForm.reset(); // Reset the form
      }
    });
  }




}

// MobileSubmit() {
  //   this.isSubmitted = true;

  //   console.log(this.MobileForm, '==========')

  //   if (this.MobileForm.valid) {
  //     console.log(this.MobileForm.value);

  //     if (this.selectedOption === 'text') {
  //       this.authservice.TextMeVerification(this.MobileForm.value).subscribe(
  //         (res: any) => {
  //           console.log(res, 'RESPONSE');
  //           this.handleVerificationSuccess();
  //         },
  //       );
  //     } else if (this.selectedOption === 'call') {
  //       this.authservice.CallMeVerification(this.MobileForm.value).subscribe(
  //         (res: any) => {
  //           console.log(res, 'RESPONSE');
  //           this.handleVerificationSuccess();
  //         },
  //       );
  //     }
  //   }
  //   // this.showOTP = true;
  //   // this.showMobileNumber = false;
  // }

  // ==================MOBILE VERIFICATION====================
  // handleVerificationSuccess() {
  //   this.showOTP = true;
  //   // this.showMobileNumber = false;
  //   this.toastr.success('OTP has been sent to your Mobile Number', 'Please Enter OTP');
  //   setTimeout(() => {
  //     this.toastr.clear();
  //   }, 2000);
  // }

  // ================RADIO BUTTON=================
  // handleOptionChange(selectedOption: string) {
  //   this.selectedOption = selectedOption;
  // }

