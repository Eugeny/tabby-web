import { NgModule } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { AppComponent } from './components/app.component'
import { MainComponent } from './components/main.component';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        HttpClientXsrfModule,
        NgbDropdownModule,
        FontAwesomeModule,
    ],
    declarations: [
        AppComponent,
        MainComponent,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
