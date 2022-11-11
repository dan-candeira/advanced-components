import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PctStepLabel } from "./step-label";
import { PctStep, PctStepper } from "./stepper";
import { PctStepHeader } from "./step-header";
import { PortalModule } from "@angular/cdk/portal";
import { PctStepperNext, PctStepperPrevious } from "./stepper-button";
import { PctStepperKeyHandler } from "./key-handler";

@NgModule({
  exports: [
    PctStepLabel,
    PctStepHeader,
    PctStepper,
    PctStep,
    PctStepperNext,
    PctStepperPrevious,
    PctStepperKeyHandler,
  ],
  imports: [CommonModule, PortalModule],
  declarations: [
    PctStepLabel,
    PctStepHeader,
    PctStepper,
    PctStep,
    PctStepperNext,
    PctStepperPrevious,
    PctStepperKeyHandler,
  ],
})
export class PctStepperModule {}
