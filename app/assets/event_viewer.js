// Viewer for NEventArray using vis Graph
//

// *****************************************************************************
// *****************************************************************************

function windowSize() {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return {w : x, h : y };
}
// *****************************************************************************

function EventViewer ( model, container ) {
    this.model = model;
    this.container = container;
}

EventViewer.prototype.setLabel = function( node ) {
    var label = node.label;
    label += "\n"+node.date.displayDate( node.date.start );
    label += "\n"+node.date.displayDate( node.date.end );
    return label;
}

/**
 * Give a level to NEvent (for hierarchical layout)
 * Create an edge between adjacent NEvents if one isBefore the other.
 */
EventViewer.prototype.build = function() {
    // preprocess model -> Graph with level
    var predMap = toGraph( this.model );
    var levelsArray = levelGraph( predMap, this.model );
    
    this.nodes = new vis.DataSet();
    // add NEvent with a level
    for (var i = 0; i < this.model.length; i++) {
        this.nodes.add( {id:     this.model[i].id,
                         label:  this.setLabel(this.model[i]),
                         shape : "box",
                         level : levelsArray[this.model[i].id]
                        } );
    }

    this.edges = new vis.DataSet();
    // edges for every predecessors
    for (var key of predMap.keys()) {
        var predecessors = predMap.get(key);
        // loop through predecessors
        for(var i = 0; i < predecessors.length; i++) {
            this.edges.add( {
                from : predecessors[i],
                to : key,
                arrows : 'middle'
            } );
        }
    }
        
    this.data = {
        nodes: this.nodes,
        edges: this.edges
    };
    var size = windowSize();
    this.options = {
        autoResize: true,
        height: ""+size.h+"px",
        width: '100%',
        clickToUse: false,
        layout: {
            hierarchical: {
                direction: "UD"
            }
        }
    };
    this.network = new vis.Network( this.container, this.data, this.options );
    var size = windowSize();
    this.network.setSize( "100%", toString(size.h) + "px" );
    console.log( "size ={"+size.w+", "+size.h+"}" );
    this.network.redraw();
}
EventViewer.prototype.update = function( upEvent ) {
    if (upEvent.type == "add" ) {
        this.nodes.add( {id: this.model[upEvent.id].id,
                         label: this.setLabel( this.model[upEvent.id] ),
                         shape: "box" 
                         } );
    }
    var size = windowSize();
    this.network.setSize( "100%", toString(size.h) + "px" );
    this.network.redraw();
}
