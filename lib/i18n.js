var DEFAULT_LANG = 'en-US';

module.exports.translations = require('../locales/translations.json');

module.exports.lang = DEFAULT_LANG;
module.exports.fallback = DEFAULT_LANG;

module.exports.t = function(key) {
  var lang = module.exports.lang;
  return getTranslation(lang, key) ||
         getTranslation(lang.split("-")[0], key) ||
         getTranslation(lang.split("_")[0], key) ||
         getTranslation(module.exports.fallback, key) ||
         key;
};

function getTranslation(lang, key) {
  var translations = module.exports.translations;
  var keys = key.split(".");
  var t = translations[lang];
  var i = 0;
  var k = keys[i];
  while (k && typeof t === "object") {
    t = t[k];
    k = keys[++i];
  }
  return t;
}
