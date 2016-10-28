/**
 * Created by M. Yegorov on 2016-10-25.
 */

import React, {Component} from 'react';
import update from 'react-addons-update';
import classnames from 'classnames';

import osapi from 'jive/osapi';

import css from './JiveTilePlacePicker.css'

export default class JivePlaceSelector extends Component {

    constructor(props){
        super(props);

        const {value} = props;
        const isArray = props.value instanceof Array;

        this.state = {
            places: props.value ? (isArray ? value : (value.id > 0 ? [value] : [])) : [],
            multiple: isArray
        }
    }

    render() {

        const {places, multiple} = this.state;

        const mainClasses = classnames({
            [css.main]:true,
            multiple
        });

        return <div className={mainClasses}>
            <div className="selected-places">
                {places.map((place, i) =>
                    <div key={i}>
                        <span className="selected">
                            <span className="name">{place.name}</span>
                            <a className="remove" onClick={e => this.remove(e, i)}>&times;</a>
                        </span>
                    </div>
                )}
            </div>

            {(multiple || !places.length) && <button onClick={::this.callPicker}>
                {this.props.buttonTitle || 'Add place'}
            </button>}
        </div>
    }

    callPicker(e) {
        e.preventDefault();

        osapi.jive.corev3.search.requestPicker({
            excludeContent: true,
            excludePlaces: false,
            excludePeople: true,
            success: data => this.add(data),
            error: data => {
                console.error('error: ' + JSON.stringify(data));
            }
        });
    }

    add(place){
        
        const filterFields = this.props.filterFields || this.filterFields;
        
        const placeExists = this.state.places.findIndex(targetPlace => targetPlace.id == place.placeID) != -1;

        if (!placeExists){
            this.setState(update(this.state, {
                places: {$push: [filterFields(place)]}
            }), () => this.onChange())
        }
    }
    
    filterFields(place){
        const {placeID, name, resources} = place;
        
        return {
            name,
            id: placeID,
            uri: resources.self.ref
        }
    }

    remove(e, i) {
        e.preventDefault();

        this.setState(update(this.state, {
            places: {$splice: [[i,1]]}
        }), () => this.onChange())
    }

    onChange(){
        if (typeof this.props.onChange == 'function'){

            const {places, multiple} = this.state;

            let output;

            if (places.length){
                output = multiple ? places : places[0]
            } else {
                output = multiple ? [] : this.props.default || false
            }

            this.props.onChange(output)
        }
    }
}