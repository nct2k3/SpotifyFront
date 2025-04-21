import { Component, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { UsersService } from '../services/users/users.service';
import { User, UserCreate, UserReponse } from '../Models/user.model';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css'],
})
export class AdminUserManagementComponent {
  @ViewChild('toast') toast!: ToastMessageComponent;

  searchTerm: string = ''; // Dùng để tìm kiếm người dùng
  userForm: FormGroup;
  isEditMode: boolean = false;
  currentUserId: number | null = null;
  showModal: boolean = false;
  users: any[] = [];

  constructor(private fb: FormBuilder, private usersService: UsersService) {
    this.userForm = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        is_staff: ['', Validators.required],
        is_superuser: ['', Validators.required],
        // role: ['', Validators.required],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator,
          ],
        ],
        password2: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator } // Thêm custom validator ở đây
    );
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getTrack().subscribe((data) => {
      this.users = data;
    });
  }

  // Hàm lọc người dùng theo từ khóa tìm kiếm
  filteredUsers(): UserReponse[] {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter((user) =>
      `${user.username} ${user.email} ${user.first_name} ${user.last_name} ${user.role}`
        .toLowerCase()
        .includes(term)
    );
  }

  openCreateModal() {
    this.showModal = true;
    this.isEditMode = false;
    this.currentUserId = null;
    this.userForm.reset();
  }

  closeModal() {
    this.showModal = false;
    this.userForm.reset();
  }

  editUser(user: UserReponse) {
    this.showModal = true;
    this.isEditMode = true;
    this.currentUserId = user.id ?? null; // nếu có id

    this.userForm = this.fb.group({
      username: [user.username, Validators.required],
      email: [user.email, [Validators.required, Validators.email]],
      first_name: [user.first_name, Validators.required],
      last_name: [user.last_name, Validators.required],
      is_staff: [user.is_staff, Validators.required],
      is_superuser: [user.is_superuser, Validators.required],
      // Không bao gồm password nếu là edit
    });
  }

  showError(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // Đánh dấu tất cả để hiện lỗi
      return;
    }
    let userData: any = this.userForm.value;

    // Nếu là tạo mới, đảm bảo password được gửi đi
    if (!this.isEditMode) {
      userData = {
        ...userData,
        password: this.userForm.get('password')?.value,
        password2: this.userForm.get('password2')?.value,
      };
    }

    console.log(userData);
    if (this.isEditMode && this.currentUserId !== null) {
      //chưa có api của update user
      // this.usersService.updateUser(this.currentUserId, userData).subscribe({
      //   next: () => {
      //     this.closeModal();
      // this.toast.showMessage('Update successful artists!', 'success');
      //     this.loadUsers();
      //   },
      //   error: (err) => {
      // this.toast.showMessage('Update failed artists!', 'error');
      //     console.error('Update failed', err);
      //   }
      // });
    } else {
      this.usersService.createUser(userData).subscribe({
        next: () => {
          this.closeModal();
          this.loadUsers();
          this.toast.showMessage('Create successful artists!', 'success');
        },
        error: (err) => {
          console.error('Create failed', err);
          this.toast.showMessage('Create failed artists!', 'error');
        },
      });
    }
  }

  // Password Validator
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasLetter || !hasNumber) {
      return {
        passwordStrength:
          'Password must contain at least one letter and one number',
      };
    }

    if (/^\d+$/.test(password)) {
      return { passwordNumeric: 'Password cannot be entirely numeric' };
    }

    return null;
  }

  // Custom validator để kiểm tra password và password2 có giống nhau không
  passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const password2 = group.get('password2')?.value;

    return password && password2 && password !== password2
      ? { passwordMismatch: 'Passwords must match' }
      : null;
  };
}
