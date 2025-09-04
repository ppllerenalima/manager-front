import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dialog-usuario',
  imports: [],
  template: `<p>dialog-usuario works!</p>`,
  styleUrl: './dialog-usuario.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogUsuarioComponent { }
