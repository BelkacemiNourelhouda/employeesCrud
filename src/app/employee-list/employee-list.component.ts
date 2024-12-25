import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { CommonModule } from '@angular/common';
import { Employee } from '../employee.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown'; // For p-dropdown
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  standalone: true,
  styleUrls: ['./employee-list.component.css',
  ],
  imports: [CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    SelectButtonModule,
    FormsModule,
    DropdownModule,
    ConfirmDialogModule,
    DialogModule,
    ToolbarModule,
    InputTextModule,
    InputGroupModule,
  ],
  providers: [ConfirmationService, NgModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})

export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  employee: Employee = new Employee();
  emp: Employee[] = [];
  selectedEmployees: Employee[] = [];
  employeeDialog: boolean = false;
  employeeADialog: boolean = false;
  employeeDDialog: boolean = false;
  employeeForm!: FormGroup;
  cols: any[] = [];
  id!: number;

  constructor(
    private fb: FormBuilder, // Inject FormBuilder
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.getEmployees();
    this.initColumns();
    this.initForm();
  }

  private getEmployees() {
    this.employeeService.getAll().subscribe(data => {
      this.employees = data;
    });
  }

  private initForm() {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    });
  }

  private initColumns() {
    this.cols = [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'phone', header: 'Phone' },
    ];
  }

  hideDialog(): void {
    this.employeeDialog = false;
    this.employeeDDialog = false;
    this.employeeADialog = false;
  }

  refreshEmployees(): void {
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error("Failed to fetch employees:", error);
      }
    });
  }

  getEventValue(event: Event): string {
    let value = '';
    if (event) {
      value = (event.target as HTMLInputElement).value;
    }
    return value;
  }

  refreshSearchBar(filterInput: HTMLInputElement, event: Event): string {
    filterInput.value = '';
    let value = '';
    if (event) {
      value = (event.target as HTMLInputElement).value;
    }
    return value;
  }

  addEmployee() {
    this.employeeForm.reset();
    this.employeeADialog = true;
  }

  submitNewEmp() {
    if (this.employeeForm.valid) {
      const employeeData = this.employeeForm.value;
      this.employeeService.create(employeeData).subscribe(
        {
          next: (data) => {
            console.log('Employee added successfully:', data);
            this.employeeADialog = false;
            this.refreshEmployees();
          },
          error: (error) => {
            console.error('Error adding employee:', error);
          }
        }
      );
    } else {
      console.error('Form is invalid');
    }
  }

  updateEmployee() {
    if (this.selectedEmployees.length === 1) {
      this.employee = { ...this.selectedEmployees[0] };
      console.log('Employee:', this.employee);
      this.employeeForm.patchValue(this.employee);
      console.log('Employee form:', this.employeeForm);
      this.employeeDialog = true;
    }
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      const updatedEmployee = this.employeeForm.value;

      this.id = this.selectedEmployees.map((employee) => employee.id)[0];
      this.employee = { id: this.id, ...updatedEmployee };

      this.employeeService.update(this.employee).subscribe(
        {
          next: (data) => {
            console.log('Employee updated:', data);
            this.router.navigate(['employees']);
            this.employeeDialog = false;
            this.selectedEmployees = [];
            this.refreshEmployees();
          },
          error: (error) => {
            console.error('Error updating employee:', error);
          }
        }
      );
    }
  }

  detailEmployee() {
    if (this.selectedEmployees.length === 1) {
      this.employee = { ...this.selectedEmployees[0] };
      this.employeeForm.patchValue(this.employee);

      if (this.employeeForm.valid) {
        this.employee = { ...this.selectedEmployees[0] };
        this.employeeDDialog = true;
        const idD = this.selectedEmployees.map((employee) => employee.id);
        this.id = idD[0];
        this.employeeService.get(this.id).subscribe(
          {
            next: (data) => {
              console.log(`we got Employee n ${this.id} Mr. ${this.employee.name}.`);
              this.router.navigate(['employees']);
              this.selectedEmployees = [];

            },
            error: (error) => {
              console.log(error);
            }
          }
        );
      }
    } else {
      console.log("No employee selected for detail or more than 1 employee selected.");
    }
  }


  deleteEmployees(): void {
    if (this.selectedEmployees.length === 0) {
      console.log("No employees selected for deletion.");
      return;
    }

    const idsToDelete = this.selectedEmployees.map((employee) => employee.id);

    idsToDelete.forEach((id) => {
      this.employeeService.delete(id).subscribe({
        next: () => {
          console.log(`Employee with ID ${id} deleted.`);
          this.getEmployees(); // Refresh the list after each deletion
        },
        error: (err) => console.error(`Error deleting employee with ID ${id}:`, err),
      });
    });
    this.selectedEmployees = [];
  }


  exportCSV(event: Event): void {
    const csvData = this.convertToCSV(this.employees);
    this.downloadCSV(csvData, 'employees.csv');
  }
  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(','); // Create headers
    const rows = data.map(obj => Object.values(obj).join(',')); // Create rows
    return [headers, ...rows].join('\n');
  }

  private downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();

    window.URL.revokeObjectURL(url);
  }

}


/*

  filterResults(text: string) {
    if (!text) {
      this.emp = this.employees;
      this.employees = [...this.emp];
      return;
    }

    this.employees = this.employees.filter(employee =>
      employee?.name.toLowerCase().includes(text.toLowerCase())
    );
    return;

  }
  refreshSearchBar(filterInput: HTMLInputElement): void {
    filterInput.value = '';

    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (error) => {
        console.error("Failed to fetch employees:", error);
      }
    });
  }

 sizes: any[] = [
   { label: 'Small', value: 'S' },
   { label: 'Medium', value: 'M' },
   { label: 'Large', value: 'L' }
 ];

 selectedSize: string = '';


 first: number = 0;

 prev() {
   this.first = Math.max(this.first - 10, 0);
 }

 next() {
   this.first = Math.min(this.first + 10, this.employees.length - 10);
 }

 isFirstPage(): boolean {
   return this.first === 0;
 }

 isLastPage(): boolean {
   return this.first >= this.employees.length - 10;
 }

 reset() {
   this.first = 0;
 }

 pageChange(event: any) {
   this.first = event.first;
 }


*/


