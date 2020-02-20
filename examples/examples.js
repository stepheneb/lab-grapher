/*global Lab d3 document window $ */
/*jslint indent: 2 */
// ------------------------------------------------------------
//
// Graphing Demo
//
// ------------------------------------------------------------

var graph,
  selectSize = document.getElementById('select-size'),
  selectData = document.getElementById('select-data'),
  DEFAULT_GRAPH = "earth-surface-temperature",
  hash = document.location.hash || "#" + DEFAULT_GRAPH,
  interactive_url = hash.substr(1, hash.length),

  // used in the streaming examples
  timerId,
  maxtime,
  twopi = Math.PI * 2,
  frequency1,
  amplitude1,
  frequency2,
  amplitude2,
  twopifreq2,
  time,
  count,
  value1,
  value2,
  stopStreaming = false;

document.location.hash = hash;
selectData.value = interactive_url;

function selectSizeHandler() {
  switch (selectSize.value) {
  case "large":
    graph.resize(1280, 666);
    break;

  case "medium":
    graph.resize(960, 500);
    break;

  case "small":
    graph.resize(480, 250);
    break;

  case "tiny":
    graph.resize(240, 125);
    break;

  case "icon":
    graph.resize(120, 62);
    break;
  }
}

selectSize.onchange = selectSizeHandler;

