import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { User } from '../services/user.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private userService = inject(User);
  private router = inject(Router);

  canActivate(): boolean {
    const isLoggedIn = this.userService.validateSession(); 

    if (isLoggedIn) {
      return true; 
    } else {
      this.router.navigate(['/login']); 
      return false;
    }
  }
}