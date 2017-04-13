const it = require('tape');
const edge = require('..');
const tasklist = require('tasklist');

it('should be able to launch edge and shut it down', function (t) {
  t.plan(2);
  edge({ uri: 'https://github.com/', closeAll: true }, (err, ps) => {
    if (err) return t.error(err);
    ps.on('error', t.error);
    ps.on('exit', (code) => {
      t.equals(code, 0, 'exit cleanly');
      // wait for processes to shut down
      setTimeout(() => {
        tasklist().then(data => {
          let edgeProcesses = data.filter((p) =>
            ~['MicrosoftEdge.exe', 'MicrosoftEdgeCP.exe'].indexOf(p.imageName));
          t.equals(edgeProcesses.length, 0, 'Edge is dead');
          t.end();
        });
      }, 2000);
    });
    setTimeout(() => {
      ps.kill();
    }, 3000);
  });
});

it('should be able to launch edge and get notified when the Edge proccess is externally killed', function (t) {
  t.plan(3);
  edge({ uri: 'https://github.com/' }, (err, ps) => {
    if (err) return t.error(err);
    let polled = 0;
    ps.on('error', t.error);
    ps.on('poll', () => {
      polled++;
    });
    ps.on('exit', (code) => {
      t.assert(polled >= 1, 'did we poll?');
      t.equals(code, 0, 'exit cleanly');
      // wait for processes to shut down
      setTimeout(() => {
        tasklist().then(data => {
          let edgeProcesses = data.filter((p) =>
            ~['MicrosoftEdge.exe', 'MicrosoftEdgeCP.exe'].indexOf(p.imageName));
          t.equals(edgeProcesses.length, 0, 'Edge is dead');
          t.end();
        });
      }, 2000);
    });
  });
  setTimeout(() => {
    edge.kill();
  }, 3000);
});
