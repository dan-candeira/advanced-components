import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Output,
} from "@angular/core";
import { KEYCODES, KEYS } from "./model";

@Directive({
  selector: "[pctStepperKeyHandler]",
})
export class PctStepperKeyHandler {
  @Output() keyRight: EventEmitter<void> = new EventEmitter();
  @Output() keyLeft: EventEmitter<void> = new EventEmitter();

  @HostListener("keydown", ["$event"]) onKeyDown(event: KeyboardEvent): void {
    this.handleKeyDown(event);
  }

  handleKeyDown(event: KeyboardEvent): void {
    // tslint:disable-next-line
    const key = event.key || event.keyCode;

    switch (key) {
      case KEYS.right:
      case KEYCODES.right:
        this.keyRight.emit();
        break;
      case KEYS.left:
      case KEYCODES.left:
        this.keyLeft.emit();
      default:
        break;
    }
  }
}
