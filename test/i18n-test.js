var assert = require("assert");
var i18n = require("../lib/i18n");

describe("i18n", function () {
  function defSetup() {
    i18n.lang = 'en-US';
    i18n.translations = {
      'en-US': {
        a: 'a'
      }
    };
  }

  it("'en-US' should be a default language", function() {
    assert.equal(i18n.lang, 'en-US');
  });

  it("'en-US' should be a fallback language", function() {
    assert.equal(i18n.lang, 'en-US');
  });

  it("'lang' property should define which language is used", function() {
    i18n.translations = {
      'en-US': {
        a: 'a'
      },
      'some-language': {
        a: 'b'
      }
    };
    assert.equal(i18n.t('a'), 'a');
    i18n.lang = 'some-language';
    assert.equal(i18n.t('a'), 'b');
  });

  it("'fallback' should define which language is used a fallback language", function() {
    i18n.translations = {
      'en-US': {
        a: 'a'
      },
      'fallback-language': {
        a: 'b'
      }
    };
    i18n.fallback = 'fallback-language';
    i18n.lang = 'not-a-language';
    assert.equal(i18n.t('a'), 'b');
  });

  it("key should be used as a fallback translation", function() {
    defSetup();
    assert.equal(i18n.t('missing_key'), 'missing_key');
  });

  it("first part of the language code should be used when the full code is not found", function() {
    i18n.translations = {
      'es': {
        a: 'x',
        b: 'y'
      },
      'es-CO': {
        a: 'a'
      }
    };
    i18n.lang = 'es-CO';
    assert.equal(i18n.t('a'), 'a');
    assert.equal(i18n.t('b'), 'y');
    delete i18n.translations['es-CO'];
    assert.equal(i18n.t('a'), 'x');
    assert.equal(i18n.t('b'), 'y');
    i18n.lang = 'es_CO';
    assert.equal(i18n.t('a'), 'x');
    assert.equal(i18n.t('b'), 'y');
  });
});
