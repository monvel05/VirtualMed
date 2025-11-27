// src/app/services/role.guard.ts
import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: any): boolean {
    const expectedRole = route.data?.['expectedRole'];
    const user = this.authService.getCurrentUser();
    
    if (this.authService.isAuthenticated() && user?.role === expectedRole) {
      return true;
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}