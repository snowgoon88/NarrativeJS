// Console for Relation Net
//
//"use strict";

// TODO: ENTER is not a good choice of completion key
//       => arrow_right ?
// TODO: Ctrl+SPACE => find proper Pattern
// TODO: difference between abort (forget) and stop (temporary) pattern, or undisplay

// *****************************************************************************
// List of Command
// *****************************************************************************
var _cmdList = [
    { token : ":?",
      helpmsg : "help, list all command",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          var msg = "<ul>\n";
          for(var i = 0; i < _cmdList.length; i++) {
              var cmd = _cmdList[i];
              msg += "<li>"+cmd.token+" => "+cmd.helpmsg+"</li>";
          }
          msg += "</ul>";
          dataDiv.innerHTML = msg;
      }
    },
    { token : ":load",
      args : ["FILENAME"],
      helpmsg : "LOAD story from FILENAME",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          var filename = cmdLine.slice( 6 );

          displayMsg( 'info_console', 'Loading from '+filename, 'INFO: ' );
          console.time( 'readjson' ); // timer
          let _start = new Date();
          // TODO: could prevent usage of console during load
          Neutralino.filesystem.readFile(
              filename,
              function (data) { // Success
                  var eventsObj = JSON.parse( data.content );
                  populateFromJSON( eventsObj );
                  console.timeEnd( 'readjson' );

                  let _end = new Date;
                  let _diff = _end - _start;
                  displayMsg( 'info_console', ' Loaded in '+_diff+' ms.', '', true);
              },
              function () { // Error
                  displayMsg( 'info_console', ' Error reading '+filename, '', true);
              }
          )
      }
    },
    { token : ":save",
      args : ["FILENAME"],
      helpmsg : "SAVE story into FILENAME",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          var filename = cmdLine.slice( 6 );

          displayMsg( 'info_console', 'Saving to '+filename, 'INFO: ' );
          console.time( 'writejson' ); // timer
          let _start = new Date();
          // TODO: could prevent usage of console during save
          var story_json = JSON.stringify( NEventArray );
          Neutralino.filesystem.writeFile(
              filename, story_json,
              function (data) { // Success
                  console.timeEnd( 'writejson' );

                  let _end = new Date;
                  let _diff = _end - _start;
                  displayMsg( 'info_console', ' Saved in '+_diff+' ms.', '', true);
              },
              function () { // Error
                  displayMsg( 'info_console', ' Error writing '+filename, '', true);
              }
          )
      }
    },
    { token : ":list",
      helpmsg : "List all Events",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          dataDiv.innerHTML = listEvent();
      }
    },
    { token : ":see",
      args : ["NODE_LABEL", "NODE_ID"],
      helpmsg : "DISPLAY info about node ID/LABEL",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          var node_str = cmdLine.slice( 5 );
          var data_msg = "<p>ARG="+node_str+"=</p>";
          if (node_str.length > 0) {
              // search for node
              for (var i = 0; i < NEventArray.length; i++) {
                  var c_node = NEventArray[i];
                  if (c_node.label.indexOf( node_str ) == 0) {
                      data_msg += "<p>STR "+c_node.toString()+"</p>";
                  }
                  if (c_node.id === parseInt(node_str)) {
                      data_msg += "<p>ID "+c_node.toString()+"</p>";
                  }
              }
          }
          dataDiv.innerHTML = data_msg;
      }
    },
    { token : ":license",
      helpmsg : "DEBUG Silly little message",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          dataDiv.innerHTML = "<p>Not Licensed yet</p>";
      }
    },
    { token : ":sl",
      helpmsg : "Search in Labels",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          var pattern = cmdLine.slice( 4 );
          var data_msg = "<p>search label ARG="+pattern+"=</p>";
          var found = regsearchLabelInEventArray( NEventArray, pattern );

          for( var ie = 0; ie < found.length; ie++ ) {
              data_msg += "<p>"+found[ie].toString()+"</p>";
          }
          dataDiv.innerHTML = data_msg;
      }
    },
    { token : ":sd",
      helpmsg : "Search in Dates",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          var argDate = cmdLine.slice( 4 );
          var iDate = parseIDateStr( argDate );

          var data_msg = "<p>search date";
          if (iDate != undefined ) {
              data_msg += "idate = "+iDate;
              data_msg += "=</p>";

              var found = searchIDateInEventArray( NEventArray, iDate );
              for( var ie = 0; ie < found.length; ie++ ) {
                  data_msg += "<p>"+found[ie].toString()+"</p>";
              }
          }
          else {
              data_msg += " idate undefined</p>";
          }

          dataDiv.innerHTML = data_msg;
      }
    },
    { token : ":nn",
      helpmsg : "new node 'label'",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          // valid if not in another node
          if (story.current_node != null) {
              outputDiv.innerHTML = "ERROR : cannot ADD into anoter Node";
              return;
          }
          var label = cmdLine.slice( 4, cmdLine.length );
          var date = new IDate();
          date.setInstant( 2020, 7 );
          story.current_idx = addEvent( label, date );
          console.log( "__NEW EVENT\n" + listEvent() );
          dataDiv.innerHTML = listEvent();

          // tell viewer we have something new
          _eventViewer.update( {type: "add", id: story.current_idx } ); 
      }
    },
    { token : ":in",
      helpmsg : "enter the current node",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          story.current_node = NEventArray[story.current_idx];
      }
    },
    { token : ":out",
      helpmsg : "exit the current node",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          story.current_node = null;
      }
    },
    { token : ":cd",
      helpmsg : "change date <Date format> to current node",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          // valid if current node exists
          if (story.current_node == null ) {
              outputDiv.innerHTML = "ERROR : no CURRENT_NODE to change date";
              return;
          }
          var dateStr = cmdLine.slice( 4, cmdLine.length );
          var dateO = parseDateStr( dateStr );
          if (dateO != undefined) {
              story.current_node.date.setInstant( dateO.yy, dateO.mm, dateO.dd,
                                                  dateO.hh, dateO.min );
              console.log( "__NEW EVENT\n" + listEvent() );
              dataDiv.innerHTML = listEvent();
          }
          else {
              outputDiv.innerHTML = "ERROR : DATE format unrecognized";
              return;
          }
      }
    },
    { token : ":rebuild",
      helpmsg : "rebuild graph and display",
      process : function( cmdLine, story, outputDiv, dataDiv ) {
          _eventViewer.build();
      }
    }
];
/** find all options that start with pattern, or have pattern in them */
var _allCommands = [];
for( var idC=0; idC < _cmdList.length; idC++ ) {
    _allCommands.push( _cmdList[idC].token.slice(1) );  // remove ":"
}
var getAllCommands = function() { return _allCommands; };

