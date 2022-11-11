import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewEncapsulation,
} from "@angular/core";
import { StepState } from "./model";
import { PctStepLabel } from "./step-label";

@Component({
  selector: "[pct-step-header]",
  templateUrl: "./step-header.html",
  host: {
    role: "tab",
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PctStepHeader {
  /** State of the given step. */
  @Input() state: StepState;

  /** Label of the given step. */
  @Input() label: PctStepLabel | string;

  /** Error message to display when there's an error. */
  @Input() errorMessage: string;

  /** Index of the given step. */
  @Input() index: number;

  /** Whether the given step is selected. */
  @Input() selected: boolean;

  constructor(public _elementRef: ElementRef<HTMLElement>) {}

  /** Returns string label of given step if it is a text label. */
  _stringLabel(): string | null {
    return this.label instanceof PctStepLabel ? null : this.label;
  }

  /** Returns MatStepLabel if the label of given step is a template label. */
  _templateLabel(): PctStepLabel | null {
    return this.label instanceof PctStepLabel ? this.label : null;
  }

  /** Returns the host HTML element. */
  _getHostElement() {
    return this._elementRef.nativeElement;
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }
}