function selectDataHandler() {
  stopStreaming = true;
  interactive_url = selectData.value;
  hash = "#" + interactive_url;
  document.location.hash = hash;
  if (!graph) {
    graph = LabGrapher('#chart');
  }
  switch (selectData.value) {
  case "fake":
    graph.reset('#chart', getOptions({
      title: "Fake Data",

      fontScaleRelativeToParent: false,
      dataType: 'fake',

      markAllDataPoints: true,
      dataChange: true,
      addData: true
    }));
    graph.clearPointListeners();
    graph.addPointListener(function (evt) {
      console.log("clicked point (" + evt.action + "): " + evt.point);
    });
    break;

  case "fake-drawable":
    graph.reset('#chart', getOptions({
      title: "Fake Data (drawable)",
      fontScaleRelativeToParent: false,
      dataType: 'fake',

      enableDrawButton: true,
      enableAutoScaleButton: false,

      markAllDataPoints: true,
      dataChange: true,
      addData: true
    }));
    graph.clearPointListeners();
    break;

  case "stair-steps":
    graph.reset('#chart', getOptions({
      title: "Stair-Step Data",
      xlabel: "Distance",
      ylabel: "Height",
      xmax: 14,
      xmin: 0,
      ymax: 20,
      ymin: 8,

      fontScaleRelativeToParent: false,
      dataType: 'points',
      dataPoints: [
        [
          [0, 10],
          [2, 10],
          [2, 12],
          [4, 12],
          [4, 14],
          [6, 14],
          [6, 16],
          [8, 16],
          [8, 18],
          [10, 18]
        ]
      ],

      markAllDataPoints: true,
      dataChange: true,
      addData: true
    }));
    break;

  case "earth-surface-temperature":
    d3.json("data/surface-temperature-data.json", function (data) {
      var surfaceTemperatures = [
        data.global_temperatures.temperature_anomolies.map(function (e) {
          return [e[0], e[1] + data.global_temperatures.global_surface_temperature_1961_1990];
        })
      ];
      graph.reset('#chart', getOptions({
        title: "Earth's Surface Temperature: years 500-2009",
        xlabel: "Year",
        ylabel: "Degrees C",
        xmax: 2000,
        xmin: 500,
        ymax: 15,
        ymin: 13,
        xFormatter: ".3r",
        yFormatter: ".1f",
        legendLabels: ["temperature"],
        enableSelectionButton: true,

        onXDomainChange: function (min, max) {
          console.log('X domain changed: [' + min + ', ' + max + ']');
        },
        onYDomainChange: function (min, max) {
          console.log('Y domain changed: [' + min + ', ' + max + ']');
        },

        fontScaleRelativeToParent: false,
        dataType: 'points',
        dataPoints: surfaceTemperatures,

        markAllDataPoints: false,
        dataChange: false
      }));
    });
    break;

  case "world-population":
    d3.json("data/world-population.json", function (data) {
      var worldPopulation = [data.worldPopulation.data];
      graph.reset('#chart', getOptions({
        title: "World Population, Historical and Projected: 10,000 BCE to 2050",
        xlabel: "Year",
        ylabel: "Population (Millions)",
        xmax: 2500,
        xmin: -10000,
        ymax: 20000,
        ymin: 0,

        fontScaleRelativeToParent: false,
        dataType: 'points',
        dataPoints: worldPopulation,

        markAllDataPoints: false,
        dataChange: false
      }));
    });
    break;

  case "world-population-semi-log":
    d3.json("data/world-population.json", function (data) {
      var worldPopulation = [data.worldPopulation.data];
      graph.reset('#chart', getOptions({
        title: "World Population, Historical and Projected: 10,000 BCE to 2050 (semi-log)",
        xlabel: "Year",
        ylabel: "Population (Millions)",
        xmax: 2500,
        xmin: -10000,
        ymax: 20000,
        ymin: 0.1,
        xFormatter: ".3r",
        yscale: "scaleLog",

        fontScaleRelativeToParent: false,
        dataType: 'points',
        dataPoints: worldPopulation,

        markAllDataPoints: false,
        dataChange: false
      }));
    });
    break;

  case "md2d-center-of-mass":
    d3.text("data/cm-random-walk.csv", "text/csv", function (text) {
      var data = d3.csv.parseRows(text);
      data.length = 5000;
      var randomWalk = [data.map(function (e) { return [Number(e[1]), Number(e[2])]; })];
      graph.reset('#chart', getOptions({
        title: [
          "Constrained random walk of center of mass of Lab molecular simulation",
          "(L-J forces only; 50 atoms; no thermostat; initial temperature = \"5\")"
        ],
        xlabel: "x-location of center of mass",
        ylabel: "y-location of center of mas",

        fontScaleRelativeToParent: false,
        dataType: 'points',
        dataPoints: randomWalk,

        xmax: 50,
        xmin: -50,
        ymax: 50,
        ymin: -50,
        markAllDataPoints: false,
        strokeWidth: 1,
        dataChange: false
      }));
    });
    break;

  case "streaming":
    maxtime = 20;
    graph.reset('#chart', getOptions({
      title: "Sin Waves",
      xlabel: "Time",
      ylabel: "Amplitude",
      xmax: maxtime,
      xmin: 0,
      ymax: 2,
      ymin: -2,

      fontScaleRelativeToParent: false,
      dataType: 'points',
      dataPoints: [],

      markAllDataPoints: false,
      strokeWidth: 1,
      dataChange: false,
      addData: false
    }));

    stopStreaming = false;
    frequency1 = 0.5;
    amplitude1 = 1;
    twopifreq1 = twopi * frequency1;
    frequency2 = Math.PI;
    amplitude2 = 0.2;
    twopifreq2 = twopi * frequency2;
    time = 0,
      lastSample = 0;

    d3.timer(function (elapsed) {
      time = (time + (elapsed - lastSample) / 1000);
      lastSample = elapsed;
      if (stopStreaming) { return true; }
      value1 = Math.sin(twopifreq1 * time) * amplitude1;
      value2 = Math.sin(twopifreq2 * time) * amplitude2;
      graph.addPoint([time, value1 + value2]);
      return time > maxtime * 2 || stopStreaming;
    });
    break;

  case "earth-surface-temperature-samples":
    d3.json("data/surface-temperature-data.json", function (data) {
      var surfaceTemperatures = [
        data.global_temperatures.temperature_anomolies.map(function (e) {
          return e[1] + data.global_temperatures.global_surface_temperature_1961_1990;
        })
      ];
      graph.reset('#chart', getOptions({
        title: "Earth's Surface Temperature: years 500-2009",
        xlabel: "Year",
        ylabel: "Degrees C",
        xmax: 2100,
        xmin: 400,
        ymax: 15,
        ymin: 13,
        xFormatter: ".3r",
        yFormatter: ".1f",

        fontScaleRelativeToParent: false,

        dataType: 'samples',
        dataSamples: surfaceTemperatures,
        sampleInterval: 1,
        dataSampleStart: 500,

        markAllDataPoints: false,
        dataChange: false
      }));
    });
    break;

  case "realtime-markers":
    maxtime = 10;
    sampleInterval = 0.05;
    graph.reset('#chart', getOptions({
      title: "Sin Waves",
      xlabel: "Time",
      ylabel: "Amplitude",
      xmax: maxtime + 0.6,
      xmin: 0,
      ymax: 1.6,
      ymin: -1.6,

      fontScaleRelativeToParent: false,

      dataType: 'samples',
      dataSamples: [],
      sampleInterval: sampleInterval,
      dataSampleStart: 0,

      markAllDataPoints: false,
      markNearbyDataPoints: true,
      extraCirclesVisibleOnHover: 1,
      showRulersOnSelection: true,

      strokeWidth: 5,
      dataChange: false,
      addData: false
    }));

    stopStreaming = false;
    frequency1 = 0.102;
    amplitude1 = 1;
    twopifreq1 = twopi * frequency1;
    frequency2 = 0.5;
    amplitude2 = 0.5;
    twopifreq2 = twopi * frequency2;
    time = 0;
    count = 0;

    timerId = setInterval(function () {
      count++;
      time = count * sampleInterval;
      if (time > maxtime || stopStreaming) { clearInterval(timerId); }
      value1 = Math.sin(twopifreq1 * time) * amplitude1;
      value2 = Math.sin(twopifreq2 * time) * amplitude2;
      graph.addSamples([value1 + value2]);
    }, 1000 * sampleInterval);
    break;

  case "realtime-markers-drawable":
    maxtime = 10;
    sampleInterval = 0.05;
    graph.reset('#chart', getOptions({
      title: "Sin Waves",
      xlabel: "Time",
      ylabel: "Amplitude",
      xmax: maxtime + 0.6,
      xmin: 0,
      ymax: 1.6,
      ymin: -1.6,

      fontScaleRelativeToParent: false,

      dataType: 'samples',
      dataSamples: [],
      sampleInterval: sampleInterval,
      dataSampleStart: 0,

      markAllDataPoints: false,
      markNearbyDataPoints: true,
      extraCirclesVisibleOnHover: 1,
      showRulersOnSelection: true,

      enableDrawButton: true,

      strokeWidth: 5,
      dataChange: false,
      addData: false
    }));

    stopStreaming = false;
    frequency1 = 0.102;
    amplitude1 = 1;
    twopifreq1 = twopi * frequency1;
    frequency2 = 0.5;
    amplitude2 = 0.5;
    twopifreq2 = twopi * frequency2;
    time = 0;
    count = 0;

    timerId = setInterval(function () {
      count++;
      time = count * sampleInterval;
      if (time > maxtime || stopStreaming) { clearInterval(timerId); }
      value1 = Math.sin(twopifreq1 * time) * amplitude1;
      value2 = Math.sin(twopifreq2 * time) * amplitude2;
      graph.addSamples([value1 + value2]);
    }, 1000 * sampleInterval);
    break;

  case "multiline-realtime-markers":
    maxtime = 10;
    sampleInterval = 0.05;
    graph.reset('#chart', getOptions({
      title: "Sin Waves",
      xlabel: "Time",
      ylabel: "Amplitude",
      xmax: maxtime + 0.6,
      xmin: 0,
      ymax: 1.6,
      ymin: -1.6,

      fontScaleRelativeToParent: false,

      dataType: 'samples',
      dataSamples: [],
      sampleInterval: sampleInterval,
      dataSampleStart: 0,

      markAllDataPoints: false,
      markNearbyDataPoints: true,
      extraCirclesVisibleOnHover: 1,
      showRulersOnSelection: true,

      strokeWidth: 5,
      dataChange: false,
      addData: false
    }));

    stopStreaming = false;
    frequency1 = 0.102;
    amplitude1 = 1;
    twopifreq1 = twopi * frequency1;
    frequency2 = 0.5;
    amplitude2 = 0.5;
    twopifreq2 = twopi * frequency2;
    time = 0;
    count = 0;

    timerId = setInterval(function () {
      count++;
      time = count * sampleInterval;
      if (time > maxtime || stopStreaming) { clearInterval(timerId); }
      value1 = Math.sin(twopifreq1 * time) * amplitude1;
      value2 = Math.sin(twopifreq2 * time) * amplitude2;
      graph.addSamples([
        [(value1 + value2)],
        [0 - (value1 + value2)]
      ]);
    }, 1000 * sampleInterval);
    break;

  case "multiline-realtime-markers-drawable":
    maxtime = 10;
    sampleInterval = 0.05;
    graph.reset('#chart', getOptions({
      title: "Sin Waves",
      xlabel: "Time",
      ylabel: "Amplitude",
      xmax: maxtime + 0.6,
      xmin: 0,
      ymax: 1.6,
      ymin: -1.6,

      fontScaleRelativeToParent: false,

      dataType: 'samples',
      dataSamples: [],
      sampleInterval: sampleInterval,
      dataSampleStart: 0,

      markAllDataPoints: false,
      markNearbyDataPoints: true,
      extraCirclesVisibleOnHover: 1,
      showRulersOnSelection: true,

      enableDrawButton: true,

      strokeWidth: 5,
      dataChange: false,
      addData: false
    }));

    stopStreaming = false;
    frequency1 = 0.102;
    amplitude1 = 1;
    twopifreq1 = twopi * frequency1;
    frequency2 = 0.5;
    amplitude2 = 0.5;
    twopifreq2 = twopi * frequency2;
    time = 0;
    count = 0;

    timerId = setInterval(function () {
      count++;
      time = count * sampleInterval;
      if (time > maxtime || stopStreaming) { clearInterval(timerId); }
      value1 = Math.sin(twopifreq1 * time) * amplitude1;
      value2 = Math.sin(twopifreq2 * time) * amplitude2;
      graph.addSamples([
        [(value1 + value2)],
        [0 - (value1 + value2)]
      ]);
    }, 1000 * sampleInterval);
    break;

  case "i18n-example":
    graph.reset('#chart', getOptions({
      lang: "pl",
      enableSelectionButton: true,
      enableDrawButton: true,
      enableAutoScaleButton: true,
      legendLabels: ["test1", "test2"]
    }));
    break;
  }
}

