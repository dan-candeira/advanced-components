import { Directive, forwardRef, Inject, Input, Optional } from "@angular/core";

import { PctStepper } from "./stepper";

/** Button that moves to the next step in a stepper workflow. */
@Directive({
  selector: "button[pctStepperNext]",
  host: {
    "[type]": "type",
    "(click)": "_stepper.next()",
  },
})
export class PctStepperNext {
  /** Type of the next button. Defaults to "submit" if not specified. */
  @Input() type: string = "submit";

  constructor(
    @Optional()
    @Inject(forwardRef(() => PctStepper))
    public _stepper: PctStepper
  ) {}
}

/** Button that moves to the previous step in a stepper workflow. */
@Directive({
  selector: "button[pctStepperPrevious]",
  host: {
    "[type]": "type",
    "(click)": "_stepper.previous()",
  },
})
export class PctStepperPrevious {
  /** Type of the previous button. Defaults to "button" if not specified. */
  @Input() type: string = "button";

  constructor(
    @Optional()
    @Inject(forwardRef(() => PctStepper))
    public _stepper: PctStepper
  ) {}
}
