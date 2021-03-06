import { html } from 'lit-html';
import { BaElement } from '../../../BaElement';
import { $injector } from '../../../../injection';
import css from './geolocationButton.css';
import { classMap } from 'lit-html/directives/class-map.js';
import { activate, deactivate } from '../../store/geolocation.action';

/**
 * Button that activates-deactivates geolocation
 * @class 
 * @author thiloSchlemmer 
 */

export class GeolocationButton extends BaElement {

	constructor() {
		super();
		const { TranslationService } = $injector.inject('TranslationService');
		this._translationService = TranslationService;
	}

	/**
	 *@override 
	 */
	createView() {
		const { active, denied } = this._state;
		const translate = (key) => this._translationService.translate(key);
		const onClick = () => {
			if (active) {
				deactivate();
			}
			else {
				activate();
			}			
		};

		let title = translate('map_geolocationButton_title_activate');
		if (active) {
			title = translate('map_geolocationButton_title_deactivate');
		}
		else if (denied) {
			title = translate('map_geolocationButton_title_denied');
		}

		const classes = {
			inactive:!active,
			active: active,
			denied: denied,
		};
		return html`
		<style>${css}</style> 
		<div class='geolocation'>
			<button class='geolocation-button' @click=${onClick} title=${title} >
			<i class="icon geolocation-icon ${classMap(classes)}"></i></button>
		</div>
		`;
	}

	extractState(store) {
		const { geolocation: { active, denied } } = store;
		return { active, denied };
	}


	static get tag() {
		return 'ba-geolocation-button';
	}
} 