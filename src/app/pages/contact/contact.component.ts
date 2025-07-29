import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  private readonly formspreeEndpoint = environment.formspreeEndpoint;

  constructor(private http: HttpClient) {}

  onSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // ✅ Honeypot anti-bot field
    const honeypot = (form.querySelector('input[name="website"]') as HTMLInputElement)?.value;
    if (honeypot) {
      console.warn('[Playdate] Honeypot triggered - likely a bot.');
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    // ✅ Send directly to Formspree
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
}
