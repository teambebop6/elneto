gulp = require 'gulp'
gutil = require 'gulp-util'
gulpif = require 'gulp-if'
watch = require 'gulp-watch'
less = require 'gulp-less'
coffee = require 'gulp-coffee'
clean = require 'gulp-clean'
nodemon = require 'gulp-nodemon'
buildSemantic = require('./semantic/tasks/build')

# Compile Less
gulp.task 'build-less', ->
  gulp.src 'public/css/*.less'
  .pipe less()
  .pipe gulp.dest('public/css')
  .on 'end', ->
    gutil.log "Compiled less files"

# Watch Less
gulp.task 'watch-less', ->
  gulp.src 'public/css/*.less'
  .pipe watch('public/css/*.less')
  .pipe less()
  .pipe gulp.dest('public/css')
  .on 'end', ->
    gutil.log "Compiled less files"

gulp.task 'watch-source', ['watch-less']
gulp.task 'watch-all', ['watch-source', 'watch-semantic']

gulp.task 'build-semantic', buildSemantic
gulp.task 'build-source', ['build-less', 'build-coffee']
gulp.task 'build-all', ['build-source', 'build-semantic']
gulp.task 'build', ['build-source']

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
  startService = spawn.sync 'pm2', ['start', 'server.js', '--name', '"graspdaily"', '--', 'NODE_ENV=local']
