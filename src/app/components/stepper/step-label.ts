import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[pctStepLabel]",
})
export class PctStepLabel {
  constructor(public template: TemplateRef<any>) {}
}
