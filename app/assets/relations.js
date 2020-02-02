// *****************************************************************************
// Relation and RelationTypes : using vis.DataSet
// *****************************************************************************
class RelationTypes {
    constructor() {
        this.types = new vis.DataSet();
        this.idTypes = 0;
    }
    /**
     * Need at least a label, different from others !
     */
    addType( name ) {
        let foundRel = this.findRelType( name );
        if (foundRel != null) {
            return false; // Cannot add existing element
        }
        else {
            let relType = {
                id: this.idTypes,
                name: name,
                // Vis Styling
                arrows: 'to',
                label: name,
                color: {
                    color : 'black'
                }
            };
            this.types.add( relType );
            this.idTypes += 1;
            return true;
        }
    }
    /**
     * Build a Relation as vis.Edge object
     */
    buildRelation( idFrom, idTo, relationType ) {
        // check Relation exists
        let relType = this.findRelType( relationType );
        if (relType == null ) {
            // relationType is not found
            return false;
        }
        let relation = {
            from: idFrom,
            to: idTo
        };
        // now add all other fields
        relation = Object.assign( relation, relType );
        delete relation.id;
        return relation;
    }
    findRelType( name ) {
        let foundRel = this.types.get( {
            filter: function (item) {
                return (item.name.localeCompare( name ) == 0 );
            }
        });

        if (foundRel.length == 1) {
            return foundRel[0];
        }
        else {
            return null;
        }
    }
}
