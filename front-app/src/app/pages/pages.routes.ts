import { Routes } from '@angular/router';

export default [
    { path: 'leads', loadComponent: () => import('./leads/leads').then((m) => m.Leads) },
    { path: 'properties', loadComponent: () => import('./properties/properties').then((m) => m.Properties) },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
