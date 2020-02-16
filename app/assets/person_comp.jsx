// React Component for NodePerson
//
//
class TextComp extends React.Component {
    constructor(props) {
        super( props );
        this.handleValueChange = this.handleValueChange.bind(this);
    }
    handleValueChange(e) {
        this.props.onValueChange( this.props.keyName, e.target.value );
    }
    render() {
        return (
            <tr>
                <td><label>{this.props.title} : </label></td>
                <td>
                    <input
                        type="text"
                        value={this.props.value}
                        onChange={this.handleValueChange}
                    />
                </td>
            </tr>
        );
    }
}
class PersonComp extends React.Component {
    constructor( props ) {
        super( props );

        const person = this.props.person;
        if (person != null) {
            this.state = {
                name : person.name,
                sex : person.sex,
                clan : person.clan
            }
        }
        else {
            this.state = {}
        }
        this.handleChange = this.handleChange.bind(this);
    }
    componentDidUpdate( prevProps ) {
        if (this.props.person !== prevProps.person ) {
            if (this.props.person != null) {
                const person = this.props.person;
                this.setState( {
                    name : person.name,
                    sex : person.sex,
                    clan : person.clan
                });
            }
        }                    
    }
    handleChange( keyName, value ) {
        const newState = {};
        newState[keyName] = value;
        story.editPerson( this.state.name, newState );
        this.setState( newState );
    }
    
    render() {
        return (
            <table>
            <tbody>
            <TextComp
            title="Name"
            keyName="name"
            onValueChange={this.handleChange}
            value={this.state.name}
            />
            <TextComp
            title="Sex"
            keyName="sex"
            onValueChange={this.handleChange}
            value={this.state.sex}
            />
            <TextComp
            title="Clan"
            keyName="clan"
            onValueChange={this.handleChange}
            value={this.state.clan}
            />
            </tbody>
            </table>
        );
    }        
}
