# windows-edge

Launch a new Microsoft Edge tab on Windows

## Installation

This module is installed via npm:

``` bash
$ npm install windows-edge
```

## Example

```js
const edge = require('windows-edge');

edge({ uri: 'https://github.com/' }, (err, ps) => {
  if (err) throw err;
  ps.on('error', console.error);
  ps.on('exit', (code) => {
    // Browser exited
  });
  setTimeout(() => {
    ps.kill();
  }, 2000);
})
```

Microsoft Edge needs to be installed on your system as well.

## API

### edge(opts, cb)

Options:

- `uri`: The uri to open up in a new tab in Microsoft Edge.
- `poll`: Whether to poll the Microsoft Edge process for external termination.
  (eg. user closing browser, crash, or process kill). Defaults to `true`.
- `pollInterval`: The interval in ms to poll for Microsoft Edge exit. Defaults
  to 2000. NB: Polling too often can cause Windows Quota violations.

### edge.kill(cb)

Kill the Microsoft Edge browser. This will kill the entire app. Not just the
tab you've spawned.

## Notes
It's not possible to launch multiple instances of Microsoft Edge.
So, launching a new URL will simply open a new tab in Microsoft Edge. It's
not easy to close the tab that's opened either. Calling `ps.kill()
to `true` will close down the whole browser. If you have other tabs that you
were using, this might be annoying. You have been warned.

This module also polls for the external termination (eg. user closing browser
or external process killing the browser through `edge.kill()`). This poll
happens every 2 seconds or so to avoid being rate limited by the operating
system.
