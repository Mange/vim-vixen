import CommonComponent from '../common';
import FollowController from './follow-controller';
import * as consoleFrames from '../../console-frames';
import messages from 'shared/messages';

export default class TopContent {

  constructor(win, store) {
    this.win = win;
    this.children = [
      new CommonComponent(win, store),
      new FollowController(win, store),
    ];

    // TODO make component
    consoleFrames.initialize(window.document);
  }

  update() {
    this.children.forEach(c => c.update());
  }

  onMessage(message, sender) {
    switch (message.type) {
    case messages.CONSOLE_HIDE_COMMAND:
      this.win.focus();
      consoleFrames.blur(window.document);
      return Promise.resolve();
    }
    this.children.forEach(c => c.onMessage(message, sender));
  }
}
