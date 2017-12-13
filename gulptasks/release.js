var gh = require('ghreleases');
var gutil = require('gulp-util');
var moment = require('moment');

var gitHubToken = process.env.GitHubToken;
var branch = process.env.TRAVIS_BRANCH || 'dev';

var auth = {
  token: gitHubToken,
  user: 'henryhuang'
};

var org = 'teambebop6';
var repo = 'elneto';

module.exports = function () {

  gutil.log('creating release...');

  if (!gitHubToken) {
    throw new gutil.PluginError({
      plugin: 'release',
      message: 'GitHubToken environment variable have not defined!'
    })
  }

  const timeTag = moment().format("YYYYMMDDHHmmss");
  const tag_name = branch + '-build-' + timeTag;
  const data = {
    tag_name: tag_name,
    name: 'Build at ' + timeTag,
    body: 'Automatically release from travis.'
  };

  gh.create(auth, org, repo, data, function (err) {
    if (err) {
      throw new gutil.PluginError({
        plugin: 'release',
        message: err.message
      })
    }

    gutil.log('release created!');
    gutil.log('asset uploading...');
    const ref = 'tags/' + tag_name;
    const files = [
      'elneto-dist.zip'
    ];

    gh.uploadAssets(auth, org, repo, ref, files, function (err, res) {
      if (err) {
        throw new gutil.PluginError({
          plugin: 'release',
          message: err.message
        })
      }
      gutil.log('asset uploaded!');
    })

  })

};