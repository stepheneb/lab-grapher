/*jshint esversion: 6 */

import gulp from 'gulp';
import browserSync from 'browser-sync';
import cp from 'child_process';

import run from 'gulp-run-command';

const server = browserSync.create();

function reload(done) {
  server.reload();
  done();
}

function serve(done) {
  server.init({
    server: ["examples", "dist", "css"],
    startPath: "/index.html"
  });
  done();
}

const build = async (done) => run('npm run build')(done());

const watch = () => {
  gulp.watch(["examples/*.html",
    "examples/*.css",
    "examples/*.js",
    "examples/data/*.json",
    "examples/data/*.csv",
    "dist/*.js"
  ], reload);
  gulp.watch(["lib/*.js"], build);
};

const dev = gulp.series(serve, watch);
dev.description = 'Start server and use browsersync to watch files and update pages.';

exports.default = dev;
