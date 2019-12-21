// Period of time made of 2 Date
//
// WARNING : use strict is not compatible with testing this 'module'
//           with the 'include' trick of ntest_idate.js
//           see https://stackoverflow.com/questions/5797852/in-node-js-how-do-i-include-functions-from-my-other-files


// *****************************************************************************
// ******************************************************************* parseDate
/**
 * From a [dd/][mm/]y+ [hh][Hh:]+[mim]
 * Returns:
 * - { dd=, mm=, yy=, hh=, min= } if parsed, components can be undefined
 * - undefined otherwise
 */
function parseDateStr( str ) {
    var day = undefined;
    var month = undefined;
    var year = undefined;
    var hours = undefined;
    var minutes = undefined;
    var res = 0;
    console.log( "__PARSE DATE STR {"+str+"}" );
    
    // starts with full dd/mm/yy
    var fullDatePat = /^\s*\d+\s*\/\s*\d+\s*\/\s*-?\s*\d+\s*/;
    var monthDatePat = /^\s*\d+\s*\/\s*-?\s*\d+\s*/;
    var yearPat = /^\s*-?\s*\d+\s*/;
    if (fullDatePat.test( str) == true ) {
        console.log( "  fullDate" );
        
        res = readNb( str );
        day = res.nb;
        str = res.str;
        str = str.replace( /\//, "" );
        console.log( " day="+day.toString()+" str="+str );
    }
    // then mm/yy
    if (monthDatePat.test( str ) == true ) {
        console.log( "  monthDate" );
        
        res = readNb( str );
        month = res.nb - 1;
        str = res.str;
        str = str.replace( /\//, "" );
        console.log( " month="+month.toString()+" str="+str );
    }
    // then yy
    if (yearPat.test( str ) == true ) {
        console.log( "  yearDate" );
        
        res = readNb( str );
        year = res.nb;
        str = res.str;
        console.log( " year="+year.toString()+" str="+str );
    }
    // no year => cannot go further and format unknown
    else {
        console.log( "!! unknown date format for "+str );
        return undefined;
    }
    
    // if no day, do not read hours
    if (day != undefined ) {
        // then hours hh[Hh:]mm
    
        var fullHoursPat = /^\s*\d+\s*[Hh:]+\s*\d+.*/;
        var hoursOnlyPat = /^\s*\d+\s*[Hh:]+.*/;
        var minutesPat = /^\s*\d+.*/;
        if (fullHoursPat.test( str ) == true ) {
            console.log( "  fullHours" );

            res = readNb( str );
            hours = res.nb;
            str = res.str;
            str = str.replace( /[Hh:]+/, "" );
            console.log( " hours="+hours.toString()+" str="+str );

            // and THEN read minutes
            if (minutesPat.test( str ) == true ) {
                console.log( "  minutes" );

                res = readNb( str );
                minutes = res.nb;
                str = res.str;
                str = str.replace( /\d+/, "" );
                console.log( " minutes="+minutes.toString()+" str="+str );
            }
        }
        else if (hoursOnlyPat.test( str ) == true ) {
            console.log( "  hoursOnly" );

            res = readNb( str );
            hours = res.nb;
            str = res.str;
            str = str.replace( /[Hh:]+/, "" );
            console.log( " hours="+hours.toString()+" str="+str );
        }
        else {
            console.log( "!! unknown hour format for "+str );
        }
    }

    return { dd : day, mm : month, yy : year, hh : hours, min : minutes };
}
// *****************************************************************************
function dateFromObj( dateObj ) {
    console.log( "__dateFromObj with "+dateObj.mm+"/"+dateObj.yy );
    var date = new Date( Date.UTC( dateObj.yy, dateObj.mm || 0,
                                   dateObj.dd || 1,
                                   dateObj.hh || 0, dateObj.min || 0) );
    date.setUTCFullYear( dateObj.yy);
    console.log( "  => "+date.toDateString() );
    return date;
}
// *****************************************************************************
function readNb( str ) {
    var nbPat = /\s*-?\s*\d+/;
    var res = nbPat.exec( str );
    var nb = parseInt( res );
    str = str.replace( /^\s*-?\s*\d+/, "" );
    return {nb:nb, str:str};
}

// *****************************************************************************
// *************************************************************** parseIDateStr
/** 
 * Allowed forms
 * - date
 * - date -> date
 * - date + duration
 */
function parseIDateStr( str ) {
    // look for 2 dates
    var allDates = str.split( '->' );
    if (allDates.length > 1) {
        var startDateObj = parseDateStr( allDates[0] );
        if (startDateObj == undefined ) {
            return undefined;
        }
        var startDate = dateFromObj( startDateObj );

        var endDateObj = parseDateStr( allDates[1] );
        if( endDateObj == undefined ) {
            return undefined;
        }
        var endDate = dateFromObj( endDateObj );
        return new IDate( startDate, endDate );
    }

    // look for duration
    if (allDates.length > 1) {
        console.log( "TODO: parseIDateStr with date +duration" );
        return undefined;
    }

    // then a single date
    var instantDateObj = parseDateStr( str );
    if (instantDateObj == undefined ) {
        return undefined;
    }
    var result = new IDate();
    result.setInstantObj( instantDateObj );
    return result;
}

// // TODO now in utils
// /** max padding is 10 !! */
// function pad(num, size) {
//     var s = "000000000" + num;
//     return s.substr(s.length-size);
// }
// *****************************************************************************

function IDate( start, end, status ) {
    console.log( "++Create with start="+start+"\tend="+end );
    this.start = start;
    this.end = end;
    this.status = status || "dynamic";
}
IDate.prototype.fromJSON = function( jsonObj ) {
    this.start = new Date( jsonObj.start );
    this.end = new Date( jsonObj.end );
    this.status = jsonObj.status ;
};

IDate.prototype.toString = function() {
    var msg = "IDate ";
    msg += " s="+this.start;
    msg += " e="+this.end;
    msg += " => "+this.status;
    msg += "\n s="+this.displayDate( this.start );
    msg += " e="+this.displayDate( this.end );


    return msg;
}
// IDate.prototype.displayDate = function( date ) {
//     var msg = "";
//     if (date) {
//         msg += pad( date.getUTCDate(), 2);
//         msg += "/"+pad( date.getUTCMonth()+1, 2);
//         msg += "/"+date.getUTCFullYear();
//         msg += " "+pad( date.getUTCHours(), 2)+":"+pad( date.getUTCMinutes(), 2);
//     }
//     else {
//         msg += "--";
//     }
//     return msg;
// }
// TODO a version is also in utils
IDate.prototype.displayDate = function( date ) {
    var msg = "";
    if (date) {
        msg += pad( date.getUTCDate(), 2);
        msg += "/"+pad( date.getUTCMonth()+1, 2);
        msg += "/"+date.getUTCFullYear();
        msg += " "+pad( date.getUTCHours(), 2)+":"+pad( date.getUTCMinutes(), 2);
    }
    else {
        msg += "--";
    }
    return msg;
}



/** monthIndex starts at 0 !!
*/
IDate.prototype.setInstant= function( year, monthIndex, day, hours, minutes) {
    // Using UTCDate is necessary for year before 100 (with only 2 digits)
    var mStart, mEnd;
    if (monthIndex == undefined) {
        this.start = new Date( Date.UTC(year,  0, 1, 0, 0) );
        this.end =   new Date( Date.UTC(year, 11,31,23,59) );
    }
    else if (day == undefined) {
        this.start = new Date( Date.UTC(year,  monthIndex, 1, 0, 0) );
        // end of month is day '0' of next month
        this.end =   new Date( Date.UTC(year, monthIndex+1,0,23,59) );
    }
    else if (hours == undefined) {
        this.start = new Date( Date.UTC(year,  monthIndex, day, 0, 0) );
        this.end =   new Date( Date.UTC(year, monthIndex, day, 23,59) );
    }
    else if (minutes == undefined) {
        this.start = new Date( Date.UTC(year,  monthIndex, day, hours, 0) );
        this.end =   new Date( Date.UTC(year, monthIndex, day, hours, 59) );
    }
    else {
        this.start = new Date( Date.UTC(year,  monthIndex, day, hours, minutes) );
        this.end =   new Date( Date.UTC(year, monthIndex, day, hours, minutes) );
    }
    this.start.setUTCFullYear(year);
    this.end.setUTCFullYear(year);
}
IDate.prototype.setInstantObj = function( dateObj ) {
    this.setInstant( dateObj.yy, dateObj.mm, dateObj.dd, dateObj.hh, dateObj.mm );
}

IDate.prototype.isBefore = function( other ) {
    return this.end <= other.start;
}
IDate.prototype.isAfter = function( other ) {
    return this.start >= other.end;
}
IDate.prototype.contains = function( other ) {
    return (this.start <= other.start ) &&
        (this.end >= other.end );
}
IDate.prototype.overlaps = function( other ) {
    return (!this.isBefore( other ) && !this.isAfter( other ));
}
//export IDate;

