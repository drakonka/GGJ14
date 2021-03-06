/*global ig, MyGame, Level1, LevelTitle, LevelMissionbrief, LevelIntro, LevelBoss, console, localStorage, EntityGui, EntitySpeechgui, EntityPickup, EntityPausegui, EntityPlayer, EntityTrigger, EntityPointer, LevelFinish, i */

ig.module(
	'game.misc.controller'
)
.requires(
	'impact.impact'
)
.defines(function(){"use strict";

ig.Controller = ig.Class.extend({

	init: function(){
	},

	checkSheepStats: function() {
		var allSheepArr = ig.game.getEntitiesByType(EntitySheep);
		for (var i = 0; i < allSheepArr.length; i++) {
			var sheep = allSheepArr[i];
			sheep.setDifficulty();
		}
	},

	
	/******* UTILITY FUNCTIONS *******/
	

	killOffScreen: function(entity, leftOnly) {
		if (leftOnly) {
			if (entity.pos.x < ig.game.screen.x * 1) {
				entity.kill();
			}		
		}
		else {
			if (entity.pos.y < ig.game.screen.y * 1 || entity.pos.y > (ig.game.screen.y + ig.system.height) * 1 || entity.pos.x < ig.game.screen.x * 1 || entity.pos.x > (ig.game.screen.x + ig.system.width) * 1) {
				entity.kill();
			}
		}
	},
    
	calcAngle: function(entity,angle) {
		if (angle) {
			var sinAngle = Math.sin(angle);
			var cosAngle = Math.cos(angle);
        }

        else {
			var sinAngle = Math.sin(entity.angle);
			var cosAngle = Math.cos(entity.angle);
        }
		var bulletX = (entity.pos.x + entity.size.x / 2) + (sinAngle);
		var bulletY = (entity.pos.y + entity.size.y / 2) - (cosAngle);
		return {x: bulletX, y: bulletY, sin: sinAngle, cos: cosAngle};
	},
	

	splitLines: function(text,font,maxTextWidth) {
		// Split text into words by spaces
		var words = text.split(' ');
		var lastWord = words[words.length - 1];
		var lineWidth = 0;
		var wordWidth = 0;
		var thisLine = '';
		var allLines = [];
		ig.system.context.save();
		ig.system.context.font = font;
		// For every element in the array of words
		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			// Add current word to current line
			thisLine = thisLine.concat(word + ' ');
			// Get width of the entire current line
			lineWidth = ig.system.context.measureText(thisLine).width;
			// If word is not the last element in the array
			if (word !== lastWord) {
				// Find out what the next upcoming word is
				var nextWord = words[i + 1];

				// Check if the current line + the next word would go over width limit
				if (lineWidth + ig.system.context.measureText(nextWord).width >= maxTextWidth) {
					// If so, add the current line to the allLines array
					// witout adding the next word
					addToAllLines(thisLine);
				} 

				// '~' indicates inserting a blank line, if required
				else if (word === '~') {
					addToAllLines(' ');
				}

				// If the next word is a line break, end line now
				else if (nextWord === '~') {
					addToAllLines(thisLine);
				}
			}

			// If this IS the last word in the array
			else {
				// Add this entire line to the array and return allLines
				addToAllLines(thisLine);
				return allLines;
			}
			ig.system.context.restore();
			
		}

		// Function that adds text to the array of all lines
		function addToAllLines(text) {
			allLines.push(text);
			thisLine = '';
			lineWidth = 0;
		}		
	},


	shuffleArray: function(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	},


	randomFromTo: function(from, to){
       return Math.floor(Math.random() * (to - from + 1) + from);
    },


	toDegrees: function(num) {
		return num * (180/Math.PI);
	},

	toRadians: function(num) {
		return num * (Math.PI/180);
	},

	removeFromArray: function(object,array) {
		var index = array.indexOf(object);
		array.splice(index, 1);
	},


    inArray: function(arr, obj) {
		return (arr.indexOf(obj) != -1);
	},

	isOdd: function(number) {
		return (number % 2) == 1;
	},

	pause: function() {
		ig.Timer.timeScale = (ig.Timer.timeScale === 0 ? 1 : 0);
		this._paused = ig.Timer.timeScale === 0;
		ig.game.paused = !(ig.game.paused);
	}
  
});

});