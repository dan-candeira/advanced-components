import { Observable } from "rxjs";
import { PctStep } from "./stepper";

export interface AbstractControlLike {
  asyncValidator: ((control: any) => any) | null;
  dirty: boolean;
  disabled: boolean;
  enabled: boolean;
  errors: { [key: string]: any } | null;
  invalid: boolean;
  parent: any;
  pending: boolean;
  pristine: boolean;
  root: AbstractControlLike;
  status: string;
  readonly statusChanges: Observable<any>;
  touched: boolean;
  untouched: boolean;
  updateOn: any;
  valid: boolean;
  validator: ((control: any) => any) | null;
  value: any;
  readonly valueChanges: Observable<any>;
  clearAsyncValidators(): void;
  clearValidators(): void;
  disable(opts?: any): void;
  enable(opts?: any): void;
  get(path: (string | number)[] | string): AbstractControlLike | null;
  getError(errorCode: string, path?: (string | number)[] | string): any;
  hasError(errorCode: string, path?: (string | number)[] | string): boolean;
  markAllAsTouched(): void;
  markAsDirty(opts?: any): void;
  markAsPending(opts?: any): void;
  markAsPristine(opts?: any): void;
  markAsTouched(opts?: any): void;
  markAsUntouched(opts?: any): void;
  patchValue(value: any, options?: Object): void;
  reset(value?: any, options?: Object): void;
  setAsyncValidators(
    newValidator: (control: any) => any | ((control: any) => any)[] | null
  ): void;
  setErrors(errors: { [key: string]: any } | null, opts?: any): void;
  setParent(parent: any): void;
  setValidators(
    newValidator: (control: any) => any | ((control: any) => any)[] | null
  ): void;
  setValue(value: any, options?: Object): void;
  updateValueAndValidity(opts?: any): void;
  patchValue(value: any, options?: any): void;
  reset(formState?: any, options?: any): void;
  setValue(value: any, options?: any): void;
}

/** The state of each step. */
export type StepState = "number" | "done" | "error" | string;

export class StepperSelectionEvent {
  /** Index of the step now selected. */
  selectedIndex: number;

  /** Index of the step previously selected. */
  previouslySelectedIndex: number;

  /** The step instance now selected. */
  selectedStep: PctStep;

  /** The step instance previously selected. */
  previouslySelectedStep: PctStep;
}

export enum KEYCODES {
  esc = 27,
  up = 38,
  space = 32,
  enter = 13,
  down = 40,
  tab = 9,
  left = 37,
  right = 39,
}

export enum KEYS {
  esc = "Escape",
  up = "ArrowUp",
  space = " ",
  enter = "Enter",
  down = "ArrowDown",
  tab = "Tab",
  left = "ArrowLeft",
  right = "ArrowRight",
}