var getAllNodeLabel = function() {
    var labels = [];
    for (var i = 0; i < NEventArray.length; i++) {
        labels.push( NEventArray[i].label );
    }
    return labels;
}
// *****************************************************************************

// *****************************************************************************
// ****************************************************************** Completion
// *****************************************************************************
// TODO: Completion look into a list of Pattern => to change
//       potential patterns are in this._listTemp
// VOID => need to find valid Pattern
/** Default Completion Attributes */
var DEFATT = { maxMatch: 5, minPatLength: 2, caseSensitive: false };

// *****************************************************************************
// ******************************************************************** Template
/** Pattern to be detected for Completion.
 *
 * Typically, a Template is recognized when pat.length === pos.
 *
 * Params:
 * - pat : String, Pattern that need to be recognized
 * - start : String, start mark for Template (ex '[[' or ':' )
 * - end : String, end mark for Template (ex ' ')
 *
 * For command, Template would be ( ":", ":", " " )
 */
var Template = function( pat, start, end, listCandidates, nextTemplate ) {
    
    this.pat = pat;      /* text of pattern matching this Template*/
    this.start = start;  /* start mark for Template */ 
    this.end = end;      /* end mark for Template */
    this.pos = 0;        /* current pos IN recognized pattern */
    /* function to use to get list of candidates */
    this.listCandidates = listCandidates;
    /* template to use after success or undefined */
    this.next = (typeof nextTemplate !== 'undefined') ? nextTemplate : undefined;
};
/**
 * Struct for storing completion options, as we need to memorise 
 * the titles of the tiddlers when masked and when body must be displayed.
 */
var OptCompletion = function( title, str ) {
    this.title = title;    /* // TODO: */
    this.str = str;        /* what will appear in popup */
};

