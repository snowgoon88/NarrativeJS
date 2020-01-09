// Create NEventArray
//populateEvents();

// Components for React
class IDateComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value : displayDate(this.props.date),
            date : this.props.date
        };

        // need to bind as this 
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    // TODO: use state and make changeable

    handleChange( event ) {
        this.setState( {value : event.target.value} );
    }
    handleSubmit( event ) {
        console.log( "event.target", event.target.value );
        console.log( "state.value", this.state.value );
        
        var dateObj = parseDateStr( this.state.value );
        console.log( "Submit :",dateObj );
        if( dateObj === undefined ) {
            this.setState( {value : '?? not recognized ??' } );
        }
        else {
            var newDate = dateFromObj( dateObj );
            this.setState( {
                date : newDate,
                value : displayDate( newDate )
            });
        }
        event.preventDefault(); // do not change page with submit
    }
    render() {
        return (
                <form onSubmit={this.handleSubmit}>
                <label className="label">{this.props.label}:
                <input type="text" className="dateinput" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
                </form>
        );
    }
}
class DateField extends React.Component {
    constructor(props) {
        super( props );
        console.log( "__DF::build with ", this.props.date );
        this.state = {
            disabled_fg : true, 
            value : displayDate(this.props.date),
            date : this.props.date
        };

        // need to bind as this
        this.switchDisabled = this.switchDisabled.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    switchDisabled( event ) {
        this.setState( {disabled_fg : !this.state.disabled_fg} );
        console.log( "__DF::switchState ",this.state.disabled_fg );

        event.preventDefault(); // do not change page with submit
    }
    handleChange( event ) {
        this.setState( {value : event.target.value} );
    }
    handleSubmit( event ) {
        console.log( "__DateField::submit value="+this.state.value );
        
        event.preventDefault(); // do not change page with submit
    }

    render() {
        return (
                <div>
                <button onClick={this.switchDisabled}>DF : </button>
                <input type="text" size="25" value={this.state.value} onChange={this.handleChange} onSubmit={this.handleSubmit} disabled={(this.state.disabled_fg)? "disabled" : ""} />
                </div>
        );
    }
}
class NEventComp extends React.Component {
    constructor(props) {
        super(props);
        this.nevent = this.props.nevent;
    }
    render() {
        return (
                <div>
                <fieldset>
                <legend>NEvent</legend>
                <span className="label">Label: </span>
                <span className="field">{this.nevent.label}</span>
                <br/>
                <IDateComp label="start" date={this.nevent.date.start}/>
                <br/>
                <IDateComp label="end" date={this.nevent.date.end}/>
                </fieldset>
             </div>
        );
    }
}
//const element = <div><h3>Hello, world</h3><NEventComp nevent={NEventArray[0]}/></div>;
const element = <div><DateField /></div>;

Neutralino.init({
    load: () => {
        ReactDOM.render(
            element,
            document.getElementById('root'));
    },
    pingSuccessCallback : () => {
        console.log("ping success");
    },
    pingFailCallback : () => {
        console.log("ping fail");
    }
});
