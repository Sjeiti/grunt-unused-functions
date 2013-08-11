# grunt-unused-functions

> Use a test suite to filter out unused functions to an output file.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-unused-functions --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-unused-functions');
```

## The "unused_functions" task

### Overview
In your project's Gruntfile, add a section named `unused_functions` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  unused_functions: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.disable
Type: `Boolean`
Default value: `true`

Disable the unused fuction.

#### options.mark
Type: `String`
Default value: `'UNUSED'`

Marks the unused function with a comment.

#### options.uglify
Type: `Boolean`
Default value: `true`

Uglifies the resulting script to reduce the filesize.

#### options.uglifyOptions
Type: `Object`
Default value: `{warnings:false}`

Default uglify options. See: https://github.com/mishoo/UglifyJS2#compressor-options

#### options.replace
Type: `Boolean`
Default value: `true`

Small optimisations after uglification.

### Usage Examples

#### Default Options
This setup will test 'myLib' for unused functions after calling myLib.foo() and myLib.bar(). Unused functions are truncated into a minified version.

```js
grunt.initConfig({
  unused_functions: {
    options: {},
	emmet: {
		src: './temp/myLib.js',
		dest: './temp/myLib.min.js',
		append: '\n;GLOBAL.myLib=myLib;',
		prepare: function(){},
		test: function(){
			myLib.foo();
			myLib.bar();
		}
	}
  }
})
```