/**
 * _state:VOID, _template:undefined => no candidate TemplatePattern recognized
 *    -> keyUp : check if some matching Template
 *    => _state:PATTERN _template:SET => WHEN template.pat detected
 * _state:PATTERN => should have recognized a Pattern
 * _state:SELECT  => should have recognized a Pattern
 *    -> no valid Pattern => _state:VOID, _template:undefined
 *    -> keyUp ENTER : change areaNode => _state:VOID, _template:undefined
 *    -> keyUp UP/DOWN : => _state:SELECT
 *    -> valid Pattern : display popUp if some matches, otherwise _state:PATTERN
 * -> ESC : _state:VOID, _template:undefined
  */
/** Params:
 * - areaNode : the textarea Element which is edited.
 * - popupDiv : a div Element which will serve as popup.
 * - verb : bool for verbosity
 * - offTop, offLeft : offset for popupDiv in pix.
 */
var Completion = function( areaNode, popupDiv, verb, offTop, offLeft ) {

    if (verb) console.log( "__Completion::creation" );

    this._areaNode = areaNode;
    this._popNode = popupDiv;
    this._offTop = (typeof offTop !== 'undefined') ?  offTop : 0;
    this._offLeft = (typeof offLeft !== 'undefined') ?  offLeft : 0;
    
    // Completions attributes
    /** State */
    this._state = "VOID";
    //CHG this._template = undefined;
    this._cmdTmplate = new Template( ":", ":", " ", getAllCommands );
    this._nodeTemplate = new Template( "$", "", "", getAllNodeLabel );
    this._listTemplate = [ this._cmdTmplate,
                           this._nodeTemplate ];
    this._template = undefined;
    /** Best matches */
    this._bestMatches = []; // An array of OptCompletion
    this._idxChoice = -1;
    /** Param */
    // maximum nb of match displayed
    this._maxMatch      = DEFATT.maxMatch;   
    this._minPatLength  = DEFATT.minPatLength;
    this._caseSensitive = DEFATT.caseSensitive;
    
    /** Input information */
    this._lastChar = "";        // last user input character
    this._hasInput = false;     // is last key event a real input

    // ********************************************************* findBestMatches
    /** 
     * Find the bestMatches among listChoice with given pattern
     * First, matches that starts with pattern
     * Then, a horizontal line
     * Then, matches that contain the pattern
     * If too much matches, '...' is introduced.
     *
     * Params:
     * - listChoice : array of String
     * - pattern : String pattern we are looking for.
     * -  nbMax : after that number of matches, stop search and return
     * Changes: 
     * - this._bestMatches => array of OptCompletion
     */
    this._findBestMatches = function( listChoice, pattern, nbMax, verb) {
	// regexp search pattern, case sensitive
	var flagSearch = this._caseSensitive ? "" : "i" ;
	var regpat = RegExp( regExpEscape(pattern), flagSearch );
	var regpat_start = RegExp( "^"+regExpEscape(pattern), flagSearch );
	//var regMask = RegExp( this._template.mask ? this._template.mask : "","");
	var nbMatch = 0;
	// nbMax set to _maxMatch if no value given
	nbMax = nbMax !== undefined ? nbMax : this._maxMatch;

        if (verb )
	    console.log( "__FIND BM regPat="+regpat+" startPat="+regpat_start);

	this._bestMatches= [];
	var otherMatches = [];
	// We test every possible choice
	for( var i=0; i< listChoice.length; i++ ) {
	    // apply mask over potential choice
	    var maskedChoice = listChoice[i]; //CHG .replace( regMask, "");
            if (verb) console.log( "   test with {"+maskedChoice+"}" );
	    // Test first if pattern is found at START of the maskedChoice
	    // THEN added to BestMatches
 	    if( regpat_start.test( maskedChoice )) {
                if (verb) console.log( "    =>START" );
		if (nbMatch >= nbMax) {
		    this._bestMatches.push( new OptCompletion("","...") );
		    return;
		} else {
		    this._bestMatches.push( new OptCompletion(listChoice[i],maskedChoice) );
		    nbMatch += 1;
		}
	    }
	    // then if pattern is found WITHIN the maskedChoice
	    // added AFTER the choices that starts with pattern
	    else if( regpat.test( maskedChoice ) ) {
                if (verb) console.log( "     =>OTHER" );
		if (nbMatch >= nbMax && otherMatches.length > 0) {
		    // add all otherMatches to _bestMatches
		    this._bestMatches.push( new OptCompletion("","<hr>") ) ; //separator
		    this._bestMatches = this._bestMatches.concat( otherMatches );
		    this._bestMatches.push( new OptCompletion("","...") );
		    return;
		} else {
		    otherMatches.push( new OptCompletion(listChoice[i],maskedChoice) );
		    nbMatch += 1;
		}
	    }
	}
	// Here, must add the otherMatches if any
        if (otherMatches.length > 0 ) {
	    this._bestMatches.push( new OptCompletion("","<hr>") ) ; //separator
	    this._bestMatches = this._bestMatches.concat( otherMatches );
        }
    };

    /**
     * Change Selected Status of Items
     */
    this._next = function (node) {
	var count = node.children.length;
	//DEBUG console.log( "__NEXT: co="+count+" nbMatch="+this._bestMatches.length);
	if( this._bestMatches.length > 0 ) 
	    this._goto( node, this._idxChoice < count - 1 ? this._idxChoice + 1 : -1);
	//DEBUG this._logStatus( "NexT" );
    };
    this._previous = function (node) {
	var count = node.children.length;
	var selected = this._idxChoice > -1;
	//DEBUG console.log( "__PREV: co="+count+" nbMatch="+this._bestMatches.length);
	if( this._bestMatches.length > 0 ) 
	    this._goto( node, selected ? this._idxChoice - 1 : count - 1);
	//DEBUG this._logStatus( "PreV" );
    };
    // Should not be directly used, highlights specific item without any checks!
    this._goto = function (node, idx) {
	var lis = node.children;
	var selected = this._idxChoice > -1;
	if (selected) {
	    lis[this._idxChoice].setAttribute("patt-selected", "false");
	}

	this._idxChoice = idx;
    
	if (idx > -1 && lis.length > 0) {
	    lis[idx].setAttribute("patt-selected", "true");
	}
    };
    
    /**
     * Abort pattern and undisplay.
     */
    this._abortPattern = function (displayNode) {
        this.debugLog( "***ABORT***" );
        //CHG need to test if pattern is cmdPattern
	this._state = "VOID";
	this._idxChoice = -1;
	this._undisplay( displayNode );
        if (this._template) this._template.pos = 0;
	this._template = undefined;
    };
    /**
     * Display popupNode at the cursor position in areaNode.
     */
    this._display = function( areaNode, popupNode ) {
        this.debugLog( ">> Ask for DISPLAY style={"+popupNode.style.display+"}" );
        this.debugLog( "   popupNode.id="+popupNode.id );
	if ( popupNode.style.display != 'block' ) {
            this.debugLog( "  ok as display was none" );
	    // Must get coordinate
	    // Cursor coordinates within area + area coordinates + scroll
            var coord = getCaretCoordinates(areaNode, areaNode.selectionEnd);
            var styleSize = getComputedStyle(areaNode).getPropertyValue('font-size');
            var fontSize = parseFloat(styleSize); 
		
	    popupNode.style.left = (this._offLeft+areaNode.offsetLeft-areaNode.scrollLeft+coord.left) + 'px';
	    popupNode.style.top = (this._offTop+areaNode.offsetTop-areaNode.scrollTop+coord.top+fontSize*2) + 'px';
	    popupNode.style.display = 'block';
	}
    };
    /**
     * Undisplay someNode
     */
    this._undisplay = function( displayNode ) {
	if ( displayNode.style.display != 'none' ) {
	    displayNode.style.display = 'none';
	}
    };
};

