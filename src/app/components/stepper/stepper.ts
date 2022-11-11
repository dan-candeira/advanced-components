import { CdkPortalOutlet, TemplatePortal } from "@angular/cdk/portal";
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { map, startWith, switchMap, takeUntil } from "rxjs/operators";
import { AbstractControlLike, StepperSelectionEvent, StepState } from "./model";
import { PctStepHeader } from "./step-header";
import { PctStepLabel } from "./step-label";

@Component({
  selector: "pct-step",
  exportAs: "pctStep",
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PctStep implements AfterContentInit, OnChanges {
  private _isSelected = Subscription.EMPTY;
  _stepper: PctStepper;

  /** Template for step label if it exists. */
  @ContentChild(PctStepLabel, { static: true }) stepLabel: PctStepLabel;

  // @ContentChild(PctStepContent, { static: false })
  // _lazyContent: PctStepContent;

  /** Template for step content. */
  @ViewChild(TemplateRef, { static: true }) content: TemplateRef<any>;

  /** The top level abstract control of the step. */
  @Input() stepControl: AbstractControlLike;

  /** Whether user has attempted to move away from the step. */
  interacted = false;

  /** Emits when the user has attempted to move away from the step. */
  @Output("interacted")
  readonly interactedStream: EventEmitter<PctStep> = new EventEmitter<PctStep>();

  /** Plain text label of the step. */
  @Input() label: string;

  /** Error message to display when there's an error. */
  @Input() errorMessage: string;

  /** Aria label for the tab. */
  @Input("aria-label") ariaLabel: string;

  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input("aria-labelledby") ariaLabelledby: string;

  private _customError: boolean | null = null;

  /** State of the step. */
  @Input() state: StepState;

  /** Whether step is marked as completed. */
  @Input()
  get completed(): boolean {
    return this._completedOverride == null
      ? this._getDefaultCompleted()
      : this._completedOverride;
  }
  set completed(value: boolean) {
    this._completedOverride = Boolean(value);
  }
  _completedOverride: boolean | null = null;

  private _getDefaultCompleted() {
    return this.stepControl
      ? this.stepControl.valid && this.interacted
      : this.interacted;
  }

  constructor(
    @Inject(forwardRef(() => PctStepper))
    _stepper,
    private _viewContainerRef: ViewContainerRef
  ) {
    // Hack to fiz the injection - for some reason it was broken
    this._stepper = _stepper;
  }

  ngAfterContentInit(): void {
    this._isSelected = this._stepper.steps.changes
      .pipe(
        switchMap(() => {
          return this._stepper.selectionChange.pipe(
            map((event) => {
              return event.selectedStep === this;
            }),
            startWith(this._stepper.selected === this)
          );
        })
      )
      .subscribe((isSelected) => {
        if (isSelected) {
          this._updateContentView();
        }
      });
  }

  ngOnChanges() {
    // Since basically all inputs of the MatStep get proxied through the view down to the
    // underlying MatStepHeader, we have to make sure that change detection runs correctly.
    this._stepper._stateChanged();
  }

  /** Selects this step component. */
  select(): void {
    this._stepper.selected = this;
    this._updateContentView();
  }

  /** Resets the step to its initial state. Note that this includes resetting form data. */
  reset(): void {
    this.interacted = false;

    if (this._completedOverride != null) {
      this._completedOverride = false;
    }

    if (this._customError != null) {
      this._customError = false;
    }

    if (this.stepControl) {
      this.stepControl.reset();
    }
  }

  _markAsInteracted() {
    if (!this.interacted) {
      this.interacted = true;
      this.interactedStream.emit(this);
    }
  }

  _updateContentView() {
    this._stepper._selectedPortal = new TemplatePortal(
      this.content,
      this._viewContainerRef
    );
  }
}

@Component({
  selector: "pct-stepper",
  templateUrl: "./stepper.html",
  styleUrls: ["./stepper.scss"],
  exportAs: "pctStepper",
})
export class PctStepper implements AfterContentInit, AfterViewInit, OnDestroy {
  protected readonly _destroyed = new Subject<void>();

  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(PctStepHeader)
  _stepHeader: QueryList<PctStepHeader>;

  /** Full list of steps inside the stepper, including inside nested steppers. */
  @ContentChildren(forwardRef(() => PctStep), { descendants: true })
  _steps: QueryList<PctStep>;

  /** The top level abstract control of the step. */
  @Input() stepControl: AbstractControlLike;

  @Input() label: string;

  /** Aria label for the tab. */
  @Input("aria-label") ariaLabel: string;

  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input("aria-labelledby") ariaLabelledby: string;

  /** State of the step. */
  @Input() state: StepState;

  steps: QueryList<PctStep> = new QueryList<PctStep>();

  /** List of step headers sorted based on their DOM order. */
  private _sortedHeaders: QueryList<PctStepHeader> =
    new QueryList<PctStepHeader>();

  /** Portal */
  @ViewChild(CdkPortalOutlet, { static: true }) _portalHost: CdkPortalOutlet;

  @Input()
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  _selectedPortal: TemplatePortal<any> | null = null;

  set selectedIndex(index: number) {
    const newIndex = Number(index);

    if (this.steps && this._steps) {
      // Ensure that the index can't be out of bounds.
      if (!this._isValidIndex(newIndex)) {
        throw Error(
          "pctStepper: Cannot assign out-of-bounds value to `selectedIndex`."
        );
      }

      if (this.selected) {
        this.selected._markAsInteracted();
      }

      if (
        this._selectedIndex !== newIndex &&
        !this._anyControlsInvalidOrPending(newIndex)
      ) {
        this._updateSelectedItemIndex(newIndex);
      }
    } else {
      this._selectedIndex = newIndex;
    }
  }

  private _selectedIndex = 0;

  /** The step that is selected. */
  @Input()
  get selected(): PctStep | undefined {
    return this.steps ? this.steps.toArray()[this.selectedIndex] : undefined;
  }

  set selected(step: PctStep | undefined) {
    this.selectedIndex =
      step && this.steps ? this.steps.toArray().indexOf(step) : -1;
  }

  /** Event emitted when the selected step has changed. */
  get focused(): PctStepHeader | undefined {
    return this._sortedHeaders
      ? this._sortedHeaders.toArray()[this._focusedIndex]
      : undefined;
  }

  set focused(stepHeader: PctStepHeader | undefined) {
    this._focusedIndex =
      stepHeader && this._sortedHeaders
        ? this._sortedHeaders.toArray().indexOf(stepHeader)
        : -1;
  }

  private _focusedIndex = 0;

  get focusedIndex(): number {
    return this._focusedIndex;
  }

  set focusedIndex(index: number) {
    const newIndex = Number(index);

    if (this._stepHeader && this._sortedHeaders) {
      // Ensure that the index can't be out of bounds.
      if (!this._isValidIndex(newIndex)) {
        throw Error(
          "pctStepper: Cannot assign out-of-bounds value to `selectedIndex`."
        );
      }

      if (this.focused) {
        // TODO: fix this to avoid focus stealing
        console.log("focussssed", this.focused);
        this._focusedIndex = newIndex;
        this.focused.focus();
      }

      // if (
      //   this._selectedIndex !== newIndex &&
      //   !this._anyControlsInvalidOrPending(newIndex)
      // ) {
      //   this._updateSelectedItemIndex(newIndex);
      // }
    } else {
      this._focusedIndex = newIndex;
    }
  }

  /** Event emitted when the selected step has changed. */
  @Output() readonly selectionChange =
    new EventEmitter<StepperSelectionEvent>();

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>
  ) {}

  ngAfterViewInit(): void {
    this._stepHeader.changes
      .pipe(startWith(this._stepHeader), takeUntil(this._destroyed))
      .subscribe((headers: QueryList<PctStepHeader>) => {
        console.log(headers.toArray());
        this._sortedHeaders.reset(
          headers.toArray().sort((a, b) => {
            const documentPosition =
              a._elementRef.nativeElement.compareDocumentPosition(
                b._elementRef.nativeElement
              );

            // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
            // tslint:disable-next-line:no-bitwise
            return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          })
        );
        this._sortedHeaders.notifyOnChanges();

        // No need to `takeUntil` here, because we're the ones destroying `steps`.
        this.steps.changes.subscribe(() => {
          if (!this.selected) {
            this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
          }
        });

        // The logic which asserts that the selected index is within bounds doesn't run before the
        // steps are initialized, because we don't how many steps there are yet so we may have an
        // invalid index on init. If that's the case, auto-correct to the default so we don't throw.
        if (!this._isValidIndex(this._selectedIndex)) {
          this._selectedIndex = 0;
        }

        if (!this._isValidIndex(this._focusedIndex)) {
          this._focusedIndex = 0;
        }
      });
  }

  ngAfterContentInit() {
    this._steps.changes
      .pipe(startWith(this._steps), takeUntil(this._destroyed))
      .subscribe((steps: QueryList<PctStep>) => {
        this.steps.reset(steps.filter((step) => step._stepper === this));
        this.steps.notifyOnChanges();
      });
  }

  ngOnDestroy() {
    this.steps.destroy();
    this._sortedHeaders.destroy();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Selects and focuses the next step in list. */
  next(): void {
    const index = Math.min(this._selectedIndex + 1, this.steps.length - 1);
    this.selectedIndex = index;
    this.focusedIndex = index;
  }

  /** Selects and focuses the previous step in list. */
  previous(): void {
    const index = Math.max(this._selectedIndex - 1, 0);
    this.selectedIndex = index;
    this.focusedIndex = index;
  }

  private _updateSelectedItemIndex(newIndex: number): void {
    const stepsArray = this.steps.toArray();
    this.selectionChange.emit({
      selectedIndex: newIndex,
      previouslySelectedIndex: this._selectedIndex,
      selectedStep: stepsArray[newIndex],
      previouslySelectedStep: stepsArray[this._selectedIndex],
    });

    this._selectedIndex = newIndex;
    this._stateChanged();
  }

  _stepIsNavigable(index: number, step: PctStep): boolean {
    return step.completed || this.selectedIndex === index;
  }

  _stateChanged() {
    this._changeDetectorRef.markForCheck();
  }

  private _anyControlsInvalidOrPending(index: number): boolean {
    if (index >= 0) {
      return this.steps
        .toArray()
        .slice(0, index)
        .some((step) => {
          const control = step.stepControl;
          const isIncomplete = control
            ? control.invalid || control.pending || !step.interacted
            : !step.completed;
          return isIncomplete && !step._completedOverride;
        });
    }

    return false;
  }

  /** Checks whether the passed-in index is a valid step index. */
  private _isValidIndex(index: number): boolean {
    return index > -1 && (!this.steps || index < this.steps.length);
  }

  /** Resets the stepper to its initial state. Note that this includes clearing form data. */
  reset(): void {
    this._updateSelectedItemIndex(0);
    this.steps.forEach((step) => step.reset());
    this._stateChanged();
  }

  _getFocusIndex(): number {
    return this.focusedIndex;
  }

  handleRightKey(): void {
    this.focusedIndex = Math.min(
      this._focusedIndex + 1,
      this._sortedHeaders.length - 1
    );

    console.log(this.focused);
  }

  handleLeftKey(): void {
    this.focusedIndex = Math.max(this._focusedIndex - 1, 0);
  }
}
