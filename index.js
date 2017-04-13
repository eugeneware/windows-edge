const exec = require('child_process').exec;
const EventEmitter = require('events');
const tasklist = require('tasklist');

module.exports = launch;
function launch (opts, cb) {
  opts = Object.assign({ poll: true, pollInterval: 3000 }, opts);
  exec('start microsoft-edge:' + opts.uri, (err, stdout, stderr) => {
    if (err) return cb(err);
    const ee = new EventEmitter();

    // fake returning a child_process object
    ee.kill = kill.bind(null, ee);

    // Polls for the external termination of Edge. Can't poll too often.
    if (opts.poll) {
      ee._poll = setInterval(() => {
        getEdgeTasks((err, edgeProcesses) => {
          ee.emit('poll');
          if (err) return ee.emit('error', err);
          if (edgeProcesses.length === 0) {
            clearInterval(ee._poll);
            ee.emit('exit', 0);
          }
        });
      }, opts.pollInterval);
    }

    return cb(null, ee);
  });
}

function getEdgeTasks (cb) {
  tasklist().then(data => {
    let edgeProcesses = data.filter((p) =>
      ~['MicrosoftEdge.exe', 'MicrosoftEdgeCP.exe'].indexOf(p.imageName));
    cb(null, edgeProcesses);
  })
  .catch(cb);
}

module.exports.kill = kill;
function kill (ee) {
  function cb (err, code) {
    if (typeof ee === 'function') {
      return ee(err, code || 0);
    } else if (ee && ee.emit) {
      if (ee._poll) clearInterval(ee._poll);
      if (err) return ee.emit('error', err);
      ee.emit('exit', code || 0);
    }
  }
  getEdgeTasks((err, edgeProcesses) => {
    if (err) return cb(err);
    if (edgeProcesses.length === 0) {
      return cb();
    } else {
      exec('taskkill /F /IM MicrosoftEdge.exe /T', (err) => cb(err));
    }
  });
}
