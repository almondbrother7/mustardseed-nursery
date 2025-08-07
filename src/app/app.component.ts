import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { UserService } from './services/user-service';
import { ReservationService } from './services/reservation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mustardseed-nursery';
  isMobile = false;
  reservedCount = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private reservationService: ReservationService,
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset, '(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    this.reservationService.updateReservedCountFromStorage?.();

    this.reservationService.getReservedCount().subscribe(count => {
      this.reservedCount = count;
    });
  }

  get isAdmin (): any {
    return this.userService.getAdminStatus();
  }

}
