import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  @ViewChild('contactForm') contactFormRef!: ElementRef;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  private readonly formspreeEndpoint = environment.formspreeEndpoint;
  plantName: string = '';
  plantID: string = '';
  
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const message = params['message'];
      this.plantName = decodeURIComponent(params['plantName'] || '');
      this.plantID = params['id'] || '';

      // Order form
      if (message) {
        setTimeout(() => {
          const messageBox = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
          if (messageBox) {
            messageBox.value = message;
          }

          this.highlightAndScrollForm();
          this.clearQueryParams();
        }, 100);

        return; // don't also run plantName logic
      }

      // Inventory
      if (this.plantName) {
        setTimeout(() => {
          const messageBox = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
          if (messageBox) {
            messageBox.value = `I'm interested in ordering the following plant: ${this.plantName}`;
          }

          const nameField = document.querySelector('input[name="plantName"]') as HTMLInputElement;
          const idField = document.querySelector('input[name="plantID"]') as HTMLInputElement;
          if (nameField) nameField.value = this.plantName;
          if (idField) idField.value = this.plantID;

          this.highlightAndScrollForm();
          this.clearQueryParams();
        }, 100);
      }
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const honeypot = (form.querySelector('input[name="website"]') as HTMLInputElement)?.value;
    if (honeypot) {
      console.warn('[Playdate] Honeypot triggered - likely a bot.');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post(this.formspreeEndpoint, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = '✅ Your message has been sent successfully!';
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = '❌ Something went wrong. Please try again later.';
      }
    });
  }

  private highlightAndScrollForm() {
    const formElement = this.contactFormRef?.nativeElement as HTMLElement;
    if (formElement) {
      formElement.classList.add('flash-highlight');
      setTimeout(() => formElement.classList.remove('flash-highlight'), 1200);
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private clearQueryParams() {
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true
    });
  }

}