// *********************************************************************** debug
Completion.prototype.debug = function() {
    if (this.verb) {
        console.log( "__COMPLETION *******************" );
        console.log( "  _state="+this._state+" _hasInput="+this._hasInput );
        if (this._template) {
            console.log( "  _template" );
        }
        var msg = "  _bestMatches=";
        for( var idBM=0; idBM < this._bestMatches.length; idBM++ ) {
            msg += this._bestMatches[idBM].title+", ";
        }
        console.log( msg );
        console.log( "  _idxChoice="+this._idxChoice );
    }
};
// ******************************************************************** debugLog
Completion.prototype.debugLog = function(msg) {
    if (this.verb) console.log(msg);
}
// *****************************************************************************
// *************************************************************** handleKeyDown
/**
 * Disable the *effects* of ENTER / UP / DOWN / ESC when needed.
 * Set _hasInput to false.
 */
Completion.prototype.handleKeydown = function(event) {
    // key 
    var key = event.keyCode;
    this._hasInput = false;
    
    this.debugLog( "__KEYDOWN ("+key+") hasI="+this._hasInput);
    this.debug();

    // Interact only when PATTERN or SELECT
    if ( (this._state === "PATTERN" || this._state === "SELECT") ) {
        // ENTER or ESC
        if ((key === 13) || (key === 27 )) {
            event.preventDefault();
    	    event.stopPropagation();
            return true;
        }
        if ( (key===38 || key===40) ) {
            event.preventDefault();
        }
    }
    return false;
};
/**
 * Means that something has been added/deleted => set _hasInput
 */
