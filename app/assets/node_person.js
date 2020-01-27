// *****************************************************************************
// Node : a person in a story, compatible with vis.DataSet
// *****************************************************************************
let colorFeminin  = 'rgba( 240, 168, 223, 1 )';
let colorMasculin = 'rgba( 168, 203, 240, 1 )';
let colorNull = 'rgba( 0, 0, 0, 0 )';
let styleRules = {
    default : {
        shape : 'circularImage',
        borderWidth : 10,
        shapeProperties : {
            useBorderWithImage : true
        },
        image : 'Images/Mon/no_mon.png',
        color : {
                background : colorNull
        },
        font: { multi: true },
    },
    clan : {
        crab : {
            image : 'Images/Mon/Crab.png'
        },
        dragon : {
            image : 'Images/Mon/Dragon.png'
        },
        guepe : {
            image : 'Images/Mon/Wasp.png'
        },
        heron : {
            image : 'Images/Mon/Crane.png'
        },
        libellule : {
            image : 'Images/Mon/Dragonfly.png'
        },
        licorne : {
            image : 'Images/Mon/Unicorn.png'
        },
        lion : {
            image : 'Images/Mon/Lion.png'
        },
        mante : {
            image : 'Images/Mon/Mantis.png'
        },
        phoenix : {
            image : 'Images/Mon/Phoenix.png'
        },
        renard : {
            image : 'Images/Mon/Fox.png'
        },
        scorpion : {
            image : 'Images/Mon/Scorpion.png'
        },
    },
    sex : {
        M : {
            color : {
                border : colorMasculin,
                background : colorNull
            }
        },
        F : {
            color : {
                border : colorFeminin,
                background : colorNull
            }
        }
    }
}
            
        
        

class NodePerson {
    /**
     * Create a NodePerson with at minimum an id,
     * add label, sex => color if mentionned.
     * (This way, can be used to edit a DataSet)
     */
    constructor( id, args ) {
        this.id = id;
        // default values for attributs ?
        
        if (args['name']) {
            this.name = args.name;
            // Even if font.multi = true, HTML support is limited
            // only bold, italic, mono, &lt; and &amp;
            this.label = '<i>'+this.name+'</i>&amp;';
        }
        if (args['sex']) {
            this.sex = args.sex;
        }
        if (args['clan']) {
            this.clan = args.clan;
        }
        this.setDefaultStyle( styleRules );
        this.setStyle( styleRules );
    }
    
    /**
     * Add and update fields mentionned in fieldsToChange.
     * label, sex => color
     */
    edit( fieldsToChange ) {
        for (const [key, value] of Object.entries( fieldsToChange )) {
            if (key.localeCompare( 'name' ) == 0 ) {
                this.name = value;
                this.label = '<i>'+value+'</i><i class="fas fa-skull"></i>';
            }
            else if (key.localeCompare( 'sex' ) == 0 ) {
                this.sex = value;
            }
            else if (key.localeCompare( 'clan' ) == 0 ) {
                this.clan = value;
            }
        }
        this.setStyle( styleRules );
            
    }

    setDefaultStyle( styleOptions) {
        if ( 'default' in styleOptions ) {
            for (const [key, value] of Object.entries( styleOptions.default )) {
                this[key] = value;
            }
        }
    }
    setStyle( styleOptions ) {
        // check every rules excepts 'default'
        for (const [field, rule] of Object.entries( styleOptions )) {
            if (field != 'default' && field in this) {
                console.log( "Field ="+field+", applying  Rule" );
                for (const [value, effect] of Object.entries( styleOptions[field] )) {
                    if (this[field].localeCompare( value ) == 0 ) {
                        console.log( "Apply rule for "+value );
                        // effect is an object
                        for (const [keyCfg, valueCfg] of Object.entries( effect )) {
                            this[keyCfg] = valueCfg;
                            console.log( "Set "+keyCfg+"=",valueCfg );
                        }
                    }
                }
            }
        }
    }
}
