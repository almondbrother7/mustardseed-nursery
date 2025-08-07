import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorySelectComponent } from './components/category-select/category-select.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CategorySelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule
  ],
  exports: [CategorySelectComponent]
})
export class SharedModule {}
