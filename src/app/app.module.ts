import { SharedModule } from './shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { MaterialModule } from './shared/material.module';
import { LightboxComponent } from './shared/lightbox/lightbox.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './pages/home/home.component';
import { GardeningComponent } from './pages/gardening/gardening.component';
import { PlantInventoryComponent } from './pages/inventory/inventory.component';
import { ContactComponent } from './pages/contact/contact.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { FooterComponent } from './shared/footer/footer.component';
import { ReserveComponent } from './pages/reserve/reserve.component';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { Environment } from '../environments/environment';
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';
import { AdminPanelComponent } from './admin/admin-panel/admin-panel.component';
import { PlantCrudComponent } from './admin/plant-crud/plant-crud.component';
import { CategoryCrudComponent } from './admin/category-crud/category-crud.component';
import { PlantEditDialogComponent } from './admin/plant-edit-dialog/plant-edit-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GardeningComponent,
    PlantInventoryComponent,
    ContactComponent,
    LightboxComponent,
    FooterComponent,
    ReserveComponent,
    AdminLoginComponent,
    AdminPanelComponent,
    PlantCrudComponent,
    CategoryCrudComponent,
    PlantEditDialogComponent,
  ],
  imports: [
    SharedModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    LayoutModule,
    AngularFireModule.initializeApp(Environment.firebase),
    AngularFirestoreModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
