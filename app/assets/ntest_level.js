// test function to assign a level to NEvents using the partial
// order of IDate

// WARNING : use strict is not compatible with testing this 'module'
//           with the 'include' trick of ntest_idate.js
//           see https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// workaround to "include" a file in nodejs
var fs = require('fs');
// file is included here:
eval(fs.readFileSync( 'date_intervale.js' )+'');
eval(fs.readFileSync( 'nevent.js' )+'');

// *****************************************************************************
// ******************************************************************* dump story
function dumpEvents( events ) {
    for(var i = 0; i < events.length; i++) {
        console.log( events[i].toString() );
    }
}
function listEventStr( events ) {
    var msg = "E = ";
    for(var i = 0; i < events.length; i++) {
        msg += events[i].id + ", ";
    }
    return msg;
}
// *****************************************************************************

// *****************************************************************************
// look for NEvent without predecessors
function rootLevel( events ) {
    var leftEvents = events.slice();
    console.log( "  __ROOT" );
    console.log( " *leftEvents "+listEventStr( leftEvents));
    var roots = new Array();
    var others = new Array();
    while( leftEvents.length > 0 ) {
        // pop; compare to others and classify.
        var tail = leftEvents.pop();
        console.log( "__TAIL = "+tail.id );
        var hasPred = false;
        for(var i = 0; i < leftEvents.length; i++) {
            if (leftEvents[i].date.isBefore( tail.date )) {
                console.log( "  pred by "+leftEvents[i].id );
                others.push( tail );
                hasPred = true;
                break;
            }
        }
        if (hasPred == false) {
            console.log( "  NO pred -> to roots" );
            roots.push( tail );
        }
        console.log( " *leftEvents "+listEventStr( leftEvents));
        console.log( " *roots      "+listEventStr( roots ));
        console.log( " *others      "+listEventStr( others ));
    }
    console.log( " *leftEvents "+listEventStr( leftEvents));
    return roots;
}
// *****************************************************************************

populateEvents();
console.log( "__NEvent_Array" );
dumpEvents( NEventArray );

// var lev0 = rootLevel( NEventArray );
// console.log( "__LEVEL 0" );
// dumpEvents( lev0 );

var levelGraph = new NGraph( NEventArray );
console.log( "__LEVELS" );
levelGraph.dumpLevel();
console.log( "maxEvents="+levelGraph.maxEvents );

console.log( "__Before adding" );
levelGraph.dumpMap();
// add a new event
_story.current_idx = addEvent(
    "54",
    new IDate( dateFromObj( parseDateStr( "15/7/10 00:00" )),
               dateFromObj( parseDateStr( "25/7/10 00:00" )) )
);
console.log( "__NEW Nevent 54 add at idx="+_story.current_idx );
dumpEvents( NEventArray );
var altered = levelGraph.addNEvent( NEventArray[_story.current_idx] );
console.log( "__After adding" );
levelGraph.dumpMap();
console.log( "__Altered" );
console.log( altered );
console.log( "__LEVELS" );
levelGraph.dumpLevel();
console.log( "maxEvents="+levelGraph.maxEvents );
