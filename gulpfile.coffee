gulp = require 'gulp'
gutil = require 'gulp-util'
watch = require 'gulp-watch'
less = require 'gulp-less'
coffee = require 'gulp-coffee'
clean = require 'gulp-clean'
nodemon = require 'gulp-nodemon'
buildSemantic = require('./assets/vendor/semantic/tasks/build')
runSequence = require('run-sequence')
merge = require('merge-stream');
zip = require('gulp-zip');
webpack = require('webpack');
webpackConfig = require './webpack.config'
release = require './gulptasks/release'

# Compile Less
gulp.task 'build-less', ->
  gulp.src 'public/css/*.less'
    .pipe less()
    .pipe gulp.dest('public/css')
    .on('end', () ->
    gutil.log "Compiled less files")

# Watch Less
gulp.task 'watch-less', ->
  gulp.src 'public/css/*.less'
    .pipe watch('public/css/*.less')
    .pipe less()
    .pipe gulp.dest('public/css')
    .on('end', () ->
    gutil.log 'Compiled less files'
  )

gulp.task 'build-webpack', (callback) ->
  wConfig = Object.create(webpackConfig)
  webpack(wConfig, (err, stats) ->
    if err
      throw new gutil.PluginError('build-webpack', err)
    gutil.log('[build-webpack]', stats.toString({
      colors: true
    }))
    if callback
      callback()
  )

gulp.task 'watch-source', ['watch-less']
gulp.task 'watch-all', ['watch-source', 'watch-semantic']

gulp.task 'build-semantic', buildSemantic
gulp.task 'build-source', ['build-less']
gulp.task 'build-all', ['build-source', 'build-semantic', 'build-webpack']
gulp.task 'build', ['build-source', 'build-webpack']

gulp.task 'start-server', ->
  gulp.start ['watch-source']

  if not nodemon_instance?
    nodemon_instance = nodemon
      script: 'index.js'
      watch: ['.app/']
      ext: 'js'
      verbose: true
    nodemon_instance.on 'restart', ->
      gutil.log 'Restarting server'
  else
    nodemon_instance.emit 'restart'

gulp.task 'server', ['serve']
gulp.task 'serve', ['build-source'], ->
  gulp.start ['start-server']


gulp.task 'deploy-daily', ->
  gutil.log 'Stopping service ...'
  try
    pm2Stop = spawn.sync 'pm2', ['stop', 'graspdaily']
  catch e
# ignore it
    gutil.log(e)

  gutil.log 'Deleting service ...'
  try
    pm2Delete = spawn.sync 'pm2', ['delete', 'graspdaily']
  catch e
# ignore it
    gutil.log(e)

  gutil.log 'Starting service ...'
  startService = spawn.sync 'pm2', ['start', 'server.js', '--name', '"graspdaily"', '--',
    'NODE_ENV=local']


gulp.task 'dist', () ->
  runSequence('dist:copy', 'dist:archive', () ->
    gutil.log 'dist done!'
  )

gulp.task 'dist:copy', () ->
  elneto_secret = gulp.src(['elneto-secret/**/*'])
    .pipe(gulp.dest('dist/elneto-secret/'));

  lib = gulp.src(['lib/**/*'])
    .pipe(gulp.dest('dist/lib/'));

  mongodb = gulp.src(['mongodb/**/*'])
    .pipe(gulp.dest('dist/mongodb/'));

  publicFolder = gulp.src(['public/**/*'])
    .pipe(gulp.dest('dist/public/'));

  routes = gulp.src(['routes/**/*'])
    .pipe(gulp.dest('dist/routes/'));

  views = gulp.src(['views/**/*'])
    .pipe(gulp.dest('dist/views/'));

  filesToToDist = ['config.js', 'index.js', 'package.json', 'pm2.dev.config.js',
    'pm2.www.config.js']

  dist = gulp.src(filesToToDist)
    .pipe(gulp.dest('dist/'));

  return merge(elneto_secret, lib, mongodb, publicFolder, routes, views, dist)

gulp.task 'dist:archive', () ->
  distFolder = __dirname
  return gulp.src('dist/**/*', {dot: true}).pipe(zip('elneto-dist.zip')).pipe(gulp.dest(distFolder))

gulp.task('clean', () ->
  return gulp.src(['dist/', 'dist.zip', 'elneto-dist.zip'], {read: false}).pipe clean())

gulp.task 'release', release