Completion.prototype.handleInput = function(event) {
    this._hasInput = true;
    this.debugLog( "__INPUT hasI="+this._hasInput );
};
/**
 * Set _lastChar,
 * // TODO: detects CTRL+SPACE.
 */
Completion.prototype.handleKeypress = function(event) {
    var curPos = this._areaNode.selectionStart;  // cursor position
    var val = this._areaNode.value;   // text in the area
    var key = event.keyCode || event.which; // key
	
    this._lastChar = String.fromCharCode(key);
    this.debugLog( "__KEYPRESS ("+key+") hasI="+this._hasInput+" char="+this._lastChar );
    
    // // Detect Ctrl+Space
    // if( key === 32 && event.ctrlKey && this._state === "VOID" ) {
    //     console.log( "  should check for potential template" );
    //     //Find a proper Template
    //     // first from which we can extract a pattern
    //     if( this._template === undefined ) {
    //         //DEBUG console.log("__SPACE : find a Template" );
    //         var idT, res;
    //         for( idT=0; idT < this._listTemp.length; idT++ ) {
    //     	res = extractPattern( val, curPos, this._listTemp[idT] );
    //     	//DEBUG console.log("  t="+this._listTemp[idT].pat+" res="+res);
    //     	// res is not undefined => good template candidate
    //     	if( res ) {
    //     	    this._template = this._listTemp[idT];
    //     	    this._state = "PATTERN";
    //     	    break;
    //     	}
    //         }
    //     }
    //     else {
    //         console.log("__SPACE : already a template" );
    //         this._state = "PATTERN";
    //     }
    // }
};
/** Handle keyUP and do most of Completion internal processin.
 * @see Completion
*/
Completion.prototype.handleKeyup = function(event) {
    var curPos = this._areaNode.selectionStart;  // cursor position
    var val = this._areaNode.value;   // text in the area
    var key = event.keyCode;
    
    this.debugLog( "__KEYUP ("+key+") hasI="+this._hasInput );
    
    // ESC
    if( key === 27 ) {
	this._abortPattern( this._popNode );
	//DEBUG this._logStatus( "" );
    }
    
    // Check cmdTemplate
    if( this._hasInput && this._state === "VOID" ) {
        this.debugLog( "  is VOID, look for PATTERN" );

        // Find proper Template if possible
        var idT, template;
        for( idT=0; idT < this._listTemplate.length; idT++ ) {
            template = this._listTemplate[idT];
            if( this._lastChar === template.pat[template.pos] ) {
                template.pos += 1;

                // Pattern totaly matched ?
                if( template.pos === template.pat.length ) {
                    this._state = "PATTERN";
                    this._template = template;

                    break; // go out of Loop, template found.
                }
            }
            else {
                template.pos = 0;
            }
        }
        
        // var template = this._cmdTmplate;
        // if( this._lastChar === template.pat[template.pos] ) {
        //     template.pos += 1;
        //     this.debugLog( "  -> still matching template pat="+template.pat+" pos="+template.pos );

        //     // Pattern totaly matched ?
        //     if( template.pos === template.pat.length ) {
        // 	this.debugLog( "  => Template RECOGNISED "+template.pat );
        // 	this._state = "PATTERN";
        // 	this._template = template;
		
        // 	//break; // get out of loop
        //     }
        // }
        // else {
        //     template.pos = 0;
        //     this.debugLog( "  -> stop matching template pat="+template.pat+" pos="+template.pos );

        // }
    }
    
    else if( this._state === "PATTERN" || this._state === "SELECT" ) {
        this.debugLog( "  PATTERN or SELECT" );
	// Pattern below cursor : undefined if no pattern
	var pattern = extractPattern( val, curPos, this._template,
                                      false /*verb*/ );

        // no Pattern, abort
        if (pattern === undefined) {
            this.debugLog( "  ->undefined Pattern : ABORT" );
	    this._abortPattern( this._popNode );
        }
        else {
            this.debugLog( "  pattern="+pattern.text );

            // ENTER key => select and change areaNode
	    if( key === 13 ) {
	        this.debugLog( "  keyUp: ENTER" );
    	        // Choice made in the displayNode ?
    	        var selected = this._idxChoice > -1 && this._idxChoice !== this._maxMatch;
    	        this.debugLog( "  keyUp: ENTER > sel="+selected+" idxChoice="+this._idxChoice);
    	        if( selected ) {
    		    this.debugLog( "  > selected" );
		    var temp = this._bestMatches[this._idxChoice];
		    var str = temp.str;
		    // if( this._template.field === "body" ) {
		    //     str = $tw.wiki.getTiddlerText( temp.title );
		    // }
    		    insertInto( this._areaNode,
			        str,
			        pattern.start, curPos, this._template );
                    this._bestMatches= [];
		    // save this new content
		    //CHG this._widget.saveChanges( this._areaNode.value );
	        }
	        // otherwise take the first choice (if exists)
	        else if( this._bestMatches.length > 0 ) {
    		    this.debugLog( "  > take first one" );
		    var temp = this._bestMatches[0];
		    var str = temp.str;
                    // check this is not "<hr>"
                    if (str === "<hr>") {
                        temp = this._bestMatches[1];
		        str = temp.str;
                    }
		    // if( this._template.field === "body" ) {
		    //     str = $tw.wiki.getTiddlerText( temp.title );
		    // }
    		    insertInto( this._areaNode,
			        str,
			        pattern.start, curPos, this._template );
                    this._bestMatches= [];
		    // save this new content
		    //CHG this._widget.saveChanges( this._areaNode.value );
	        }
            
	        this._abortPattern( this._popNode );
    	    }

            // UP or DOWN KEY
	    else if( key === 38 && this._hasInput === false) { // up
		this._state = "SELECT";
    		event.preventDefault();
    		this._previous( this._popNode );
    	    }
    	    else if( key === 40 && this._hasInput === false) { // down
	        this._state = "SELECT";
    		event.preventDefault();
    		this._next( this._popNode );

    	    }

            // We have a Pattern, changed by keyPressed
    	    else { 
                this.debugLog( "  has PATTERN="+pattern.text );
		this._idxChoice = -1;
                
    		// Popup with choices if pattern at least minPatLen letters long
	        if( pattern.text.length > (this._minPatLength-1) ) {
                    this.debugLog( "  find BEST" );
		    //this._findBestMatches( _allCommands, pattern.text );
                    this._findBestMatches( this._template.listCandidates(),
                                           pattern.text );
                    
                    // populate popupDiv
                    this._popNode.innerHTML = "";
    		    if (this._bestMatches.length > 0) {
			for( var i=0; i<this._bestMatches.length; i++) {
    			    this._popNode.appendChild( 
				itemHTML(this._bestMatches[i].str,
					 pattern.text));
    			}
			this._display( this._areaNode, this._popNode );
                    }
		    else { // no matches
			this._state = "PATTERN";
			this._undisplay( this._popNode );
		    }
		}
    	    } // no special key has been used
	} // have pattern
    } // PATTERN or SELECT
    
    // to ensure that one MUST add an input (through onInput())
    this._hasInput = false;
};

