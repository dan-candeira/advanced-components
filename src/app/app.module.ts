import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PctStepperModule } from "./components/stepper/module";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, PctStepperModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
