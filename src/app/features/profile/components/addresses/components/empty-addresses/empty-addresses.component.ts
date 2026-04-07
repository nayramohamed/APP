import { Component, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-addresses',
  imports: [TranslatePipe],
  templateUrl: './empty-addresses.component.html',
  styleUrl: './empty-addresses.component.css',
})
export class EmptyAddressesComponent {
  openForm = output();

  onOpenForm() {
    this.openForm.emit();
  }
}
