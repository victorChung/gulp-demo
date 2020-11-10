const del = require('delete');

const { src, dest, series, watch, parallel, task } = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');  //压缩html
const rename = require('gulp-rename');
const rev = require('gulp-rev');
const inject = require('gulp-inject');
const browserSync = require('browser-sync').create(); //多浏览器同步

sass.compiler = require('node-sass');

const output_dir = 'dist'

function clean(cb) {
  del([output_dir + '/*'], cb);
}

function sass2css() {
  return src(['src/**/*.scss', '!src/js/**'])
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(rev())
    .pipe(dest(output_dir + '/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}

function t1() {
  return src('src/modules/**/*.js')
    // .pipe(dest(output_dir + '/modules/'))
    .pipe(babel())
    .pipe(rev())
    // .pipe(dest(output_dir + '/modules/'))
    .pipe(uglify({ compress: true }))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(output_dir + '/modules/'));
}
function copy_global_head_swiper() {
  return src(['src/js/plugins/swiper5/**/*'])
    .pipe(dest(output_dir + '/js/plugins/swiper5/'))
}
function copy_global_head_js() {
  return src(['src/js/plugins/*.js'])
    .pipe(dest(output_dir + '/js/plugins/'))
}
function copy_global_head_css() {
  return src(['src/css/*.css'])
    .pipe(rev())
    .pipe(dest(output_dir + '/css/'))
}
function inject_global_head() {
  return src(output_dir + '/modules/**/*.html')
    .pipe(inject(src([output_dir + '/js/plugins/*.js'], { read: false }), { ignorePath: output_dir, starttag: '<!-- inject:globaljs -->' }))
    .pipe(inject(src([output_dir + '/css/*.css', output_dir + '/js/plugins/swiper5/package/css/swiper.min.css'], { read: false }), { ignorePath: output_dir, starttag: '<!-- inject:globalcss -->' }))
    .pipe(inject(src([output_dir + '/js/plugins/swiper5/package/js/swiper.min.js'], { read: false }), { ignorePath: output_dir, starttag: '<!-- inject:globalfootjs -->' }))
    .pipe(dest(output_dir + '/modules/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}


function copy_resource_html() {
  return src(['src/modules/**/*.html'])
    .pipe(htmlmin({collapseWhitespace:true}))
    .pipe(dest(output_dir + '/modules/'))
}
function copy_resource_images() {
  return src(['src/images/**/*'])
    .pipe(dest(output_dir + '/images/'))
}
function copy_resource_css() {
  return src(['src/modules/**/*.css'])
    .pipe(rev())
    .pipe(dest(output_dir + '/modules/'))
}
function inject_html() {
  console.log('inject_html', 'inject_htmlinject_html')
  return src(output_dir + '/modules/**/*.html')
    .pipe(inject(src([output_dir + '/modules/**/*.min.js', output_dir + '/modules/**/*.css'], { read: false }), {
      ignorePath: output_dir,
      transform: function (filePath, file, idx, length, targetFile) {
        var dir = filePath.substring(0, filePath.lastIndexOf('/'))
        if (targetFile.history.length > 0 && targetFile.history[0].indexOf(dir) > -1) {
          return inject.transform.apply(inject.transform, arguments);
        }
        return ''
      }
    }))
    .pipe(inject(src([output_dir + '/images/favicon.png'], { read: false }), {
      ignorePath: output_dir,
      starttag: '<!-- inject:shortcut -->',
      transform: function (filePath, file, idx, length, targetFile) {
        return '<link rel="shortcut icon" href="' + filePath + '">'
      }
    }))
    .pipe(dest(output_dir + '/modules/'))
    .pipe(browserSync.reload({
      stream: true
    }));
}


async function df_watch() {
  browserSync.init({
    server: {
      baseDir: output_dir
    }
  }, function (err, bs) {
    console.log(bs.options.getIn(['urls', 'local']));
  });
  await watch(['src/**/*', '!src/js/**/*.js'], { ignoreInitial: false }, series(df))
  //cb()
}

var global_head = series(copy_global_head_swiper, copy_global_head_js, copy_global_head_css, inject_global_head)
var df = series(clean, t1, sass2css, copy_resource_html, copy_resource_css, copy_resource_images, inject_html, global_head)

exports.clean = clean;
exports.default = df_watch
exports.sass2css = series(sass2css)
