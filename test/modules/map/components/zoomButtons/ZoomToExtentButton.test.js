/* eslint-disable no-undef */

import { positionReducer } from '../../../../../src/modules/map/store/position.reducer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
import { fromLonLat } from 'ol/proj';
import { ZoomToExtentButton } from '../../../../../src/modules/map/components/zoomButtons/ZoomToExtentButton';

window.customElements.define(ZoomToExtentButton.tag, ZoomToExtentButton);


describe('ExtentButton', () => {
	let element, store;
	const extent = [995772.9694449581, 5982715.763684852, 1548341.2904285304, 6544564.28740462];

	beforeEach(async () => {

		const state = {
			position: {
				zoom: 14,
				center: fromLonLat([9.604, 50.015]), 
				fitRequest: null
			}
		};

		store = TestUtils.setupStoreAndDi(state, { position: positionReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });
		$injector
			.registerSingleton('MapService', { getDefaultMapExtent: () => {
				return extent;			 
			} });

		element = await TestUtils.render(ZoomToExtentButton.tag);
	});

	describe('when initialized', () => {
		it('shows zoom to extent button', () => {
			expect(element.shadowRoot.querySelector('.zoom-to-extent')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.zoom-to-extent-button').title).toBe('map_zoom_extent_button');
			expect(element.shadowRoot.querySelector('.icon')).toBeTruthy();	
		});
	});

	describe('when clicked', () => {

		it('zooms to extent', () => {
			element.shadowRoot.querySelector('button').click();
			expect(store.getState().position.fitRequest.extent).toEqual(extent); 
		});
	});
});
