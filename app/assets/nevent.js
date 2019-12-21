// Nevent and NEventArray, the base of a story
//
// "use strict";

// *****************************************************************************
// ********************************************************************** NEvent
function NEvent ( id, label, date, desc ) {
    this.id = id;
    this.label = label;
    this.date = date;
    this.desc = desc;
}
NEvent.prototype.fromJSON = function( jsonObj ) {
    this.id = parseInt( jsonObj.id );
    this.label = jsonObj.label;
    this.date = new IDate();
    this.date.fromJSON( jsonObj.date );
    this.desc = jsonObj.desc;
}
NEvent.prototype.toString = function() {
    var msg = "E[" + this.id.toString() + "] " + this.label;
    msg += " at "+this.date.displayDate( this.date.start );
    msg += "->"+this.date.displayDate( this.date.end );
    return msg;
}
// *****************************************************************************

// *****************************************************************************
// ***************************************************************** NEventArray
var NEventArray = new Array();
var populateFromJSON = function( jsonObj ) {
    NEventArray.length = 0; // clear array
    for( var ie=0; ie < jsonObj.length; ie++ ) {
        var newEvent = new NEvent();
        newEvent.fromJSON( jsonObj[ie] );
        NEventArray.push( newEvent );
    }
}
var addEvent = function( label, idate ) {
    var id = NEventArray.length;
    var event = new NEvent( id, label,
                            idate,
                            "--" );
    NEventArray.push( event );
    return event.id;
}
var listEvent = function() {
    var msg = "<h2>All Event</h2>";
    for (var i = 0; i < NEventArray.length; i++) {
        msg += NEventArray[i].toString() + "<br>";
    }
    return msg;
}
/** 
 * pattern is a regular expression
 * search is case sensitive
*/
function regsearchLabelInEventArray( evArray, pattern ) {
    // regexp search pattern, case sensitive
    var flagSearch = this._caseSensitive ? "" : "i" ;
    var regpat = RegExp( regExpEscape(pattern), flagSearch );

    var matches = [];
    for( var ie = 0; ie < evArray.length; ie++ ) {
        if (regpat.test( evArray[ie].label )) {
            matches.push( evArray[ie] );
        }
    }
    return matches;
};
/** 
 * search if the idate is contained in some NEvents
 */
function searchIDateInEventArray( evArray, idate ) {
    var matches = [];
    for( var ie = 0; ie < evArray.length; ie++ ) {
        var ev = evArray[ie];
        if (idate.overlaps( ev.date )) {
            matches.push( ev );
        }
    }

    return matches;
};
// *****************************************************************************
// ********************************************************************** NGraph
// *****************************************************************************
function NGraph( events ) {
    this.maxLevel = 0;
    this.maxEvents = new Array(); // Array if indices
    this.events = events;
    this.predMap = new Map();
    this.levelsArray = new Array();
    this.toGraph();// events );
    this.levelGraph();// this.predMap, this.events );
}
// ********************************************************************* toGraph
/** 
 * Try to add icandidate to the predecessors of icur,
 * possibly recursively add it to the predecessors of the predecessors.
 * Works even if a partial ordering of events.
 *
 * Return a list of altered indices.
 *
 * - icur : index of an NEvent of events
 * - icandidate : index of an NEvent of events
 * - verbose : default is false.
 */
