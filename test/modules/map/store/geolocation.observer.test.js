import { GeolocationHandler, GEOLOCATION_LAYER_ID, register } from '../../../../src/modules/map/store/geolocation.observer';
import { activate, deactivate, setTracking } from '../../../../src/modules/map/store/geolocation.action';
import { TestUtils } from '../../../test-utils.js';
import { layersReducer } from '../../../../src/modules/map/store/layers.reducer';
import { geolocationReducer } from '../../../../src/modules/map/store/geolocation.reducer';
import { $injector } from '../../../../src/injection';
import { positionReducer } from '../../../../src/modules/map/store/position.reducer';
import { pointerReducer } from '../../../../src/modules/map/store/pointer.reducer';
import { setBeingDragged } from '../../../../src/modules/map/store/pointer.action';


describe('geolocationObserver', () => {

	const windowMock = {
		navigator: {
			geolocation: {
				getCurrentPosition() { },
				watchPosition() { },
				clearWatch() { }
			}
		}
	};

	const coordinateServiceMock = {
		fromLonLat() { },
		transformExtent() { },
		buffer() { }
	};

	const mapServiceMock = {
		getDefaultGeodeticSrid() { },
		getSrid() { },
	};

	const setup = (state) => {

		const store = TestUtils.setupStoreAndDi(state, {
			pointer: pointerReducer,
			geolocation: geolocationReducer,
			layers: layersReducer,
			position: positionReducer
		});
		$injector
			.registerSingleton('EnvironmentService', { getWindow: () => windowMock })
			.registerSingleton('CoordinateService', coordinateServiceMock)
			.registerSingleton('MapService', mapServiceMock)
			.registerSingleton('TranslationService', { translate: (key) => key });

		return store;
	};

	describe('register', () => {

		it('activates and deactivates the geolocation handler', () => {
			const store = setup();

			const mockGeolocationHandler = jasmine.createSpyObj('GeolocationHandler', ['activate', 'deactivate']);
			register(store, mockGeolocationHandler);

			expect(mockGeolocationHandler.activate).not.toHaveBeenCalled();
			expect(mockGeolocationHandler.deactivate).not.toHaveBeenCalled();

			activate();

			expect(mockGeolocationHandler.activate).toHaveBeenCalledWith();
			expect(mockGeolocationHandler.deactivate).not.toHaveBeenCalled();

			deactivate();

			expect(mockGeolocationHandler.activate).toHaveBeenCalled();
			expect(mockGeolocationHandler.deactivate).toHaveBeenCalled();
		});

		it('adds and removes the geolocation layer', () => {
			const store = setup();
			const mockGeolocationHandler = jasmine.createSpyObj('GeolocationHandler', ['activate', 'deactivate']);
			register(store, mockGeolocationHandler);

			activate();

			expect(store.getState().layers.active.length).toBe(1);
			expect(store.getState().layers.active[0].id).toBe(GEOLOCATION_LAYER_ID);

			deactivate();

			expect(store.getState().layers.active.length).toBe(0);
		});

		it('registers an observer for beingDragged changes', () => {
			const store = setup();
			register(store);

			setTracking(true);
			activate();
			setBeingDragged(true);

			expect(store.getState().geolocation.tracking).toBeFalse();
		});
	});

	describe('GeolocationHandler', () => {

		describe('constructor', () => {

			it('initializes the handler', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);

				expect(instanceUnderTest._coordinateService).toBeDefined();
				expect(instanceUnderTest._environmentService).toBeDefined();
				expect(instanceUnderTest._translationService).toBeDefined();
				expect(instanceUnderTest._firstTimeActivatingGeolocation).toBeTrue();
				expect(instanceUnderTest._geolocationWatcherId).toBeNull();
				expect(instanceUnderTest._store).toEqual(store);
			});
		});

		describe('_transformPositionTo3857', () => {

			it('transforms a position to 3857', () => {
				const expectedCoord = [38, 57];
				const instanceUnderTest = new GeolocationHandler(setup());
				spyOn(coordinateServiceMock, 'fromLonLat').and.returnValue(expectedCoord);

				const transformedCoord = instanceUnderTest._transformPositionTo3857({ coords: { longitude: 43, latitude: 26 } });

				expect(transformedCoord).toEqual(expectedCoord);
			});
		});

		describe('_handlePositionError', () => {

			it('handles a PERMISSION_DENIED position error', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				spyOn(window, 'alert');
				const warnSpy = spyOn(console, 'warn');
				// code PERMISSION_DENIED
				const error = { code: 1, PERMISSION_DENIED: 1 };

				instanceUnderTest._handlePositionError(error);

				expect(store.getState().geolocation.denied).toBeTrue();
				expect(window.alert).toHaveBeenCalledWith('map_store_geolocation_denied');
				expect(warnSpy).toHaveBeenCalledWith('Geolocation activation failed', error);

			});

			it('handles other position errors', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				spyOn(window, 'alert');
				const warnSpy = spyOn(console, 'warn');
				// code PERMISSION_DENIED
				const error = { code: 2,  POSITION_UNAVAILABLE :2 };

				instanceUnderTest._handlePositionError(error);

				expect(window.alert).toHaveBeenCalledWith('map_store_geolocation_not_available');
				expect(warnSpy).toHaveBeenCalledWith('Geolocation activation failed', error);

			});
		});

		describe('_handlePositionAndUpdateStore', () => {

			it('handles a position update', () => {
				const expectedCoord = [38, 57];
				const expectedAccuracy = 42;
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				const position = { coords: { longitude: 43, latitude: 26, accuracy: expectedAccuracy } };
				spyOn(instanceUnderTest, '_transformPositionTo3857').withArgs(position).and.returnValue(expectedCoord);

				instanceUnderTest._handlePositionAndUpdateStore(position);

				expect(store.getState().geolocation.position).toEqual(expectedCoord);
				expect(store.getState().geolocation.accuracy).toBe(expectedAccuracy);
			});

			it('changes center when tracking is enabled', () => {
				const expectedCoord = [38, 57];
				const state = {
					geolocation: {
						tracking: true
					}
				};
				const store = setup(state);
				const instanceUnderTest = new GeolocationHandler(store);
				instanceUnderTest._firstTimeActivatingGeolocation = false;

				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				spyOn(instanceUnderTest, '_transformPositionTo3857').withArgs(position).and.returnValue(expectedCoord);

				instanceUnderTest._handlePositionAndUpdateStore(position);

				expect(store.getState().position.center).toEqual(expectedCoord);
			});

			it('places a fit request on first time after activation', () => {
				const state = {
					geolocation: {
						denied: true
					}
				};
				const store = setup(state);
				const instanceUnderTest = new GeolocationHandler(store);
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				spyOn(instanceUnderTest, '_transformPositionTo3857').withArgs(position).and.returnValue([38, 57]);

				instanceUnderTest._handlePositionAndUpdateStore(position);

				expect(store.getState().geolocation.denied).toBeFalse();
			});


			it('disables the denied flag', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				spyOn(instanceUnderTest, '_transformPositionTo3857').withArgs(position).and.returnValue([38, 57]);
				const fitSpy = spyOn(instanceUnderTest, '_fit');


				instanceUnderTest._handlePositionAndUpdateStore(position);

				expect(fitSpy).toHaveBeenCalledOnceWith(position);
			});
		});

		describe('_watchPosition', () => {


			it('watches position successfully ', (done) => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 42 } };
				const handlePositionAndUpdateStoreSpy = spyOn(instanceUnderTest, '_handlePositionAndUpdateStore');
				spyOn(window.navigator.geolocation, 'watchPosition').and.callFake(success => Promise.resolve(success(position)));

				instanceUnderTest._watchPosition(store.getState);

				setTimeout(() => {
					expect(handlePositionAndUpdateStoreSpy).toHaveBeenCalledOnceWith(position);
					done();

				});
			});

			it('watches position unsuccessfully ', (done) => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				const errorMessage = 'some error';
				const handlePositionErrorSpy = spyOn(instanceUnderTest, '_handlePositionError');
				spyOn(window.navigator.geolocation, 'watchPosition').and.callFake((success, error) => Promise.resolve(error(errorMessage)));

				instanceUnderTest._watchPosition(store.getState);

				setTimeout(() => {
					expect(handlePositionErrorSpy).toHaveBeenCalledOnceWith(errorMessage);
					done();
				});
			});
		});

		describe('_fit', () => {
			it('calculates an extent and updates the state', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				const mapSrid = 2100;
				const geodeticSrid = 4200;
				const geodeticExtent = [42, 10, 42, 10];
				const bufferedGeodeticExtent = [52, 0, 52, 0];
				const bufferedMapExtent = [11, 22, 33, 44];
				const position = { coords: { longitude: 43, latitude: 26, accuracy: 10 } };
				spyOn(mapServiceMock, 'getSrid').and.returnValue(mapSrid);
				spyOn(mapServiceMock, 'getDefaultGeodeticSrid').and.returnValue(geodeticSrid);
				spyOn(instanceUnderTest, '_transformPositionTo3857').and.returnValue([38, 57]);
				spyOn(coordinateServiceMock, 'transformExtent').and.callFake((extent, sourceSrid, targetSrid) => {
					return targetSrid === geodeticSrid ? geodeticExtent : bufferedMapExtent;
				});
				spyOn(coordinateServiceMock, 'buffer').withArgs([42, 10, 42, 10], 10).and.returnValue(bufferedGeodeticExtent);

				instanceUnderTest._fit(position);

				expect(store.getState().position.fitRequest.payload.extent).toEqual(bufferedMapExtent);
				expect(store.getState().position.fitRequest.payload.options.maxZoom).toEqual(16);
			});
		});


		describe('activate / deactivate', () => {

			it('activates the handler', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);

				const watchPositionSpy = spyOn(instanceUnderTest, '_watchPosition');

				instanceUnderTest.activate();

				expect(store.getState().geolocation.tracking).toBeTrue();
				expect(watchPositionSpy).toHaveBeenCalled();
			});

			it('deactivates the handler', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				instanceUnderTest._geolocationWatcherId = 42;
				instanceUnderTest._firstTimeActivatingGeolocation = false;
				const clearWatchSpy = spyOn(window.navigator.geolocation, 'clearWatch');

				instanceUnderTest.deactivate();

				expect(clearWatchSpy).toHaveBeenCalledOnceWith(42);
				// expect(instanceUnderTest._firstTimeActivatingGeolocation).toBeTrue();
			});

			it('calls deactivate on inactive handler', () => {
				const store = setup();
				const instanceUnderTest = new GeolocationHandler(store);
				const clearWatchSpy = spyOn(window.navigator.geolocation, 'clearWatch');

				instanceUnderTest.deactivate();

				expect(clearWatchSpy).not.toHaveBeenCalledOnceWith(42);
			});
		});
	});
});