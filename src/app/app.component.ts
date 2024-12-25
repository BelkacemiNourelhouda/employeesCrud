import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmployeeListComponent } from "./employee-list/employee-list.component";
import { PrimeNG } from 'primeng/config';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'employee-crud-app';
  constructor(private primeng: PrimeNG) { }

  ngOnInit() {
    this.primeng.zIndex = {
      modal: 1100,    // dialog, sidebar
      overlay: 1000,  // dropdown, overlaypanel
      menu: 1000,     // overlay menus
      tooltip: 1100,   // tooltip  
    }
  }

}
