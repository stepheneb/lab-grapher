var vows = require("vows");
var assert = require("assert");
// var jsdom = require("jsdom");
var graph = require("../lib/graph");

const { JSDOM } = require("jsdom");

const dom = new JSDOM("<html><head><style>div{font-size:16px;height:400px;width:600px;}</style></head><body><div></div></body></html>");

window = dom.window;
document = window.document;
navigator = window.navigator;
screen = window.screen;

$ = require('jQuery');

// We can't type: d3 = require("d3"), because node D3 wrapper creates its own document
// that is unavailable for external code. We have to create own document manually and
// just call browser version of d3 (d3/d3.js).
d3 = require("d3/d3");

var suite = vows.describe("grapher/graph-selection");

function getBaseGraph() {
  var div = $('<div>').width(500).height(500)[0];
  return graph(div).xmin(0).xmax(10);
}

function graphWithBrushUpdateEvent(graph, extent) {
  graph.brushControl().extent(extent);
  graph.brushListener()();
  return graph;
}

function graphWithBrushClearEvent(graph) {
  graph.brushControl().clear();
  graph.brushListener()();
  return graph;
}

suite.addBatch({

  "initially": {
    topic() {
      var graph = getBaseGraph();
      return graph;
    },

    "the has_selection property": {
      topic(graph) {
        return graph.hasSelection();
      },
      "should be false": function (topic) {
        assert.strictEqual(topic, false);
      }
    },

    "the selection domain": {
      topic(graph) {
        return graph.selectionDomain();
      },
      "should be null": function (topic) {
        assert.strictEqual(topic, null);
      }
    },

    "the selection_visible property": {
      topic(graph) {
        return graph.selectionVisible();
      },
      "should be false": function (topic) {
        assert.strictEqual(topic, false);
      }
    },

    "the selection_enabled property": {
      topic(graph) {
        return graph.selectionEnabled();
      },
      "should be true": function (topic) {
        assert.strictEqual(topic, true);
      }
    }
  },

  "when selection domain is set to null, for \"no selection\"": {
    topic() {
      return getBaseGraph().selectionDomain(null);
    },
    "the has_selection property": {
      topic(graph) {
        return graph.hasSelection();
      },
      "should be false": function (topic) {
        assert.strictEqual(topic, false);
      }
    },
    "the selection domain": {
      topic(graph) {
        return graph.selectionDomain();
      },
      "should be null": function (topic) {
        assert.strictEqual(topic, null);
      }
    }
  },

  "when selection domain is set to [], for \"empty selection\"": {
    topic() {
      return getBaseGraph().selectionDomain([]);
    },
    "the has_selection property": {
      topic(graph) {
        return graph.hasSelection();
      },
      "should be true": function (topic) {
        assert.strictEqual(topic, true);
      }
    },
    "the selection domain": {
      topic(graph) {
        return graph.selectionDomain();
      },
      "should be []": function (topic) {
        assert.deepEqual(topic, []);
      }
    }
  },

  "when selection domain is set to [1, 2]": {
    topic() {
      return getBaseGraph().selectionDomain([1, 2]);
    },
    "the has_selection property": {
      topic(graph) {
        return graph.hasSelection();
      },
      "should be true": function (topic) {
        assert.strictEqual(topic, true);
      }
    },
    "the selection domain": {
      topic(graph) {
        return graph.selectionDomain();
      },
      "should be [1, 2]": function (topic) {
        assert.deepEqual(topic, [1, 2]);
      }
    }
  },

  "when selection_visible is true": {
    topic() {
      // This topic is a *function* that creates a graph (with a particular setup), so that each
      // subtopic can create an independent graph instance which inherits the setup defined by this
      // topic. (Without doing this, all subtopics and would mutate a single graph instance set up
      // by this topic, which leads to chaos, not to mention incorrect test results.)
      return function () {
        return getBaseGraph().selectionVisible(true);
      };
    },

    "the selection_enabled property": {
      topic(getTopicGraph) {
        return getTopicGraph().selectionEnabled();
      },

      "should be true": function (topic) {
        assert.strictEqual(topic, true);
      }
    },

    "and has_selection is true": {
      topic(getTopicGraph) {
        return function () {
          return getTopicGraph().selectionDomain([1, 2]);
        };
      },

      "the brush element": {
        topic(getTopicGraph) {
          return getTopicGraph().elem().select('.brush');
        },
        "should be visible": function (topic) {
          assert.equal(topic.style('display'), 'inline');
        },

        "should allow pointer-events": function (topic) {
          assert.equal(topic.style('pointer-events'), 'all');
        }
      },

      "the d3 brush control": {
        topic(getTopicGraph) {
          return getTopicGraph().brushControl();
        },
        "should listen for d3 brush events": function (topic) {
          assert.isFunction(topic.on('brush'));
        }
      },

      "and when has_selection subsequently becomes false": {
        topic(getTopicGraph) {
          return function () {
            return getTopicGraph().selectionDomain(null);
          };
        },
        "the brush element": {
          topic(getTopicGraph) {
            return getTopicGraph().elem().select('.brush');
          },
          "should not be visible": function (topic) {
            assert.equal(topic.style('display'), 'none');
          }
        }
      },

      "and when selection_visible subsequently becomes false": {
        topic(getTopicGraph) {
          return function () {
            return getTopicGraph().selectionVisible(false);
          };
        },
        "the brush element": {
          topic(getTopicGraph) {
            return getTopicGraph().elem().select('.brush');
          },
          "should not be visible": function (topic) {
            assert.equal(topic.style('display'), 'none');
          }
        }
      },

      "and when selection_enabled subsequently becomes false": {
        topic(getTopicGraph) {
          return function () {
            return getTopicGraph().selectionEnabled(false);
          };
        },
        "the brush element": {
          topic(getTopicGraph) {
            return getTopicGraph().elem().select('.brush');
          },
          "should not be visible": function (topic) {
            assert.equal(topic.style('display'), 'inline');
          },
          "should not allow pointer-events": function (topic) {
            assert.equal(topic.style('pointer-events'), 'none');
          }
        },

        "and selection_enabled subsequently becomes true again": {
          topic(getTopicGraph) {
            return function () {
              return getTopicGraph().selectionEnabled(true);
            };
          },
          "the brush element": {
            topic(getTopicGraph) {
              return getTopicGraph().elem().select('.brush');
            },
            "should be visible": function (topic) {
              assert.equal(topic.style('display'), 'inline');
            },
            "should allow pointer-events": function (topic) {
              assert.equal(topic.style('pointer-events'), 'all');
            }
          }
        }
      }
    },

    "and the selection domain is set to [15, 16]": {
      topic(getTopicGraph) {
        return function (cb) {
          var graph = getTopicGraph().selectionDomain([15, 16]);
          // allow topics to pass this.callback to getTopicGraph, and allow the vows
          // to see the arguments passed to the selectionListener, by making sure
          // to add null as the 'error' argument to this.callback
          if (cb) {
            graph.selectionListener(function cb2() {
              var args = [].splice.call(arguments, 0);
              cb.apply(null, [null].concat(args));
            });
          }
          return graph;
        };
      },

      "the d3 brush control's extent": {
        topic(getTopicGraph) {
          return getTopicGraph().brushControl().extent();
        },
        "should be [15, 16]": function (topic) {
          assert.deepEqual(topic, [15, 16]);
        }
      },

      "and when the selection domain is programmatically updated to [10, 12]": {
        topic(getTopicGraph) {
          return function (cb) {
            return getTopicGraph(cb).selectionDomain([10, 12]);
          };
        },

        "the d3 brush control's extent": {
          topic(getTopicGraph) {
            return getTopicGraph().brushControl().extent();
          },
          "should update to [10, 12]": function (topic) {
            assert.deepEqual(topic, [10, 12]);
          }
        },

        "the selection listener": {
          topic(getTopicGraph) {
            getTopicGraph(this.callback);
          },
          "should be called back with [10, 12]": function (domain) {
            assert.deepEqual(domain, [10, 12]);
          }
        }

        // Note, unfortunately, that you can't directly test for correct updating of element width
        // using jsdom.
      },

      "and when the selection domain is programmatically updated to null": {
        topic(getTopicGraph) {
          return function (cb) {
            return getTopicGraph(cb).selectionDomain(null);
          };
        },

        "the selection listener": {
          topic(getTopicGraph) {
            getTopicGraph(this.callback);
          },
          "should be called back with null": function (domain) {
            assert.strictEqual(domain, null);
          }
        }

        // Note, unfortunately, that you can't directly test for correct updating of element width
        // using jsdom.
      },

      "and a brush event is fired, with brush extent [11, 13]": {
        topic(getTopicGraph) {
          return function (cb) {
            return graphWithBrushUpdateEvent(getTopicGraph(cb), [11, 13]);
          };
        },

        "the selection domain": {
          topic(getTopicGraph) {
            return getTopicGraph().selectionDomain();
          },
          "should update to [11, 13]": function (topic) {
            assert.deepEqual(topic, [11, 13]);
          }
        },

        "the selection listener": {
          topic(getTopicGraph) {
            getTopicGraph(this.callback);
          },
          "should be called back with [11, 13]": function (domain) {
            assert.deepEqual(domain, [11, 13]);
          }
        }
      },

      "and a brush event is fired, with the brush extent cleared": {
        topic(getTopicGraph) {
          return function (cb) {
            return graphWithBrushClearEvent(getTopicGraph(cb));
          };
        },

        "the selection domain": {
          topic(getTopicGraph) {
            return getTopicGraph().selectionDomain();
          },
          "should be updated to []": function (topic) {
            assert.deepEqual(topic, []);
          }
        },

        "the selection listener": {
          topic(getTopicGraph) {
            getTopicGraph(this.callback);
          },
          "should be called back with []": function (domain) {
            assert.deepEqual(domain, []);
          }
        }

      },

      "with selection_enabled set to false": {
        topic(getTopicGraph) {
          return function () {
            return getTopicGraph().selectionEnabled(false);
          };
        },
        "and a brush event is fired, with brush extent [11, 13]": {
          topic(getTopicGraph) {
            return function () {
              return graphWithBrushUpdateEvent(getTopicGraph(), [11, 13]);
            };
          },

          "the selection domain": {
            topic(getTopicGraph) {
              return getTopicGraph().selectionDomain();
            },
            "should remain [15, 16]": function (topic) {
              assert.deepEqual(topic, [15, 16]);
            }
          }
        }
      }
    }
  },

  "when the graph is initialized": {
    topic() {
      return function () {
        return getBaseGraph().selectionVisible(false);
      };
    },

    "and the selection domain is [15, 16]": {
      topic(getTopicGraph) {
        return function () {
          return getTopicGraph().selectionDomain([15, 16]);
        };
      },

      "the selection_visible property": {
        topic(getTopicGraph) {
          return getTopicGraph().selectionVisible();
        },
        "should be false": function (topic) {
          assert.strictEqual(topic, false);
        }
      },

      "the d3 brush control": {
        topic(getTopicGraph) {
          // Topics that return undefined (equivalently, that don't return a value)
          // must use this.callback to pass the topic to vows.
          // Additionally, the first argument to this.callback indicates whether
          // an error was thrown by the topic function and therefore must be null
          // see https://github.com/cloudhead/vows/issues/187

          this.callback(null, getTopicGraph().brushControl());
        },
        "should not yet be defined": function (topic) {
          assert.isUndefined(topic);
        }
      },

      "when selection_visible does become true": {
        topic(getTopicGraph) {
          return function () {
            return getTopicGraph().selectionVisible(true);
          };
        },

        "the d3 brush control's extent": {
          topic(getTopicGraph) {
            return getTopicGraph().brushControl().extent();
          },
          "should be [15, 16]": function (topic) {
            assert.deepEqual(topic, [15, 16]);
          }
        }
      }
    }
  }
});

suite.export(module);
