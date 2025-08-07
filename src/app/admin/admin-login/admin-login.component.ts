import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  errorMessage = '';

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  login(form: NgForm): void {
    if (form.invalid) return;

    const { email, password } = form.value;

    this.afAuth.signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('✅ Logged in');
        this.router.navigate(['/admin']);
      })
      .catch(err => {
        console.error('❌ Login failed', err);
        this.errorMessage = err.message || 'Login failed';
      });
  }
}
