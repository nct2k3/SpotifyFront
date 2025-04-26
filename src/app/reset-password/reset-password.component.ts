// reset-password.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../services/users/users.service';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';
import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  @ViewChild('toast') toast!: ToastMessageComponent;
  
  step: 'request' | 'verify' = 'request';
  requestForm: FormGroup;
  verifyForm: FormGroup;
  isLoading = false;
  
  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.verifyForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password2: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  requestCode() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    const email = this.requestForm.get('email')?.value;
    
    this.usersService.requestPasswordReset(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.showMessage('Reset code sent to your email!', 'success');
        this.step = 'verify';
        this.verifyForm.patchValue({ email: email });
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.showMessage(err.error?.email || 'Failed to send reset code', 'error');
      }
    });
  }
  
  resetPassword() {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    const resetData = this.verifyForm.value;
    
    this.usersService.verifyPasswordReset(resetData).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.showMessage('Password reset successful!', 'success');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        let errorMessage = 'Failed to reset password';
        if (err.error) {
          if (err.error.code) errorMessage = err.error.code;
          if (err.error.new_password) errorMessage = err.error.new_password;
          if (err.error.new_password2) errorMessage = err.error.new_password2;
        }
        this.toast.showMessage(errorMessage, 'error');
      }
    });
  }
  
  passwordMatchValidator(group: FormGroup): { passwordMismatch: boolean } | null {
    const password = group.get('new_password')?.value;
    const password2 = group.get('new_password2')?.value;
    
    return password && password2 && password !== password2 
      ? { passwordMismatch: true } 
      : null;
  }
  
  hasError(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}