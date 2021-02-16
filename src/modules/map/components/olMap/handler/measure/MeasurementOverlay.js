import { html } from 'lit-html';
import { BaElement } from '../../../../../BaElement';
import css from './measure.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { getAzimuth, getCoordinateAt, canShowAzimuthCircle, getGeometryLength } from './GeometryUtils';
import { Polygon } from 'ol/geom';

export const MeasurementOverlayTypes = {
	TEXT:'text',
	AREA:'area',
	DISTANCE:'distance',
	DISTANCE_PARTITION:'distance-partition',
	HELP:'help'
};
/**
 * Internal overlay content for measurements on map-components
 * 
 * Configurable Attributes:
 * 
 * Observed Attributes:
 * 
  * Configurable Properties:
 * - `type`
 * - `value` 
 * - `static`
 * - `geometry`
 *  
 * 
 * Observed Properties:
 * - `value` 
 * - `static`
 * - `geometry`
 * - `position`
 * 
 * @class
 * @author thiloSchlemmer
 */
export class MeasurementOverlay extends BaElement {

	constructor() {
		super();
		this._value = '';
		this._static = false;		
		this._type = MeasurementOverlayTypes.TEXT;
		this._contentFunction = () => '';
	}

	/**
	 * @override
	 */
	createView() {
		const content = this._contentFunction();

		const classes = {
			help: this._type === MeasurementOverlayTypes.HELP,
			area:this._type === MeasurementOverlayTypes.AREA,
			distance: this._type === MeasurementOverlayTypes.DISTANCE,
			partition: this._type === MeasurementOverlayTypes.DISTANCE_PARTITION,
			static: this._static && this._type !== MeasurementOverlayTypes.HELP,
			floating: !this._static && this._type !== MeasurementOverlayTypes.HELP
		};

		return html`
			<style>${css}</style>
			<div class='ba-overlay ${classMap(classes)}'>
				${content}
			</div>
		`;
	}

	_updatePosition() {
		switch (this._type) {
			case MeasurementOverlayTypes.AREA:				
				this._position = this.geometry.getInteriorPoint().getCoordinates().slice(0, -1);
				break;
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._position = getCoordinateAt(this.geometry, this._value);
				break;				
			case MeasurementOverlayTypes.DISTANCE:	
			case MeasurementOverlayTypes.HELP:				
			case MeasurementOverlayTypes.TEXT:				
			default:
				this._position = this.geometry.getLastCoordinate();
		}
	}

	_setContentFunctionBy(type) {
		switch (type) {
			case MeasurementOverlayTypes.AREA:
				this._contentFunction = () => {					
					if (this.geometry instanceof Polygon) {
						return this._getFormattedSquared(this.geometry.getArea());
					}
					return '';
				};
				break;
			case MeasurementOverlayTypes.DISTANCE:
				this._contentFunction = () => {
					const length = this._getFormatted(getGeometryLength(this.geometry));
					if (canShowAzimuthCircle(this.geometry)) {
						const azimuthValue = getAzimuth(this.geometry);
						const azimuth = azimuthValue ? azimuthValue.toFixed(2) : '-';
											
						return azimuth + '°/' + length;					
					}
					return length;					
				};
				break;
			case MeasurementOverlayTypes.DISTANCE_PARTITION:
				this._contentFunction = () => {
					const length = getGeometryLength(this.geometry);
					return this._getFormatted(length * this._value);
				};
				break;
			case MeasurementOverlayTypes.HELP:
			case MeasurementOverlayTypes.TEXT:
				this._contentFunction = () => this._value;
				break;
		}
	}

	_getFormatted(length) {		
		let output;
		if (length > 100) {
			output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
		}
		else {
			output = length !== 0 ? Math.round(length * 100) / 100 + ' ' + 'm' : '0 m';
		}
		return output;
	}	

	_getFormattedSquared(area) {		
		let output;
		if (area >= 1000000) {
			output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km²';
		}
		else if (area >= 10000) {
			output = Math.round((area / 10000) * 100) / 100 + ' ' + 'ha';
		}
		else {
			output = Math.round(area * 100) / 100 + ' ' + 'm²';
		}
		return output;
	}	

	static get tag() {
		return 'ba-measure-overlay';
	}	

	set value(val) {
		if (val !== this.value) {			
			this._value = val;
			this.render();
		}
	}

	get value() {
		return this._value;
	}

	set type(value) {
		if (value !== this.type) {
			this._type = value ;
			this._setContentFunctionBy(value);
			this.render();
		}
	}

	get type() {
		return this._type;
	}

	set static(value) {
		if (value !== this.static) {
			this._static = value;
			this.render();
		}
	}

	get static() {
		return this._static;
	}

	set geometry(value) {
		
		this._geometry = value;
		this._updatePosition();
		this.render();
		
	}

	get geometry() {
		return this._geometry;
	}

	get position() {
		return this._position;
	}
}