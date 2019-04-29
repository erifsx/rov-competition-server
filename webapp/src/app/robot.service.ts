import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {WebsocketService} from "./websocket.service";

@Injectable({
  providedIn: 'root'
})
export class RobotService {
  private _connected: boolean = false;
  get connected(): boolean {return this._connected;}

  constructor(private _ws: WebsocketService) {
    this._ws.on('robot-status', (status: string) => {
      if(status === 'connected') {
        this._connected = true;
      } else if(status === 'disconnected') {
        this._connected = false;
      }
    });
  }


}
