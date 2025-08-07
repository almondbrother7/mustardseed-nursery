import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GardeningComponent } from './pages/gardening/gardening.component';
import { PlantInventoryComponent } from './pages/inventory/inventory.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ReserveComponent } from './pages/reserve/reserve.component';
import { AdminGuard } from './admin/admin-guard';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { PlantCrudComponent } from './admin/plant-crud/plant-crud.component';
import { CategoryCrudComponent } from './admin/category-crud/category-crud.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'gardening', component: GardeningComponent },
  { path: 'inventory', component: PlantInventoryComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'reserve', component: ReserveComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'plants', pathMatch: 'full' },
      { path: 'plants', component: PlantCrudComponent },
      { path: 'categories', component: CategoryCrudComponent }
    ]
  },
  { path: '**', redirectTo: '' } // fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
