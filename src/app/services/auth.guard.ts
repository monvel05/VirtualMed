import { Injectable, inject } from '@angular/core';
<<<<<<< HEAD
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

// 1. CORRECCIÓN DE RUTA: Ajusta esto si tu carpeta es distinta
// Si el guard está en 'src/app/guards' y el servicio en 'src/app/services'
import { UserService } from '../services/user.service'; 
=======
import { CanActivate, Router } from '@angular/router';
import { User } from '../services/user.service'; 
>>>>>>> 7b5bf724c58506f0373c1583d6fd8fe4d532ddc3

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
<<<<<<< HEAD
  private userService = inject(UserService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    
    // 2. CORRECCIÓN DE MÉTODO: Usamos isAuthenticated() que es más estándar
    const isAuth = this.userService.isAuthenticated();

    if (!isAuth) {
      console.log('⛔ Guard: Usuario no autenticado. Redirigiendo a Login.');
      this.router.navigate(['/login']);
=======
  private userService = inject(User);
  private router = inject(Router);

  canActivate(): boolean {
    const isLoggedIn = this.userService.validateSession(); 

    if (isLoggedIn) {
      return true; 
    } else {
      this.router.navigate(['/login']); 
>>>>>>> 7b5bf724c58506f0373c1583d6fd8fe4d532ddc3
      return false;
    }

    // 3. VALIDACIÓN DE ROLES MEJORADA
    // Leemos los roles que pide la ruta (ej: ['medico'])
    const requiredRoles = route.data['roles'] as string[];

    if (requiredRoles && requiredRoles.length > 0) {
      // Obtenemos el rol actual del usuario en minúsculas
      const currentRole = this.userService.getRole().toLowerCase();

      // Verificamos si el usuario tiene ALGUNO de los roles requeridos
      const hasPermission = requiredRoles.some(required => {
        const req = required.toLowerCase();
        
        // ✨ MAGIA: Si la ruta pide 'medico', dejamos pasar a 'doctor' también
        if (req === 'medico' || req === 'doctor') {
          return currentRole === 'medico' || currentRole === 'doctor';
        }
        
        // Comparación normal para otros roles (admin, paciente, etc)
        return currentRole === req;
      });

      if (!hasPermission) {
        console.warn(`⛔ Guard: Rol '${currentRole}' no autorizado. Se requería: ${requiredRoles}`);
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}