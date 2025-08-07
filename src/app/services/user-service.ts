import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  isAdmin: boolean = false;

  constructor(private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(async user => {
      if (user) {
        const tokenResult = await user.getIdTokenResult();
        // const tokenResult = await user.getIdTokenResult(true);  // force refresh
        this.isAdmin = tokenResult.claims['admin'] === true;
        console.log('Admin:', this.isAdmin);
      } else {
        this.isAdmin = false;
      }
    });
  }

  getAdminStatus(): boolean {
    return this.isAdmin;
  }
}
