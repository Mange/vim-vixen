import * as keys from './keys';
import * as inputActions from '../actions/input';
import * as operationActions from '../actions/operation';
import * as consoleActions from '../actions/console';
import * as settingsActions from '../actions/setting';
import BackgroundComponent from '../components/background';
import reducers from '../reducers';
import messages from '../content/messages';
import * as store from '../store';

let prevInput = [];
let settings = {};

const backgroundStore = store.createStore(reducers, (e, sender) => {
  console.error('Vim-Vixen:', e);
  if (sender) {
    backgroundStore.dispatch(consoleActions.showError(e.message), sender);
  }
});
const backgroundComponent = new BackgroundComponent(backgroundStore);
backgroundStore.subscribe((sender) => {
  backgroundComponent.update(sender);
});
backgroundStore.subscribe((sender) => {
  let currentInput = backgroundStore.getState().input;
  if (JSON.stringify(prevInput) === JSON.stringify(currentInput)) {
    return;
  }
  prevInput = currentInput;

  if (currentInput.keys.length === 0) {
    return;
  }
  if (sender) {
    return keyQueueChanged(backgroundStore.getState(), sender);
  }
});
backgroundStore.subscribe((sender) => {
  if (sender) {
    return browser.tabs.sendMessage(sender.tab.id, {
      type: messages.STATE_UPDATE,
      state: backgroundStore.getState()
    });
  }
});
backgroundStore.subscribe(() => {
  let state = backgroundStore.getState().setting;
  if (!state.settings.json) {
    return;
  }
  settings = JSON.parse(backgroundStore.getState().setting.settings.json);
});

const keyQueueChanged = (state, sender) => {
  let prefix = keys.asKeymapChars(state.input.keys);
  let matched = Object.keys(settings.keymaps).filter((keyStr) => {
    return keyStr.startsWith(prefix);
  });
  if (matched.length === 0) {
    backgroundStore.dispatch(inputActions.clearKeys(), sender);
    return Promise.resolve();
  } else if (matched.length > 1 ||
    matched.length === 1 && prefix !== matched[0]) {
    return Promise.resolve();
  }
  let action = settings.keymaps[matched];
  backgroundStore.dispatch(
    operationActions.exec(action, sender.tab, settings), sender);
  backgroundStore.dispatch(inputActions.clearKeys(), sender);
};

const initializeSettings = () => {
  backgroundStore.dispatch(settingsActions.load());
};

initializeSettings();
