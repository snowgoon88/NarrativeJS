// *****************************************************************************
// Story : a collection of people, event, relations, etc as VIS nodes and edges.
//
// Require : vis.js, node_person.js
// *****************************************************************************
//let colorFeminin  = 'rgba( 240, 168, 223, 1 )';
//let colorMasculin = 'rgba( 168, 203, 240, 1 )';

class Story {
    constructor() {
        this.nodes = new vis.DataSet( {} );
        this.edges = new vis.DataSet( {} );
        this.idNodes = 0;
    }

    /**
     * Add a Person, updating idNodes
     */
    addPerson( args ) {
        let person = new NodePerson( this.idNodes, args );
        this.nodes.add( person );
        this.idNodes += 1;
    }
    /**
     * Delete a Person, removing attached Relation/edges
     */
    delPerson( name ) {
        let delId = this.findPersonId( name );
        if (delId != null) {
            let idToDelete = this.edges.getIds( {
                filter : function(item) {
                    return (item.from == delId || item.to == delId);
                }
            });
            console.log( "Removing ", idToDelete );
            this.edges.remove( idToDelete );
            this.nodes.remove( delId );
        }
    }
    /**
     * Edit a Person, fieldsToChange have the new values of SOME of 
     * the Person fields.
     *
     * ex : editPerson( 'Gros', { name : 'Copain', sex : 'M' } );
     */
    editPerson( name, fieldsToChange ) {
        let personArgs = this.findPerson( name );
        let updatedPerson = new NodePerson( personArgs.id, personArgs );
        updatedPerson.edit( fieldsToChange );
        this.nodes.update( updatedPerson );
    }
    /**
     * Find the id of a Person using its name.
     *
     * Returns : number or null.
     */
    findPerson( name ) {
        let foundItem = this.nodes.get( {
            filter: function (item) {
                return (item.name.localeCompare( name ) == 0 );
            }
        });
        //console.log( "Find "+name+" = ",foundItem );

        if (foundItem.length == 1) {
            return foundItem[0];
        }
        else {
            return null;
        }
    }
    findPersonId( name ) {
        let foundItem = this.findPerson( name );
        if (foundItem != null) {
            return foundItem.id;
        }
        else {
            return null;
        }
    }
    addRelation( nameFrom, nameTo ) {
        let idFrom = this.findPersonId( nameFrom );
        let idTo = this.findPersonId( nameTo );
        if (idFrom != null && idTo != null) {
            this.edges.add( {
                from : idFrom,
                to : idTo,
                arrows : 'to',
                label : 'pousse'
            });
            console.log( "Edge "+idFrom+" -> "+idTo );
        }
        else {
            console.log( "Unknown id : "+idFrom+" -> "+idTo );
        }
    }

    debugListNodes() {
        this.nodes.forEach( function( item ) {
            console.log( "Node type=",typeof(item),item );
        });
    }
    debugListEdges() {
        this.edges.forEach( function( item ) {
            console.log( "Edge ",item );
        });
    }
}

