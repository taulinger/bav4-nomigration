/* eslint-disable no-undef */
import { GeoResourceTypes, GeoResource, WmsGeoResource, WMTSGeoResource, VectorGeoResource, VectorSourceType, AggregateGeoResource } from '../../../src/services/domain/geoResources';


describe('GeoResource', () => {

	describe('GeoResourceTypes', () => {

		it('provides an enum of all available types', () => {

			expect(GeoResourceTypes.WMS).toBeTruthy();
			expect(GeoResourceTypes.WMTS).toBeTruthy();
			expect(GeoResourceTypes.VECTOR).toBeTruthy();
			expect(GeoResourceTypes.VECTOR_TILES).toBeTruthy();
			expect(GeoResourceTypes.AGGREGATE).toBeTruthy();
		});
	});

	describe('abstract GeoResource', () => {

		class GeoResourceImpl extends GeoResource {
			constructor(id) {
				super(id);
			}
		}

		describe('constructor', () => {
			it('throws excepetion when instantiated without inheritance', () => {
				expect(() => new GeoResource()).toThrowError(TypeError, 'Can not construct abstract class.');
			});

			it('throws excepetion when instantiated without  id', () => {
				expect(() => new GeoResourceImpl()).toThrowError(TypeError, 'id must not be undefined');
			});
		});

		describe('methods', () => {
			it('throws excepetion when abstract #getType is called without overriding', () => {
				expect(() => new GeoResourceImpl('some').getType()).toThrowError(TypeError, 'Please implement abstract method #getType or do not call super.getType from child.');
			});
		});

		describe('properties', () => {
			it('provides default properties', () => {
				const georesource = new GeoResourceImpl('id');

				expect(georesource.label).toBe('');
				expect(georesource.background).toBeFalse();
				expect(georesource.opacity).toBe(1);
			});

			it('provides setter for properties', () => {
				const georesource = new GeoResourceImpl('id');

				georesource.opacity = .5;
				georesource.background = true;

				expect(georesource.background).toBeTrue();
				expect(georesource.opacity).toBe(.5);
			});
		});

	});

	describe('WmsGeoResource', () => {

		it('instantiates a WmsGeoResource', () => {

			const wmsGeoResource = new WmsGeoResource('id', 'label', 'url', 'layers', 'format');

			expect(wmsGeoResource.getType()).toEqual(GeoResourceTypes.WMS);
			expect(wmsGeoResource.id).toBe('id');
			expect(wmsGeoResource.label).toBe('label');
			expect(wmsGeoResource.url).toBe('url');
			expect(wmsGeoResource.layers).toBe('layers');
			expect(wmsGeoResource.format).toBe('format');
		});
	});

	describe('WmtsGeoResource', () => {

		it('instantiates a WmtsGeoResource', () => {

			const wmtsGeoResource = new WMTSGeoResource('id', 'label', 'url');

			expect(wmtsGeoResource.getType()).toEqual(GeoResourceTypes.WMTS);
			expect(wmtsGeoResource.id).toBe('id');
			expect(wmtsGeoResource.label).toBe('label');
			expect(wmtsGeoResource.url).toBe('url');
		});
	});

	it('provides an enum of all available vector source types', () => {

		expect(VectorSourceType.KML).toBeTruthy();
		expect(VectorSourceType.GPX).toBeTruthy();
		expect(VectorSourceType.GEOJSON).toBeTruthy();
	});


	describe('VectorGeoResource', () => {

		it('instantiates a VectorGeoResource', () => {

			const vectorGeoResource = new VectorGeoResource('id', 'label', 'url', VectorSourceType.KML);

			expect(vectorGeoResource.getType()).toEqual(GeoResourceTypes.VECTOR);
			expect(vectorGeoResource.id).toBe('id');
			expect(vectorGeoResource.label).toBe('label');
			expect(vectorGeoResource.url).toBe('url');
			expect(vectorGeoResource.sourceType).toEqual(VectorSourceType.KML);
		});


		it('sets data as the source of a VectorGeoResource', () => {
			
			const vectorGeoResource = new VectorGeoResource('id', 'label', 'url', VectorSourceType.KML);
			vectorGeoResource.source = 'someData';

			expect(vectorGeoResource.source).toBe('someData');
			expect(vectorGeoResource.url).toBeNull();
		});
	});

	describe('AggregateResource', () => {

		it('instantiates a AggregateResource', () => {
			
			const wmsGeoResource = new WmsGeoResource('wmsId', 'label', 'url', 'layers', 'format');
			const wmtsGeoResource = new WMTSGeoResource('wmtsId', 'label', 'url');
			
			const aggregateGeoResource = new AggregateGeoResource('id', 'label', [wmsGeoResource, wmtsGeoResource]);

			expect(aggregateGeoResource.getType()).toEqual(GeoResourceTypes.AGGREGATE);
			expect(aggregateGeoResource.geoResourceIds.length).toBe(2);
			expect(aggregateGeoResource.geoResourceIds[0].id).toBe('wmsId');
			expect(aggregateGeoResource.geoResourceIds[1].id).toBe('wmtsId');
		});

	});
});