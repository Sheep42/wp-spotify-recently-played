const   gulp        = require('gulp'),
        sass        = require('gulp-sass'),
        autoprefixer = require('gulp-autoprefixer'),
        sourcemaps  = require('gulp-sourcemaps'),
        plumber     = require('gulp-plumber'),
        notify      = require('gulp-notify'),
        minify      = require('gulp-minify'),
        babel       = require('gulp-babel'),
        concat      = require('gulp-concat'),
        argv        = require('yargs').options({
            'production': {
                default: false,
                type: 'boolean'
            }
        }).argv;

// Title used for system notifications
var notifyInfo = {
    title: 'Gulp'
};

// Error notification settings for plumber
var plumberErrorHandler = { errorHandler: notify.onError({
        title: notifyInfo.title,
        icon: notifyInfo.icon,
        message: "Error: <%= error.message %>"
    })
};

/**
 *  compile scripts with sourcemaps
 *  
 *  @param  array   src_files   The source files to compile   
 *  @param  string  prefix      The prefix to be appended to the .min.js file  
 *  @param  string  dest        The destination directory ( inside of ./assets/js/build ) 
 *  
 */
function build_scripts_dev( src_files, prefix, dest ) {
    return gulp.src( src_files )
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['@babel/env'],
                ignore: ['**/*.min.js']
            }))
            .pipe(minify({
                ext: {
                    src : '.js',
                    min : '.min.js'
                },
                noSource: true,
                ignoreFiles : ['**/*.min.js']
            }))
            .pipe(concat( prefix + '.min.js' ))
            .pipe(sourcemaps.write( '../maps' ))
            .pipe(gulp.dest( './assets/js/build/' + dest ));
}

/**
 *  compile scripts
 *  
 *  @param  array   src_files   The source files to compile   
 *  @param  string  prefix      The prefix to be appended to the .min.js file  
 *  @param  string  dest        The destination directory ( inside of ./assets/js/build ) 
 *  
 */
function build_scripts( src_files, prefix, dest ) {

    if( false === argv.production )
        return build_scripts_dev( src_files, prefix, dest );

    return gulp.src( src_files )
            .pipe(plumber())
            .pipe(babel({
                presets: ['@babel/env'],
                ignore: ['**/*.min.js']
            }))
            .pipe(minify({
                ext: {
                    src : '.js',
                    min : '.min.js'
                },
                noSource: true,
                ignoreFiles : ['**/*.min.js']
            }))
            .pipe(concat( prefix + '.min.js' ))
            .pipe(gulp.dest( './assets/js/build/' + dest ));
}

/**
 * compile styles with sourcemaps
 */
function styles_dev() {
    return gulp.src('./assets/scss/styles.scss')
            .pipe(plumber(plumberErrorHandler))
            .pipe(sourcemaps.init())
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(sourcemaps.write('./maps/'))
            .pipe(gulp.dest('./assets/css/'));
}

/**
 *  compile styles
 */
function styles() {

    if( false === argv.production )
        return styles_dev();

    return gulp.src('./assets/scss/style.scss')
                .pipe(plumber(plumberErrorHandler))
                .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
                .pipe(autoprefixer())
                .pipe(gulp.dest('./assets/css/'));
}

function scripts() { 
    return build_scripts( [ './assets/js/src/**/*.js' ], 'main', '.' );
}

function watch() {

    gulp.watch(['./assets/scss/**/*.scss'], gulp.series( styles ));
    gulp.watch(['./assets/js/src/**/*.js'], gulp.series( scripts ));

}

exports.default = gulp.series( gulp.parallel( styles, scripts ), watch );
exports.build = gulp.parallel( styles, scripts );