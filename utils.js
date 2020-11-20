const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

module.exports = {
  requireSafe(id, errorValue = null) {
    try {
      return require(id);
    } catch {
      return errorValue;
    }
  },

  getConfig(filepath) {
    return yaml.parse(
      fs.readFileSync(path.resolve(process.cwd(), filepath), {
        encoding: 'utf-8',
      })
    );
  },
};
