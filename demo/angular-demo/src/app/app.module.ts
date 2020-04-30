import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AutocompleterComponent } from './autocompleter/autocompleter.component';

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, AutocompleterComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