/**
 * Extract a Pattern from text, looking around position 'pos'
 * The Pattern is a String 
 * - starting BEFORE pos, but right after template.pat (or ' ' if not given)
 * - not closed BEFORE pos by template.end (or ' ' if not given)
 * - or closed at current pos
 * 
 * Params:
 * - test: String
 * - pos : index 
 *
 * Returns: {text,start,end} or undefined
 * - text: String of the Pattern found
 * - start: int, pos where full Pattern begins
 * - end; int, pos where full Pattern ends.
 */
var extractPattern = function( text, pos, template, verb ) {
    // Detect previous and next ' '=>STOP or ' '=>START
    var sPat = template.pat ? template.pat : ' ';
    var pos_prevOpen = text.lastIndexOf( sPat, pos );   // search backward
    var ePat = template.end ? template.end : ' ';
    var pos_prevClosed = text.lastIndexOf( ePat, pos ); // search bckward
    var pos_nextClosed = text.indexOf( ePat, pos );     // search forward

    if (verb) {
        console.log("__EXTRACT with startP="+sPat+" endP="+ePat );
        console.log("  prevOpen="+pos_prevOpen+" prevCloser="+pos_prevClosed+" nextClosed="+pos_nextClosed+" pos="+pos);
    }
    // if nextClosed is after pos, then consider it is pos.
    pos_nextClosed = (pos_nextClosed >= 0) ? pos_nextClosed : pos;
    
    if( (pos_prevOpen >= 0) &&                 // must be opened
	((pos_prevOpen > pos_prevClosed ) ||   // not closed yet
	 (pos_prevClosed === pos))) {          // closed at cursor
	if (verb) console.log("  => FOUND pat="+text.slice( pos_prevOpen+sPat.length, pos) );
	return {
            text: text.slice( pos_prevOpen+sPat.length, pos ),
	    start: pos_prevOpen,
	    end: pos_nextClosed
	};
    }
};
/**
 * Controls how list items are generated.
 * Function that takes two parameters :
 *  - text : suggestion text
 *  - input : the user’s input
 * Returns : list item. 
 * Generates list items with the user’s input highlighted via <mark>.
 */