NGraph.prototype.addToPred = function( icur, icandidate, verbose ) {
    var map = this.predMap;
    var events = this.events;
    var verb = verbose || false;
    if (verb) console.log( "__adding "+icandidate+" to "+icur+" ?" );

    var toAdd = true;
    var toRemove = new Set();
    var alteredNode = new Set();

    if (icandidate in map.get(icur)) {
        if (verb) console.log( "  !! already in" );
        return alteredNode;
    }
    
    // check all existing predecessors of icur
    for(var idp = 0; idp < map.get(icur).length; idp++) {
        var id_pred = map.get(icur)[idp];
        if (verb) console.log( "  cmp with "+id_pred );
        var cand = events[icandidate];
        
        // if existing pred precedes icandidate, add idp to pred of icandidate
        if (events[id_pred].date.isBefore( cand.date )) {
            if (verb )console.log( "  =>is in between" );
            var altered = this.addToPred( icandidate, id_pred, verb );
            if (verb) console.log( "  +altered="+this.setStr(altered) );
            if (verb) console.log( "  +alt    ="+this.setStr(alteredNode) );
            
            for( let item of altered.values() ) {
                if (verb) console.log( "    addset "+item+" to "+this.setStr(alteredNode) );
                alteredNode.add( item );
            }
            if (verb) console.log( "  ->alt="+this.setStr(alteredNode) );
            // and remove it from current predecessors
            toRemove.add( id_pred );
            //NO alteredNode.add( id_pred );
            if (verb) console.log( "  =alt="+this.setStr(alteredNode) );
        }
        if (events[id_pred].date.isAfter( cand.date )) {
            if (verb) console.log( "  =>has an intermediate" );  
            // no need to add it to immediate predecessors
            toAdd = false;
        }
    }
    if (toAdd == true) {
        if (verb) console.log( "  =>ADDING "+icandidate+" to "+icur );
        if (map.get(icur).includes( icandidate ) == false ) {
            map.get(icur).push( icandidate );
            alteredNode.add( icur );
            if (verb) console.log( "  =alt="+this.setStr( alteredNode ));
        }
    }
    // remove if needed
    for(var ir = 0; ir < toRemove.length; ir++) {
        if (verb) console.log( "  remove "+toRemove[ir] );
        var preds = map.get(icur);
        map.get(icur).splice( preds.indexOf( toRemove[ir] ), 1);
    }
    return alteredNode;
}
/** Dump to console a Map : id => Array of predecessors
 */
NGraph.prototype.dumpMap = function ( predmap ) {
    var map = predmap || this.predMap;
    for (var key of map.keys()) {
        var msg = key + " : ";
        for(var i = 0; i < map.get(key).length; i++) {
            msg += map.get(key)[i] + ", ";
        }
        console.log( msg );
    }
}
/** 
 * Compute a Map : id => Array of predecessors
 * from a NEventArray
 */
NGraph.prototype.toGraph = function( eventsArray ) {
    var events = eventsArray || this.events;
    // console.log( "__TO GRAPH" );
    // create Map : id => list of predecessors
    var predmap = this.predMap;
    for(var idn = 0; idn < events.length; idn++) {
        predmap.set( idn, new Array() );
    }
    // this.dumpMap();
    
    for(var ide = 0; ide < events.length; ide++) {
        var ev = events[ide];
        // console.log( "  check for "+ide );
        // check if predecessor
        for(var ipre = 0; ipre < events.length; ipre++) {
            if (ipre != ide) {
                var candidate = events[ipre];
                if (candidate.date.isBefore( ev.date )) {
                    this.addToPred( ide, ipre, false );
                }
            }
        }
        // console.log( "**PREDMAP**" );
        // this.dumpMap();
    }
    return predmap;
}
// ******************************************************************** toLevels
NGraph.prototype.dumpLevel = function ( levelArray ) {
    var la = levelArray || this.levelsArray;
    var msg = "";
    for(var i = 0; i < la.length; i++) {
        msg += i + " => " + la[i] + "; ";        
    }
    console.log( msg );
}
/** compute the level of a given idx */
NGraph.prototype.computeLevel = function( idx ) { 
    // console.log( "  compute level for "+idx );
    // dumpLevel( levelArray );
    // the level of a NEvent indexed by idx is 1 plus the max of the
    // level of its predecessor
    if (this.levelsArray[idx] != undefined) {
        // console.log( "  already in levelArray" );
        return this.levelsArray[idx];
    }
    var level = 0;
    var predecessors = this.predMap.get( idx );
    for(var i = 0; i < predecessors.length; i++) {
        var predlevel = this.computeLevel( predecessors[i] );
        if (predlevel > level) {
            level = predlevel;
        }
    }
    return level+1;
}
/**
 * Give a 'hierarchical level to NEvents using a kind of topological ordering,
 * following [Kahn62] algorithm.
 * https://en.wikipedia.org/wiki/Topological_sorting
 */
