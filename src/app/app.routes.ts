import { Routes } from '@angular/router';
import { APP_NAME_SUFFIX } from './core/сonstants/app.constant';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    canActivate: [guestGuard],
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Login' + APP_NAME_SUFFIX,
  },
  {
    canActivate: [guestGuard],
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    title: 'Signup' + APP_NAME_SUFFIX,
  },
  {
    canActivate: [guestGuard],
    path: 'forget-password',
    loadComponent: () =>
      import('./features/auth/forget-password/forget-password.component').then(
        (m) => m.ForgetPasswordComponent,
      ),
    title: 'Forget Password' + APP_NAME_SUFFIX,
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'Home' + APP_NAME_SUFFIX,
  },
  {
    canActivateChild: [authGuard],
    path: 'profile',
    title: 'Profile' + APP_NAME_SUFFIX,
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    children: [
      {
        path: '',
        redirectTo: 'addresses',
        pathMatch: 'full',
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./features/profile/components/addresses/addresses.component').then(
            (m) => m.AddressesComponent,
          ),
        title: 'Addresses' + APP_NAME_SUFFIX,
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/profile/components/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
        title: 'Settings' + APP_NAME_SUFFIX,
      },
    ],
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
    title: 'Categories' + APP_NAME_SUFFIX,
  },
  {
    path: 'categories/:id',
    loadComponent: () =>
      import('./features/category-details/category-details.component').then(
        (m) => m.CategoryDetailsComponent,
      ),
    title: 'Categories' + APP_NAME_SUFFIX,
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products.component').then((m) => m.ProductsComponent),
    title: 'Products' + APP_NAME_SUFFIX,
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/product-details/product-details.component').then(
        (m) => m.ProductDetailsComponent,
      ),
    title: 'Products' + APP_NAME_SUFFIX,
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./features/brands/brands.component').then((m) => m.BrandsComponent),
    title: 'Brands' + APP_NAME_SUFFIX,
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/search.component').then((m) => m.SearchComponent),
    title: 'Search' + APP_NAME_SUFFIX,
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./features/wishlist/wishlist.component').then((m) => m.WishlistComponent),
    title: 'Wishlist' + APP_NAME_SUFFIX,
  },
  {
    //canActivate: [authGuard],
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
    title: 'Cart' + APP_NAME_SUFFIX,
  },
  {
    canActivate: [authGuard],
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'Checkout' + APP_NAME_SUFFIX,
  },
  {
    path: 'allorders',
    redirectTo: 'orders',
    pathMatch: 'full',
  },
  {
    canActivate: [authGuard],
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/orders.component').then((m) => m.OrdersComponent),
    title: 'Orders' + APP_NAME_SUFFIX,
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then((m) => m.ContactComponent),
    title: 'Contact Us' + APP_NAME_SUFFIX,
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Fresh' + APP_NAME_SUFFIX,
  },
];
