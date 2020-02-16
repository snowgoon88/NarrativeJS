// React Component for Story Relation
//
// Hypothesis : story variable is set !

// relation = {name (of RelationType), to, from}
class RelationComp extends React.Component {
    constructor( props ) {
        super( props );
        //console.log( "RelationComp CREATE with",this.props.relation );
        if (this.props.relation != null ) {
            this.state = { name: this.props.relation.name };
        }
        else {
            this.state = {};
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidUpdate(prevProps) {
        //console.log( "RelationComp UPDATE with ",this.props.relation );
        // Typical usage (don't forget to compare props):
        if (this.props.relation !== prevProps.relation) {
            //console.log( "  =>change state" );
            if (this.props.relation != null ) {
                this.setState( { name: this.props.relation.name });
            }
        }
    }

    handleChange( event ) {
        //console.log( "RelationComp CHANGE ",this.props.relation );
        this.setState( { name: event.target.value });
        // WARNING : changes to states are asynchronous.
        story.editRelation(
            this.props.relation.id,
            { name : event.target.value }
        );
    }
    
    render() {
        //console.log( "RelationComp story=",story );
        //console.log( "RelationComp relation=",this.props.relation );
        if (this.props.relation == null) {
            return (
                <div>
                    <div>Relation NOT SET</div>
                </div>
            );
        }
        const relType = this.state.name;
        //console.log( "RelationComp name=",relType );
      const fromName = story.nodes.get(this.props.relation.from).name;
      const toName = story.nodes.get(this.props.relation.to).name;
      
      // build a list of options
        const selectRelTypes = story.relationTypes.types.map( function(item) {
        return (
            <option
                key={item.id}
                value={item.name}>
                {item.name}
            </option>);
        });
    
    return (
        <div>
            <div>Relation {fromName} =&gt; {toName}</div>
            <table>
                <tbody>
                    <tr>
                        <td><label>Type : </label></td>
                        <td>
                            <select value={relType} onChange={this.handleChange}>
                                {selectRelTypes}
                            </select>
                        </td>
                    </tr>   
                </tbody>
            </table>
        </div>
    );
  }
}

