/* eslint-disable no-undef */

import { ZoomButtons } from '../../../../../src/modules/map/components/zoomButtons/ZoomButtons';
import { mapReducer } from '../../../../../src/modules/map/store/olMap.reducer';
import { TestUtils } from '../../../../test-utils.js';
import { $injector } from '../../../../../src/injection';
window.customElements.define(ZoomButtons.tag, ZoomButtons);

let store;

describe('ZoomButtons', () => {
	let element;

	beforeEach(async () => {

		const state = {
			map: {
				zoom: 10
			}
		};

		store = TestUtils.setupStoreAndDi(state, { map: mapReducer });
		$injector
			.registerSingleton('TranslationService', { translate: (key) => key });

		element = await TestUtils.render(ZoomButtons.tag);
	});

	describe('when initialized', () => {
		it('adds a div which shows two zoom buttons', async () => {

			expect(element.shadowRoot.querySelector('.zoom-in')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.zoom-in').parentElement.title).toBe('map_zoom_in_button');			
			expect(element.shadowRoot.querySelector('.zoom-out')).toBeTruthy();
			expect(element.shadowRoot.querySelector('.zoom-out').parentElement.title).toBe('map_zoom_out_button');			
		});
	});

	describe('when clicked', () => {

		it('decreases the current zoom level by one', () => {

			element.shadowRoot.querySelector('.zoom-out').click();
			expect(store.getState().map.zoom).toBe(9);

		});

		it('increases the current zoom level by one', () => {

			element.shadowRoot.querySelector('.zoom-in').click();
			expect(store.getState().map.zoom).toBe(11);

		});
	});
});