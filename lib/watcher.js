'use strict';

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

/**
 * Create a file watcher that runs `update()` and `remove()` functions when files matching the a glob pattern are added, changed, or removed.
 * @param {Object} rule - File watching rules.
 * @param {(String|String[])} rule.pattern - Glob pattern to watch.
 * @param {Boolean} [rule.read=true] - Pass the contents of the changed file to the `update()` function.
 * @param {Function} [rule.update] - Function to run when a file is added or changed.
 * @param {Function} [rule.remove] - Function to run when a file is deleted.
 * @param {String} baseDir - Base directory to attach glob pattern to.
 * @param {Object} thisArg - `this` to apply to `update()` and `remove()` functions.
 * @param {Function} cb - Callback to run when any page is updated.
 */
module.exports = (rule, baseDir, thisArg, cb) => {
  const run = (method, filePath) => {
    let contents;
    if (rule.read !== false && method === 'update') {
      contents = fs.readFileSync(filePath).toString();
    }

    if (method in rule) {
      const name = path.basename(filePath, path.extname(filePath));
      const rtn = rule[method].call(thisArg, name, filePath, contents);
      Promise.resolve(rtn).then(() => cb());
    }
  };

  return chokidar.watch(path.join(baseDir, rule.pattern))
    .on('add', filePath => run('update', filePath))
    .on('change', filePath => run('update', filePath))
    .on('unlink', filePath => run('remove', filePath));
};