selectData.onchange = selectDataHandler;
selectDataHandler();

function getOptions(otherOptions) {
  var result = {};
  $("input.graph-option").each(function () {
    result[this.name] = this.checked;
  });
  $("select.graph-option").each(function () {
    result[this.name] = $(this).val();
  });
  $.extend(result, otherOptions);
  return result;
}

function addVerticalAnnotation() {
  var x = graph.xmin() + Math.random() * (graph.xmax() - graph.xmin());
  graph.addAnnotation({
    type: "line",
    data: {
      x1: x,
      x2: x,
      stroke: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")"
    }
  });
}

function addHorizontalAnnotation() {
  var y = graph.ymin() + Math.random() * (graph.ymax() - graph.ymin());
  graph.addAnnotation({
    type: "line",
    data: {
      y1: y,
      y2: y,
      stroke: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")"
    }
  });
}

function addVerticalBarAnnotation() {
  var x1 = graph.xmin() + Math.random() * (graph.xmax() - graph.xmin()),
    x2 = x1 + Math.random() * (graph.xmax() - x1);
  graph.addAnnotation({
    type: "bar",
    data: {
      x1: x1,
      x2: x2,
      stroke: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")"
    }
  });
}

function addHorizontalBarAnnotation() {
  var y1 = graph.ymin() + Math.random() * (graph.ymax() - graph.ymin()),
    y2 = y1 + Math.random() * (graph.ymax() - y1);
  graph.addAnnotation({
    type: "bar",
    data: {
      y1: y1,
      y2: y2,
      stroke: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")"
    }
  });
}

$(window).bind('hashchange', function () {
  if (document.location.hash !== hash) {
    selectDataHandler();
  }
});

$(".graph-option").each(function () {
  $(this).on('change', selectDataHandler);
});

function handleFontSizeChange() {
  $("#graph-parent-container").css("font-size", $("#font-size-input").val());
  graph.resize();
}
$("#font-size-input").on("change", handleFontSizeChange);
handleFontSizeChange();
