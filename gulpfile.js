
// configuration

var SRC_LIGHTER_DIR = 'examples/hello-lighter/src-lighter';
var SRC_MODULES_DIR = 'examples/hello-lighter/src-modules';
var DEST_DIR = 'examples/hello-lighter/dest';

// dependencies

var fs = require('fs');
var gulp = require('gulp');
var runSequence = require('run-sequence');
var yamljs = require('yamljs');
var replaceTask = require('gulp-replace-task');
var through = require('through-gulp');
var yaml = require('gulp-yaml');
var mergeJson = require('gulp-merge-json');
var rename = require('gulp-rename');
var wrap = require("gulp-wrap");

var mergeJsonIndividual = require('gulp-merge-json-individual');
var jsonToYaml = require('gulp-json-to-yaml');
var jsonExtends = require('gulp-json-include-and-merge');

var lighterAutoRef = require('./src/gulp-lighter-auto-ref');

// configuration by src-lighter files

var DIALOG_PROTOTYPE = yamljs.load(SRC_LIGHTER_DIR + '/prototypes/dialog.yaml');
var TEMPLATE_PROTOTYPE = yamljs.load(SRC_LIGHTER_DIR + '/prototypes/template.yaml');
var APP_TEMPLATE = fs.readFileSync(SRC_LIGHTER_DIR + '/config-templates/app-template.yaml.hbs', 'utf8');
var DIALOG_FIELD_REPLACEMENTS = fs.readFileSync(SRC_LIGHTER_DIR + '/replacements/dialog-fields.yaml', 'utf8');



// var FIELDS = [
//   {name: /textField/g,           className: 'info.magnolia.ui.form.field.definition.TextFieldDefinition'},
//   {name: /richTextField/g,       className: 'info.magnolia.ui.form.field.definition.RichTextFieldDefinition'},
//   {name: /dateField/g,           className: 'info.magnolia.ui.form.field.definition.DateFieldDefinition'},
//   {name: /hiddenField/g,         className: 'info.magnolia.ui.form.field.definition.HiddenFieldDefinition'},
//   {name: /multiValueField/g,     className: 'info.magnolia.ui.form.field.definition.MultiValueFieldDefinition'},
//   {name: /passwordField/g,       className: 'info.magnolia.ui.form.field.definition.PasswordFieldDefinition'},
//   {name: /selectField/g,         className: 'info.magnolia.ui.form.field.definition.SelectFieldDefinition'},
//   {name: /optionGroupField/g,    className: 'info.magnolia.ui.form.field.definition.OptionGroupFieldDefinition'},
//   {name: /twinColSelectField/g,  className: 'info.magnolia.ui.form.field.definition.TwinColSelectFieldDefinition'},
//   {name: /comboBoxField/g,       className: 'info.magnolia.ui.form.field.definition.CheckBoxFieldDefinition'},
//   {name: /compositeField/g,      className: 'info.magnolia.ui.form.field.definition.CompositeFieldDefinition'},
//   {name: /switchableField/g,     className: 'info.magnolia.ui.form.field.definition.SwitchableFieldDefinition'},
//   {name: /basicUploadField/g,    className: 'info.magnolia.ui.form.field.definition.BasicUploadFieldDefinition'},
//   {name: /damUploadFieldField/g, className: 'info.magnolia.dam.app.ui.field.definition.DamUploadFieldDefinition'}
// ];
//
// var FIELDS_REPLACE = FIELDS.map(function(field){
//   return {match: field.name,
//     replacement: field.className
//   };
// });

/**
Default.
Runs when you type 'gulp'.
*/
gulp.task('default', ['all']);

/**
Configure which files to watch and what tasks to use on file changes
TODO: Currently only runs extends task.
TODO: Exclude fragments & prototypes - maybe put those in special src directory.
*/
gulp.task('watch', function() {
  console.log('watch start.');
  gulp.watch(SRC_DIR + '/**/*.*', ['all']);
});

/**
Runs when you type 'gulp all'.
Note: steps run in parallel.
*/
gulp.task('all', function(callback) {
    processWebResources();
    processTemplates();
    processDialogs();
    processApps();
});

/**
Process Apps
*/
function processApps(){
    gulp.src(SRC_MODULES_DIR + '/*/apps/**/*.*')
      .pipe(yaml({ space: 2 }))
      .pipe(wrap(APP_TEMPLATE,{},{engine:'handlebars'}))
      .pipe(rename({extname: ".yaml"}))
      .pipe(gulp.dest(DEST_DIR))
}
gulp.task('apps', function () {
  console.log('Start task: apps');
    processApps();
})

/**
Copy WebResources
*/
function processWebResources(){
    gulp.src(SRC_MODULES_DIR + '/*/webresources/**/*.*') // Get source files with gulp.src
        .pipe(gulp.dest(DEST_DIR)) // Outputs the file in the destination folder
}
gulp.task('webResources', function () {

  console.log('Start task: webResources');
    processWebResources();
})

/**
Process templates.
*/
function processTemplates(){
  console.log('Start task: templates');
  // Copy the ftl files.
  gulp.src(SRC_MODULES_DIR + '/*/templates/**/*.ftl')
      .pipe(gulp.dest(DEST_DIR))

  // Process the yaml files.
  gulp.src(SRC_MODULES_DIR + '/*/templates/**/*.yaml')
    .pipe(yaml({ space: 2 }))
    .pipe(jsonExtends())
    .pipe(mergeJsonIndividual(TEMPLATE_PROTOTYPE))
    .pipe(lighterAutoRef())
    .pipe(jsonToYaml())
    .pipe(gulp.dest(DEST_DIR))
}
gulp.task('templates', function(){
    processTemplates();
});

/**
Processes dialogs
*/
function processDialogs(){
  console.log('Start task: dialogs');
  gulp.src(SRC_MODULES_DIR + '/*/dialogs/**/*.yaml')
    .pipe(replaceTask({
      usePrefix: false,
      patterns: [
        {
          yaml: 'richTextField: info.magnolia.ui.form.field.definition.RichTextFieldDefinition'
        }]
    }))
    .pipe(yaml({ space: 2 }))
    .pipe(jsonExtends())
    .pipe(mergeJsonIndividual(DIALOG_PROTOTYPE))
    .pipe(jsonToYaml())
    .pipe(gulp.dest(DEST_DIR))
}
gulp.task('dialogs', function(){
    processDialogs();
});
