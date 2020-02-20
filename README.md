lab-grapher
===========

## Building ##

Before you can build...

1. You'll need [Node](http://nodejs.org/), if you don't have it already.
2. Once you have node, run `npm install`.

Once you have those, you can build with `npm run build`.

Developing with automatic browser-sync reloading.

Start a local web server and load the example with [gulpjs](https://gulpjs.com/) and [Browsersync](https://browsersync.io/docs/gulp): `npm run gulp`.

The example will be running at: http://localhost:3000/index.html

Changes made to javascript files in `./lib` will automatically start the build process and update `./dist/lab-grapher.js`.

Changes made in files in `./examples`, `./css`, or `/dist` will cause the index.html page in the browser to reload.

## Dependencies ##

lab-grapher depends on the following libraries:

* [jQuery](http://jquery.com/) v1.10
* [D3](http://d3js.org/) v3
* [Font Awesome](http://fontawesome.io/) v3.2

The easiest way to use try lab-grapher out is to use a CDN in your html
to meet these dependancies, as in the example `examples/index.html`:

    ...
    <head>
        <link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.min.css" rel="stylesheet">
        <link href='../css/lab-grapher.css' rel='stylesheet' type='text/css'>
        <link href='examples.css' rel='stylesheet' type='text/css'>
    </head>
    ...
    <script src='http://d3js.org/d3.v3.min.js' type='text/javascript'></script>
    <script src='http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js' type='text/javascript'></script>
    ...
