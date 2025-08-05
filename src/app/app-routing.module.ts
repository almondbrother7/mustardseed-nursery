import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GardeningComponent } from './pages/gardening/gardening.component';
import { PlantInventoryComponent } from './pages/inventory/inventory.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ReserveComponent } from './pages/reserve/reserve.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'gardening', component: GardeningComponent },
  { path: 'inventory', component: PlantInventoryComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'reserve', component: ReserveComponent },
  { path: '**', redirectTo: '' } // fallback
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
