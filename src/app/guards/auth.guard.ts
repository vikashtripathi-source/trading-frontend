import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('jwt_token');
      
      if (token) {
        // Token exists - allow access
        return true;
      } else {
        // No token - redirect to login
        this.router.navigate(['/login']);
        return false;
      }
    } else {
      // During SSR, allow access to avoid blocking the initial render
      // The actual auth check will happen on the client side
      return true;
    }
  }
}
