import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private _socket: SocketIOClient.Socket;
  private _connected: boolean = false;
  get connected(): boolean {return this._connected;}

  constructor() {
    this._socket = io.connect(`http://${window.location.hostname}:3000`);

    this._socket.on('connect', () => {
      this._connected = true;
    });

    this._socket.on('disconnect', () => {
      this._connected = false;
    });

  }

  on<T>(channel: string, cb: (data: T) => void): void {
    this._socket.on(channel, cb);
  }

  emit<T>(channel: string, data: T): void {
    this._socket.emit(channel, data);
  }
}
