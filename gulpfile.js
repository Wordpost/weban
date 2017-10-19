"use strict";
var gulp        = require('gulp'),              // Подключаем Gulp
  sass          = require('gulp-sass'),         // Подключаем Sass пакет,
  cleanCSS      = require('gulp-clean-css'),    // Объединение классов в группу
  csscomb       = require('gulp-csscomb'),      // Облагораживает цсс код
  browserSync   = require('browser-sync'),      // Подключаем Browser Sync
  concat        = require('gulp-concat'),       // Подключаем gulp-concat (для конкатенации файлов, объединения)
  uglifyjs      = require('gulp-uglifyjs'),     // Подключаем gulp-uglifyjs (для сжатия JS)
  html          = require('gulp-file-include'), // работа с инклюдами в html и js
  del           = require('del'),               // Подключаем библиотеку для удаления файлов и папок
  imagemin      = require('gulp-imagemin'),     // Подключаем библиотеку для работы с изображениями
  pngquant      = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
  cache         = require('gulp-cache'),        // Подключаем библиотеку кеширования
  autoprefixer  = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
  spritesmith   = require('gulp.spritesmith');  // Спрайт

// Создаем таск Sass
  gulp.task('sass', function() {
    return gulp.src('app/sass/**/*.scss') // Берем источник
      .pipe(sass({
        errLogToConsole: true,
        includePaths: require('node-bourbon').includePaths
      })) // Преобразуем Sass в CSS посредством gulp-sass
      .pipe(autoprefixer( { // Создаем префиксы
        browsers: ['last 20 versions', '> 1%', 'ie 10'],
        cascade: true
      } ) )
      //.pipe(cleanCSS())
      .pipe(csscomb())
      .pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
      .pipe(browserSync.reload({  // Обновляем CSS на странице при изменении
        stream: true
      }));
  });

// Создаем такс для генирации спрайта
  gulp.task('sprite', function () {
    var spriteData = gulp.src('app/images/icon/*.png').pipe(spritesmith({
      imgName:   '../images/sprite.png',
      padding:   5,
      cssName:   '_sprite.scss',
      algorithm: 'top-down'
    }));
    spriteData.img
      .pipe(gulp.dest('app/images'));

    spriteData.css
      .pipe(gulp.dest('app/sass'));
    return spriteData;
  });

// Создаем таск browser-sync
  gulp.task('browserSync', ['sass', 'js', 'html'], function() {
    browserSync({ // Выполняем browserSync
      server: { // Определяем параметры сервера
        baseDir: './app'  // Директория для сервера - app
      },
      open: false,
      notify: false // Отключаем уведомления
    });
  });

// Создаем таск для объединения js
  gulp.task('js', function () {
    return gulp.src([ // Берем все необходимые библиотеки
      //https://github.com/fancyapps/fancybox
      // bootstrap full
      //'node_modules/popper.js/dist/popper.js',
      //'node_modules/bootstrap/js/dist/js/bootstrap.js',
      'node_modules/bootstrap/js/dist/util.js',
      'node_modules/bootstrap/js/dist/alert.js',
      'node_modules/bootstrap/js/dist/button.js',
      'node_modules/bootstrap/js/dist/carousel.js',
      'node_modules/bootstrap/js/dist/collapse.js',
      //'node_modules/bootstrap/js/dist/dropdown.js',
      'node_modules/bootstrap/js/dist/modal.js',
      'node_modules/bootstrap/js/dist/scrollspy.js',
      'node_modules/bootstrap/js/dist/tab.js',
      //'node_modules/bootstrap/js/dist/tooltip.js',
      //'node_modules/bootstrap/js/dist/popover.js',
    ])
      .pipe(concat('libs.min.js'))  // Собираем их в кучу в новом файле libs.min.js
      .pipe(uglifyjs()) // Сжимаем JS файл
      .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
  });

// таск для билдинга html
  gulp.task('html', function() {
    return gulp.src('app/html/*.html')
      .pipe(html({ prefix: '@@', basepath: '@file' }))
      .pipe(gulp.dest('app'))
      .pipe(browserSync.reload({  // Обновляем CSS на странице при изменении
        
        stream: true
      }));
  });

// Чистка перед сборкой проекта
  gulp.task('clean', function () {
    return del.sync('dist');  // Удаляем папку dist перед сборкой
  });

// Создаем таск для оптимизации картинок
  gulp.task('images', function () {
    return gulp.src('app/images/**/*')    // Берем все изображения из app
      .pipe(cache(imagemin({          // Сжимаем их с наилучшими настройками с учетом кеширования
        interlaced: true,
        progressive: true,
        svgoPlugins: [ {removeViewBox: false} ],
        une: [ pngquant() ]
      })))
      .pipe(gulp.dest('dist/images'));    // Выгружаем на продакшен
  });

// Создаем таск для сбора проекта
  gulp.task('build', ['clean', 'images', 'sass', 'js'], function () {
    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
      'app/css/libs.css'
    ])
      .pipe(gulp.dest('dist/css'));
    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
      .pipe(gulp.dest('dist/fonts'));
    var buildJs = gulp.src([                    // Переносим скрипты в продакшен
      'app/js/libs.min.js',
      'app/js/main.js'
    ])
      .pipe(gulp.dest('dist/js'));
    var buildHtml = gulp.src('app/*.html')     // Переносим HTML в продакшен
      .pipe(gulp.dest('dist'));
  });


// Наблюдение за проектом
  gulp.task('watch', function () {
    gulp.watch('app/sass/**/*.scss', function(event, cb) {
      setTimeout(function(){gulp.start('sass');},500) // задача выполниться через 500 миллисекунд и файл успеет сохраниться на диске
    });// Наблюдение за scss файлами в папке sass
    gulp.watch( 'app/html/**/*.*', ['html'] );    // Наблюдение за HTML файлами в корне проекта
    gulp.watch( 'app/images/icon/*.png', ['sprite'] );    // Наблюдение за иконками для спрайта
    gulp.watch('app/libs/**/*.js', ['js']); // Наблюдение за JS файлами в папке libs
    gulp.watch( 'app/js/*.js').on("change", browserSync.reload); // Наблюдение за JS файлами в папке js
  });

// Запуск gulp
  gulp.task('default', ['browserSync', 'watch']);