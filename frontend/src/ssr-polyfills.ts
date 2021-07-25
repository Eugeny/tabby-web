import * as domino from 'domino';
import * as fs from 'fs';
import * as path from 'path';

const template = fs.readFileSync(path.join(process.cwd(), 'build', 'index.html')).toString();
const win = domino.createWindow(template);

global['window'] = win;

Object.defineProperty(win.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  },
});

Object.defineProperty(win.document.body.style, 'z-index', {
  value: () => {
      return {
          enumerable: true,
          configurable: true
      };
  },
});

global['document'] = win.document;
global['CSS'] = null;
// global['atob'] = win.atob;
global['atob'] = (base64: string) => {
  return Buffer.from(base64, 'base64').toString();
};

function setDomTypes() {
  // Make all Domino types available as types in the global env.
  Object.assign(global, domino['impl']);
  (global as any)['KeyboardEvent'] = domino['impl'].Event;
}

setDomTypes();
