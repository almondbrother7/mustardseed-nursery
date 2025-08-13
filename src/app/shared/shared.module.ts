import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorySelectComponent } from './components/category-select/category-select.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MarkdownOrBreaksPipe } from './pipes/markdown-or-breaks.pipe';


@NgModule({
  declarations: [
    CategorySelectComponent,
    MarkdownOrBreaksPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule
  ],
  exports: [
    CategorySelectComponent,
    MarkdownOrBreaksPipe
  ]
})
export class SharedModule {}
