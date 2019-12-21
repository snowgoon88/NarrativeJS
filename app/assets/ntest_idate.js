// test the 'date_intervale.js' module

// WARNING : use strict is not compatible with testing this 'module'
//           with the 'include' trick of ntest_idate.js
//           see https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files
// workaround to "include" a file in nodejs
var fs = require('fs');
// file is included here:
eval(fs.readFileSync( 'utils.js' )+'');
eval(fs.readFileSync( 'date_intervale.js' )+'');

function test_idate() {
console.log( "coucou" );
var d1 = new Date();
console.log( "d1=" + d1 );
var d2 = new Date( 2000, 1);
console.log( "d2="+d2 );
var d3 = new Date( 1403, 2, 2 );
console.log( "d3="+d3 );

var id1 = new IDate();
console.log( "id1="+id1 );
id1.setInstant( 2020 );
console.log( "2020 => id1="+id1 );

var id2 = new IDate();
id2.setInstant( 2020, 6);
console.log( "2020/07 => id2="+id1 );

var id3 = new IDate();
id3.setInstant( 2020, 1);
console.log( "2020/02 => id3="+id1 );

var id4 = new IDate();
id4.setInstant( 2020, 11);
console.log( "2020/12 => id4="+id1 );

console.log( "__COMPARE" );
console.log( "id1 < id2 = "+id1.isBefore( id2 ));
console.log( "id2 < id3 = "+id2.isBefore( id3 ));
console.log( "id2 > id3 = "+id2.isAfter( id3 ));

console.log( "__IN" );
console.log( "id1 in id2 = "+id2.contains( id1 ));
console.log( "id2 in id1 = "+id1.contains( id2 ));
console.log( "id1 in id1 = "+id1.contains( id1 ));

var id5 = new IDate();
id5.setInstant( 2020, 6, 13 );
console.log( "2020/7/13 id5="+id5 );
console.log( "id5 in id1 = "+id1.contains( id5 ));
console.log( "id5 in id2 = "+id2.contains( id5 ));
console.log( "id5 in id5 = "+id5.contains( id5 ));

var id6 = new IDate().setInstant( 2020, 6, 14 ); // marche pas !!!
console.log( "2020/7/14 id6="+id6 );

// TODO: test intersections
console.log( "__INTERSECTION" );
var d5 = new Date( 2020, 1, 15, 0, 0 );
var d6 = new Date( 2020, 2, 15, 23, 59 );
var id7 = new IDate( d5, d6 );
console.log( "d5="+d5+"\td6="+d6 );
console.log( "construct ="+id7 );
console.log( "id7 in id1 = "+id1.contains(id7));
console.log( "id7 in id3 = "+id3.contains(id7));
console.log( "id7 < id3 = "+id7.isBefore( id3 ));
console.log( "id7 > id3 = "+id7.isAfter( id3 ));
console.log( "id7 < id2 = "+id7.isBefore( id2 ));
console.log( "id7 > id2 = "+id7.isAfter( id2 ));
};

function test_parse( str ) {
    console.log( "TEST '"+str+"'" );
    var dateObj = parseDateStr( str );
    if (dateObj == undefined ) {
        console.log( "!! UNDEFINED" );
    }
    else {
        var date = dateFromObj( dateObj );
        console.log( "  date="+date.toString() );
    }
}

// Parse date
var dstr = [ "27/11/2019" ,
             "27 / 11/ 2019" ,
             "1/3/78" ,
             "1/3/-150" ,
             "3/101" ,
             "12/100" ,
             "15/113" ,
             "0" ,
           ];
// parse hours
var hstr = [ " 2h43" ,
             "2h43" ,
             "2H43" ,
             "2H43m" ,
             "02:43" ,
             "02h43" ,
             "2h 43" ,
             " 2h 43" ,
             " 2 h 43" ,
           ];

for(var i = 0; i < dstr.length; i++) {
    test_parse( dstr[i] );
    for(var j = 0; j < hstr.length; j++) {
        test_parse( dstr[i] + " " + hstr[j] );
    }
}

var startStr = "0010-02-01T00:00:00.000Z";
var endStr = "0010-06-01T00:00:00.000Z";

var sDate = new Date( startStr );
var eDate = new Date( endStr );
var newIDate = new IDate( sDate, eDate );
console.log( "From JSON = "+newIDate.toString() );

                          
var jsonObj = {
    "start":"0010-02-01T00:00:00.000Z",
    "end":"0010-06-01T00:00:00.000Z",
    "status":"dynamic"};
console.log( "start = "+jsonObj.start );
console.log( "['start'] = "+jsonObj['start'] );

var jsonIDate = new IDate();
jsonIDate.fromJSON( jsonObj );
console.log( "\nDirectJSON = "+jsonIDate.toString() );

    
