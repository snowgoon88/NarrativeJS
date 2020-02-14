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
                personName : person.name,
                personSex : person.sex,
                personClan : person.clan
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
                    personName : person.name,
                    personSex : person.sex,
                    personClan : person.clan
                });
            }
        }                    
    }
    handleChange( keyName, value ) {
    }
    render() {
        return (
            <table>
            <tbody>
            <TextComp
            title="Name"
            keyName="personName"
            onValueChange={this.handleChange}
            value={this.state.personName}
            />
            <TextComp
            title="Sex"
            keyName="personSex"
            onValueChange={this.handleChange}
            value={this.state.personSex}
            />
            <TextComp
            title="Clan"
            keyName="personClan"
            onValueChange={this.handleChange}
            value={this.state.personClan}
            />
            </tbody>
            </table>
        );
    }        
}