var itemHTML = function (text, input ) {
    // text si input === ''
    // otherwise, build RegExp that is global (g) and case insensitive (i)
    // to replace with <mark>$&</mark> where "$&" is the matched pattern
    var html = input === '' ? text : text.replace(RegExp(regExpEscape(input.trim()), "gi"), "<mark>$&</mark>");
    return create("li", {
	innerHTML: html,
	"patt-selected": "false"
    });
};
/**
 * Insert text into a textarea node, 
 * enclosing in 'template.start..template.end'
 *
 * - posBefore : where the 'template.pat+pattern' starts
 * - posAfter : where the cursor currently is
 */
var insertInto = function(node, text, posBefore, posAfter, template ) {
    //DEBUG console.log( "__INSERT : "+template.pattern+":"+template.filter+":"+template.mask+":"+template.field+":"+template.start+":"+template.end );
    var val = node.value;
    var sStart = template.start !== undefined ? template.start : '[[';
    var sEnd = template.end !== undefined ? template.end : ']]';
    var newVal = val.slice(0, posBefore) + sStart + text + sEnd + val.slice(posAfter);
    //console.log("__INSERT s="+sStart+" e="+sEnd);
    //console.log ("__INSERT pb="+posBefore+" pa="+posAfter+" txt="+text);
    //console.log( "NEW VAL = "+newVal );
    // WARN : Directly modifie domNode.value.
    // Not sure it does not short-circuit other update methods of the domNode....
    // i.e. could use widget.updateEditor(newVal) from edit-comptext widget.
    //      but how to be sure that cursor is well positionned ?
    node.value = newVal;
    node.setSelectionRange(posBefore+text.length+sStart.length+sEnd.length, posBefore+text.length+sStart.length+sEnd.length );
};
// defined in utils.js
// /**
//  * Add an '\' in front of -\^$*+?.()|[]{}
//  */
// var regExpEscape = function (s) {
//     return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
// };
/**
 * Add an element in the DOM.
 */
var create = function(tag, o) {
    var element = document.createElement(tag);
    
    for (var i in o) {
	var val = o[i];
	
	if (i === "inside") {
	    $(val).appendChild(element);
	}
	else if (i === "around") {
	    var ref = $(val);
	    ref.parentNode.insertBefore(element, ref);
	    element.appendChild(ref);
	}
	else if (i in element) {
	    element[i] = val;
	}
	else {
	    element.setAttribute(i, val);
	}
    }
    
    return element;
};

// *****************************************************************************
// ****************************************************************** Vizualizer
// Visualizer
//COMP var _eventViewer = new EventViewer( NEventArray,
//COMP                                    document.getElementById( "viz_div" ) );
//COMP _eventViewer.build();
// *****************************************************************************

