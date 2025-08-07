import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.afAuth.idTokenResult.pipe(
      map(tokenResult => {
        // console.log('Token claims:', tokenResult?.claims);
        const isAdmin = !!tokenResult?.claims?.['admin'];
        if (!isAdmin) {
          this.router.navigate(['/admin-login']);
        }
        return isAdmin;
      })
    );
  }
}
