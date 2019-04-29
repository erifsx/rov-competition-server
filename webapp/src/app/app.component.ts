import {Component, OnDestroy, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {WebsocketService} from "./websocket.service";
import {Observable, Subscription} from "rxjs";
import {LoggingService} from "./logging.service";
import {RobotService} from "./robot.service";
import {GamepadService} from "./gamepad.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'webapp';
  videoUrl: SafeResourceUrl;
  private messageLog: string[];
  private _messageSub: Subscription;

  constructor(private _sanitizer: DomSanitizer,
              public ws: WebsocketService,
              public logging: LoggingService,
              public robot: RobotService,
              public gamepad: GamepadService) {
  }


  ngOnInit(): void {
    this.videoUrl = this._sanitizer.bypassSecurityTrustResourceUrl('http://' + window.location.hostname + ':11000');
    this._messageSub= this.logging.log$.subscribe(log => {
      this.messageLog = log;
    });

    this.gamepad.start();
  }

  ngOnDestroy(): void {
    if(this._messageSub) {
      this._messageSub.unsubscribe();
      this._messageSub = undefined;
    }
  }

}
