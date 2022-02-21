import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './components/player/player.component';
import { NoopAnimationsModule} from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import {MatSliderModule} from "@angular/material/slider";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from '@angular/material/icon';
import {MatRippleModule} from "@angular/material/core";
import {MatListModule} from "@angular/material/list";
import {MatTabsModule} from "@angular/material/tabs";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import {FormsModule} from "@angular/forms";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatBadgeModule} from "@angular/material/badge";
import { PlayerControlComponent} from "./components/player-control/player-control.component";
import { PlaylistControlComponent} from "./components/playlist-control/playlist-control.component";
import { ZoneControlComponent } from './components/zone-control/zone-control.component';
import {StreamItemComponent} from "./components/zone-control/stream-item/stream-item.component";
import { VolumeControlComponent} from "./components/volume-control/volume-control.component";
import { ClientItemComponent } from './components/zone-control/client-item/client-item.component';
import { MediaControlComponent } from './components/media-control/media-control.component';
import { TracklistItemComponent } from './components/playlist-control/tracklist-item/tracklist-item.component';
import { TracklistComponent } from './components/playlist-control/tracklist/tracklist.component';
import { PlaylistSelectionComponent } from './components/playlist-control/playlist-selection/playlist-selection.component';
import { PlaylistSelectionItemComponent } from './components/playlist-control/playlist-selection-item/playlist-selection-item.component';
import { SearchResultItemComponent } from './components/media-control/search-result-item/search-result-item.component';
import {SearchResultListComponent} from "./components/media-control/search-result-list/search-result-list.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    PlayerControlComponent,
    PlaylistControlComponent,
    ZoneControlComponent,
    StreamItemComponent,
    VolumeControlComponent,
    ClientItemComponent,
    MediaControlComponent,
    TracklistItemComponent,
    TracklistComponent,
    PlaylistSelectionComponent,
    PlaylistSelectionItemComponent,
    SearchResultItemComponent,
    SearchResultListComponent
  ],
  imports: [
    MatSliderModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NoopAnimationsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatRippleModule,
    MatListModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatInputModule,
    MatMenuModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatCheckboxModule,
    DragDropModule
  ],
  exports: [],
  providers: [
      /*//
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppConfig],
      multi: true
    }

       */
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
