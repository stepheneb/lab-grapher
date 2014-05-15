// Graph constructor.
module.exports = require('./lib/graph');
// Setup access to i18n settings. To use language different from 'en-US', just set:
//   LabGrapher.i18n.lang = "some-language-code";
// before calling Graph constructor.
module.exports.i18n = require('./lib/i18n');