NGraph.prototype.levelGraph = function() {
    this.levelsArray = new Array( this.events.length );
    // Find all nodes without predecessors => set level to 0
    for (var key of this.predMap.keys()) {
        if (this.predMap.get(key).length == 0 ) {
            // console.log( "  set level " +key+"=0" );
            this.levelsArray[key] = 0;
        }
    }
    for(var ide = 0; ide < this.events.length; ide++) {
        this.updateLevel( ide );
    }
    return this.levelsArray;
}
/** 
 * Compute level and update maxLevel, maxEvents
 */
NGraph.prototype.updateLevel = function( nodeIndex ) {
    var ideLevel = this.computeLevel( nodeIndex );

    if (ideLevel > this.maxLevel ) {
        this.maxLevel = ideLevel;
        this.maxEvents = new Array();
        this.maxEvents.push( nodeIndex );
    }
    else if (ideLevel == this.maxLevel) {
        this.maxEvents.push( nodeIndex );
    }
    this.levelsArray[nodeIndex] = ideLevel;
}
// ***************************************************************** incremental
NGraph.prototype.setStr = function( set ) {
    var msg = "{";
    for (let item of set) {
        msg += item + ", ";
    }
    return msg+"}";
}
// ***************************************************************** incremental
NGraph.prototype.addNEvent = function( event ) {
    // add a new element in predMap
    this.predMap.set( event.id, new Array() );
    
    var added = false;
    var alteredNode = new Set();
    // try to add it to predecessors (recursif) of maxEvents nodes
    for(var idtop = 0; idtop < this.maxEvents.length; idtop++) {
        var maxNode = this.events[this.maxEvents[idtop]];
        if (event.date.isBefore( maxNode.date )) {
            added = true;
            console.log( "++add to maxEvent "+this.maxEvents[idtop] );
            var altered = this.addToPred( this.maxEvents[idtop],
                                          event.id,
                                          false );
            for( let item of altered ) alteredNode.add( item );
        }
    }
    // set level of altered to undefined and recompute levels
    for( let item of alteredNode ) {
        this.levelsArray[item] = undefined;
    }
    for( let item of alteredNode ) {
        this.updateLevel( item );
    }
    return alteredNode;
}
// *****************************************************************************

// *****************************************************************************
// *********************************************************************** Story
var _story = {
    current_node : null,
    current_idx  : 0
};
// *****************************************************************************

// *****************************************************************************
// *********************************************************** populate the base
function populateEvents() {
    var elist = [
        { lab: "zero",     ds: "1/1/10 00:00", de: "1/6/10 00:00" },
        { lab: "un",   ds: "1/2/10 00:00", de: "1/6/10 00:00" },
        { lab: "deux",  ds: "1/3/10 00:00", de: "1/8/10 00:00" },
        { lab: "trois", ds: "1/7/10 00:00", de: "1/10/10 00:00" },
        { lab: "quatre",   ds: "1/8/10 00:00", de: "1/11/10 00:00" },
        { lab: "cinq",   ds: "1/6/10 00:00", de: "1/7/10 00:00" }
    ];

    for(var i = 0; i < elist.length; i++) {
        // add NEvent
        _story.current_idx = addEvent(
            elist[i].lab,
            new IDate( dateFromObj( parseDateStr( elist[i].ds )),
                       dateFromObj( parseDateStr( elist[i].de )) )
            );
    }
    //_eventViewer.build();
}
// *****************************************************************************
