import { combineReducers, createStore } from 'redux';
import { positionReducer, initialState as initialMapState, ZOOM_CHANGED, CENTER_CHANGED } from '../modules/map/store/position.reducer';
import { sidePanelReducer } from '../modules/menue/store/sidePanel.reducer';
import { modalReducer } from '../modules/modal/store/modal.reducer';
import { contextMenueReducer } from '../modules/contextMenue/store/contextMenue.reducer';
import { uiThemeReducer } from '../modules/uiTheme/store/uiTheme.reducer';
import { layersReducer } from '../modules/map/store/layers.reducer';
import { mapContextMenuReducer } from '../modules/map/store/mapContextMenu.reducer';
import ReduxQuerySync from 'redux-query-sync';
import { measurementReducer } from '../modules/map/store/measurement.reducer';
import { register as registerMeasurementObserver } from '../modules/map/store/measurement.observer';
import { register as registerGeolocationObserver } from '../modules/map/store/geolocation.observer';
import { register as registerLayersObserver } from '../modules/map/store/layers.observer';
import { geolocationReducer } from '../modules/map/store/geolocation.reducer';
import { pointerReducer } from '../modules/map/store/pointer.reducer';
import { mapReducer } from '../modules/map/store/map.reducer';
import { $injector } from '../injection';




/**
 * Service which configures, initializes and holds the redux store.
 * @class
 * @author aul
 */
export class StoreService {

	constructor() {

		const storeEnhancer = ReduxQuerySync.enhancer({
			params: {
				zoom: {
					selector: state => state.position.zoom,

					action: value => ({ type: ZOOM_CHANGED, payload: value }),

					/*
					 * Cast the parameter value to a number (we map invalid values to 1, which will then
					 * hide the parameter).
					 */
					stringToValue: (string) => Number.parseFloat(string) || initialMapState.zoom,

					// We then also specify the inverse function (this example one is the default)
					valueToString: value => `${value}`,

					/*
					 * When state.pageNumber equals 1, the parameter p is hidden (and vice versa).
					 * defaultValue: initialState.map.zoom,
					 */
					defaultValue: initialMapState.zoom,
				},
				center: {
					selector: state => state.position.center,
					action: value => ({ type: CENTER_CHANGED, payload: value }),

					//TODO: handler non parseable string
					stringToValue: (string) => string.split(',').map(Number.parseFloat),

					valueToString: value => {
						if (value) {
							return value.join(',');
						}
					},

					defaultValue: initialMapState.center,
				},
			},
			initialTruth: 'location',

		});

		const rootReducer = combineReducers({
			/*
			 * must be named like the field of the state
			 * see: https://redux.js.org/recipes/structuring-reducers/initializing-state#combined-reducers
			 */
			map: mapReducer,
			pointer: pointerReducer,
			position: positionReducer,
			sidePanel: sidePanelReducer,
			contextMenue: contextMenueReducer,
			modal: modalReducer,
			uiTheme: uiThemeReducer,
			layers: layersReducer,
			mapContextMenu: mapContextMenuReducer,
			measurement: measurementReducer,
			geolocation: geolocationReducer
		});

		this._store = createStore(rootReducer, storeEnhancer);

		$injector.onReady(() => {
			registerMeasurementObserver(this._store);
			registerGeolocationObserver(this._store);
			registerLayersObserver(this._store);
		});
	}

	/**
	 * Returns the fully initialized store.
	 */
	getStore() {
		return this._store;
	}
}
