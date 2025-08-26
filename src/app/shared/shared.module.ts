import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorySelectComponent } from './components/category-select/category-select.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MarkdownOrBreaksPipe } from './pipes/markdown-or-breaks.pipe';
import { HighlightPipe } from './pipes/highlight.pipe';


@NgModule({
  declarations: [
    CategorySelectComponent,
    MarkdownOrBreaksPipe,
    HighlightPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule
  ],
  exports: [
    CategorySelectComponent,
    MarkdownOrBreaksPipe,
    HighlightPipe,
  ]
})
export class SharedModule {}
