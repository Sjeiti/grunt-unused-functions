/*
 * unused-functions
 * https://github.com/Sjeiti/unused-functions
 *
 * Copyright (c) 2013 Ron Valstar
 * Licensed under the MIT license.
 */

//'use strict';

module.exports = function (grunt) {

	var fs = require('fs');

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerMultiTask('unused_functions','Your task description goes here.',function () {
		var oOptions = this.options({
					disable: true
					,mark: 'UNUSED'
					,uglify: true
					,uglifyOptions: {warnings:false} // see: https://github.com/mishoo/UglifyJS2#compressor-options
					,replace: true
				})
			,i
			,iLineNr
			,sLine
			,sFile
			,aLines
			,iLines
			,sMark = (oOptions.disable?('return false;'):'')+(oOptions.mark!==''?'/*'+oOptions.mark+'*/':'')
			,rFunctionG = /function\s?(\w*)?\(([^\)]+)?\)\s?{/g
			,aFnLines
			,iFnLines
			,sNewFile
			// sniff injection vars
			,sInsertName = 'sniff_'+Math.ceil(1E8*Math.random()).toString(36)
			,oCountPrints
			,iUnused
			,aUnused
			,aUsed
			// dummy replacement vars
			,sLargeDummy = 'z'+Math.ceil(1E32*Math.random()).toString(36)
			,iDummyLength
			,iDummyIndex
			,sDummyName
			// uglify vars
			,uglify
			,oCompressor
			,oAst
		;
		//
		function getInsert(nr){
			return ';'+sInsertName+'('+nr+');';
		}
		GLOBAL[sInsertName] = function(line){
			oCountPrints[line]++;
		};
		//
		// Iterate over all src-dest file pairs.
		this.files.forEach(function(f) {
			sFile = fs.readFileSync(f.src).toString();
			aLines = sFile.split(/[\n]/g);
			iLines = aLines.length;
			aFnLines = [];
			// sniff injection vars
			oCountPrints = {};
			aUnused = [];
			aUsed = [];
			// dummy replacement vars
			iDummyLength = 1;
			iDummyIndex = 0;
			//
			// inject sniffer function into target script
			for (i=0;i<iLines;i++) {
				iLineNr = i+1;
				sLine = aLines[i];
				if (sLine.match(rFunctionG)) {
					aFnLines.push(iLineNr);
					aLines[i] = sLine = sLine.replace(rFunctionG,'$&'+getInsert(iLineNr));
				}
			}
			iFnLines = aFnLines.length;
			sNewFile = aLines.join('\n')+(f.append||'');
			//fs.writeFileSync(f.dest,sNewFile);
			//
			// count unused functions
			f.prepare&&f.prepare();
			for (i=0;i<iLines;i++) oCountPrints[aFnLines[i]] = 0;
			//require(f.dest);
			//module.parent.require('./'+f.dest);
			eval(sNewFile);
			f.test&&f.test();
			//
			// gather result data
			for (i=0;i<iFnLines;i++) {
				iLineNr = aFnLines[i];
				if (oCountPrints[iLineNr]===0) {
					aUnused.push(iLineNr);
				} else {
					aUsed.push(iLineNr);
				}
			}
			iUnused = aUnused.length;
			//
			// remove sniff() and disable unused functions
			for (i=0;i<iFnLines;i++) {
				iLineNr = aFnLines[i];
				sLine = aLines[iLineNr-1];
				var bUsed = aUsed.indexOf(iLineNr)>=0
					,sInsert = getInsert(iLineNr)
				;
				aLines[iLineNr-1] = sLine.replace(sInsert,bUsed?'':sMark);
			}
			sNewFile = aLines.join('\n');
			//
			// let uglify compress it
			if (oOptions.uglify) {
				uglify = require('uglify-js');
				oCompressor = uglify.Compressor(oOptions.uglifyOptions);
				oAst = uglify.parse(sNewFile);
				oAst.figure_out_scope();
				oAst = oAst.transform(oCompressor);
				oAst.figure_out_scope();
				oAst.compute_char_frequency();
				oAst.mangle_names();
				sNewFile = oAst.print_to_string({});//options
				//
				// replace unused function expressions with dummy, alter unused function declarations
				if (oOptions.replace) {
					// find smallest possible dummy name
					while (iDummyIndex>=0) {
						iDummyLength++;
						iDummyIndex = sNewFile.indexOf(sLargeDummy.substr(0,iDummyLength));
					}
					sDummyName = sLargeDummy.substr(0,iDummyLength);
					// replace unused function expressions with dummy
					sNewFile = 'function '+sDummyName+'(){return!1};'+sNewFile.replace(/function\([^)]*\){return!1}/g,sDummyName);
					// remove unused function declaration arguments and contents
					sNewFile = sNewFile.replace(/(function\s\w+\()([^)]*)(\){)(return!1)(})/g,'$1$3$5');
				}
			}
			//
			// save result
			fs.writeFileSync(f.dest,sNewFile);
			//
			// result log
			grunt.log.writeln('tested',f.src,'with',iLines,'lines');
			if (iUnused===0) {
				grunt.log.ok('no redundant functions found');
			} else {
				grunt.log.error(iUnused+' of '+iFnLines+' functions unused');
			}
		});
	});

};
