import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-socket',
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.scss'],
})
export class SocketComponent implements OnInit, OnDestroy {
  url = 'ws://localhost:3000';
  private socket: any;
  private socket1: any;
  msg = new FormControl('');
  msg2 = new FormControl('');

  cloverJoinRoom1 = { user: 'clover', room: 'room1', channel: 'vip' };
  hscJoinRoom1 = { user: 'hsc', room: 'room1', channel: 'vip' };

  constructor() {}

  ngOnInit(): void {}

  getIO() {
    this.socket.emit('list');
  }

  leaveRoom() {
    this.socket.emit('leave', {
      user: this.cloverJoinRoom1.user,
      room: this.cloverJoinRoom1.room,
      channel: this.cloverJoinRoom1.channel,
    });
  }

  joinRoom(who: string) {
    if (who === 'clover') {
      this.socket.emit('join', this.cloverJoinRoom1);
      this.socket.on(this.cloverJoinRoom1.room, (data: any) => {
        console.log(data);
        const el = document.createElement('li');
        el.innerHTML = data;
        document.querySelector('#clover-msg')?.appendChild(el);
      });
    }

    if (who === 'hsc') {
      this.socket1.emit('join', this.hscJoinRoom1);
      this.socket1.on(this.hscJoinRoom1.room, (data: any) => {
        console.log(data);
        const el = document.createElement('li');
        el.innerHTML = data;
        document.querySelector('#hsc-msg')?.appendChild(el);
      });
    }
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
    this.socket1.disconnect();
  }

  sendMessage(who: string) {
    if (who === 'clover') {
      const message = {
        user: this.cloverJoinRoom1.user,
        message: this.msg.value,
        room: this.cloverJoinRoom1.room,
      };

      this.socket.emit(message.room, message);
      const input = <HTMLInputElement>document.querySelector('#clover-input');
      input.value = '';
    }

    if (who === 'hsc') {
      const message = {
        user: this.hscJoinRoom1.user,
        message: this.msg2.value,
        room: this.hscJoinRoom1.room,
      };

      this.socket1.emit(message.room, message);
      const input = <HTMLInputElement>document.querySelector('#hsc-input');
      input.value = '';
    }
  }

  leave(who: string) {
    if (who === 'clover') {
      console.log(`clover Leave the Weboscket`);
      this.socket.emit('leave', this.cloverJoinRoom1);
      this.socket.disconnect();
    }

    if (who === 'hsc') {
      console.log(`hsc Leave the Weboscket`);
      this.socket1.emit('leave', this.hscJoinRoom1);
      this.socket1.disconnect();
    }
  }

  /**
   * Connect the socket
   *
   */
  connectSocket(namespace: string, who: string): void {
    if (who === 'clover') {
      if (this.socket) {
        console.log('Socket already connected');
      } else {
        this.socket = io(this.url);
        this.socket.nsp = '/' + namespace;
        this.socket.on('connect', () => {
          console.log('Socket connected');
        });
      }
    }

    if (who === 'hsc') {
      if (this.socket1) {
        console.log('Socket1 already connected');
      } else {
        this.socket1 = io(this.url);
        this.socket1.nsp = '/' + namespace;
        this.socket1.on('connect', () => {
          console.log('Socket1 connected');
        });
      }
    }

    this.socket.on('message', (data: any) => {
      console.warn(data);
      const el = document.createElement('li');
      el.innerHTML = data;
      document.querySelector('#chat-ul')?.appendChild(el);
    });
  }

  joinSocket(
    namespace: string,
    roomName: string,
    channelname: string,
    user: string
  ): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      this.socket = io(this.url);
      this.socket.nsp = '/' + namespace;
      this.socket.emit('join', {
        user: user,
        room: roomName,
        channel: channelname,
      });
      this.socket.on(channelname, (data: any) => {
        if (data) {
          observer.next(data);
        } else {
          observer.error('Error');
        }
      });
      return () => {
        this.socket.removeListener(channelname);
      };
    });
  }
}