// *****************************************************************************
// ******************************************************************** NConsole
// - current_node : [null||NEvent] the Node of the graph we are in.
// - current_idx : (int) index of the NEvent we created/display
function NConsole ( input_textarea, context_div, output_div, popup_div ) {
    var self = this;
    this.input = input_textarea;
    this.input.value = "";
    this.context = context_div;
    this.output = output_div;
    this.popup = popup_div;
    this.completion = new Completion( this.input, this.popup, false /*verb*/ );
   
    console.log( "__CREATION in="+self.input );
    console.log( "          out="+self.output );
    
    // beware this.func will transfer because of this
    this.input.addEventListener( "keypress",
                                 function(event) { self.handleKeypress(event); });
    
    // this.input.addEventListener( "keydown",
    //                              function(event) { self.completion.handleKeydown(event); });
    this.input.addEventListener( "keydown",
                                 function(event) { self.handleKeydown(event); });
    
    this.input.addEventListener( "input",
                                 function(event) { self.handleInput(event); });
    this.input.addEventListener( "keyup",
                                 function(event) { self.handleKeyup(event); });
    

    this.updateContext();
    //this.completion.debug();
}

NConsole.prototype.handleKeypress = function(event) {
    // console.log( "__KeyPress ***********" );
    // console.log( "onEnter out="+this.output );
    // console.log( "      value="+this.output.innerHTML );
    // console.log( "       text="+this.input.value );
    this.completion.handleKeypress( event );
    this.completion.debug();
}
NConsole.prototype.handleKeydown = function( event ) {
    // console.log( "__KeyDown*************" );
    // Disable effect of ENTER and copy to output
    var key = event.keyCode;
    var element = event.target;

    var handled = this.completion.handleKeydown(event); 
    // console.log( "  handled="+handled );
    
    var caret = getCaretCoordinates( element, element.selectionEnd);
    document.getElementById( 'info_console' ).innerHTML = "caret at "+caret.left+" x "+caret.top;
    
    if ((key == 13) && (handled == false)) {
        console.log( "  ENTER" );
        event.preventDefault();
        //event.stopPropagation();
        
        // Parce cmdLine
        this.parseCmd( this.input.value );
        // copy input text to output
        this.output.innerHTML += "OUT: " + this.input.value + "ENTER/ ";
        this.input.value = "";
    }
    
    //this.completion.debug();
}
NConsole.prototype.handleInput = function( event ) {
    //console.log( "__Input **************" );
    // Something has been added/deleted
    this.completion.handleInput( event );

    //this.completion.debug();
}
NConsole.prototype.handleKeyup = function( event ) {
    //console.log( "__Up *****************" );
    this.completion.handleKeyup( event );
    //this.completion.debug();
}
NConsole.prototype.parseCmd = function( cmdLine ) {
    // parse all commands
    var processed = false;
    for(var i = 0; i < _cmdList.length; i++) {
        var cmd = _cmdList[i];
        if (cmdLine.indexOf( cmd.token ) == 0) {
            cmd.process( cmdLine,
                         _story,
                         this.output,
                         document.getElementById( "data"));
            processed = true;
            break;
        }
    }
    if (processed) {
        this.updateContext();
        return;
    }
    else {
        this.output.innerHTML += "!! unknown command !!";
    }
    
    // // :out => exit the current node
    // else if (cmdLine.indexOf( ":out" ) == 0) {
    //     this.current_node = null;
    // }
    // // :in => enter the current node
    // else if (cmdLine.indexOf( ":in" ) == 0) {
    //     this.current_node = NEventArray[this.current_idx];
    // }
    // this.updateContext();
}

NConsole.prototype.updateContext = function() {
    var ctx = "";
    if (_story.current_node == null) {
        ctx += "AT E["+_story.current_idx+"]";
    }
    else {
        ctx += "IN E["+_story.current_idx+"]«"+_story.current_node.label+"»";
        ctx += " "+_story.current_node.date.toString();
    }
    this.context.innerHTML = ctx;
}
// *****************************************************************************



// Neutralino
Neutralino.init({
    load: function() {
        console.log( "Loading" );
        //populateEvents();
        //COMP _eventViewer.build();
        var nConsole = new NConsole( document.getElementById( "input_textarea" ),
                                     document.getElementById( "input_context" ),
                                     document.getElementById( "output_console" ),
                                     document.getElementById( "completion_popup" ),
                                   );        
    },
    pingSuccessCallback : function() {
        var info_console = document.getElementById('info_console');
        info_console.innerHTML = "Success !";
    },
    pingFailCallback : function() {
        var info_console = document.getElementById('info_console');
        info_console.innerHTML = "Failure !";

    }
});
