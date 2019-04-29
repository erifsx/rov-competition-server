import {Injectable} from "@angular/core";
import {WebsocketService} from "./websocket.service";
import {LoggingService} from "./logging.service";

@Injectable({
  providedIn: 'root'
})
export class GamepadService {
  private _connected: boolean = false;
  private _interval: number;
  get connected(): boolean {
    return this._connected;
  }

  constructor(private _logger: LoggingService, private _ws: WebsocketService) {

  }

  start() {
    this._interval = setInterval(() => {
      const gamepads = navigator.getGamepads();
      this._connected = !!gamepads[0];

      if(gamepads[0]) {
        const gp = gamepads[0];
        this._ws.emit('gamepad', {
          leftStick: {
            x: gp.axes[0] || 0,
            y: -gp.axes[1] || 0
          },
          rightStick: {
            x: gp.axes[3] || 0,
            y: -gp.axes[4] || 0
          }
        });
      }
    }, 10);
  }

  stop() {
    if(this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
    }
  }
}
