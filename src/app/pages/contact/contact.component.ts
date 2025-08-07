import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Environment } from '../../../environments/environment';
import { take } from 'rxjs';
import { ReservationService } from 'src/app/services/reservation.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  @ViewChild('contactForm') contactFormRef!: ElementRef;
  @ViewChild('messageBox') messageBoxRef!: ElementRef<HTMLTextAreaElement>;

  private readonly formspreeEndpoint = Environment.formspreeEndpoint;
  plantName: string = '';
  plantID: string = '';
  isSubmitting = false;
  successMessage = '';
  formData = {
    name: '',
    email: '',
    message: '',
    site: 'The Mustard Seed Nursery',
    plantName: '',
    plantID: '',
    website: ''
  };
  errorMessage = '';
  formDescription: string = 'Send us a quick note:';
  isReserving: boolean = false;
  
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const message = params['message'];
      this.plantName = decodeURIComponent(params['plantName'] || '');
      this.plantID = params['id'] || '';

      if (message) {
        this.formDescription = 'Please complete the form below to reserve your plants';
        this.isReserving = true;
        if (!this.formData.message) this.formData.message = message;
        this.highlightAndScrollForm();
        this.clearQueryParams();

        return;
      }

      // Inventory
      if (this.plantName) {
        this.formDescription = 'Please complete the form below to reserve your plants';
        this.isReserving = true;
        if (!this.formData.message) this.formData.message = `I'm interested in ordering the following plant: ${this.plantName}`;
        this.formData.plantName = this.plantName;
        this.formData.plantID = this.plantID;

        this.highlightAndScrollForm();
        this.clearQueryParams();
      }
    });
  }



  onSubmit(contactForm: NgForm) {
    if (contactForm.invalid) {
      contactForm.control.markAllAsTouched();
      this.errorMessage = '❌ Please fix the errors above.';
      return;
    }

    const formEl = contactForm.form.getRawValue() as {
      name: string;
      email: string;
      message: string;
      site?: string;
      plantName?: string;
      plantID?: string;
      website?: string;
    };

    // Honeypot check
    const honeypot = formEl.website;
    if (honeypot) {
      console.warn('[Nursery] Honeypot triggered - likely a bot.');
      return;
    }

    const formData = new FormData();
    formData.append('name', formEl.name.trim());
    formData.append('email', formEl.email.trim());
    formData.append('message', formEl.message.trim());
    if (formEl.site) formData.append('site', formEl.site);
    if (formEl.plantName) formData.append('plantName', formEl.plantName);
    if (formEl.plantID) formData.append('plantID', formEl.plantID);

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.http.post(this.formspreeEndpoint, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = '✅ Your message has been sent successfully!';
        contactForm.resetForm(); // Reset form and validation state
        if (this.isReserving) {
          this.reservationService.clear();
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = '❌ Something went wrong. Please try again later.';
      }
    });
  }

  private highlightAndScrollForm() {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      if (this.messageBoxRef?.nativeElement) {
        this.messageBoxRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.messageBoxRef.nativeElement.focus();
      }
    });
  }

  private clearQueryParams() {
      this.router.navigate([], {
        queryParams: {},
        replaceUrl: true
      });
    }

}
