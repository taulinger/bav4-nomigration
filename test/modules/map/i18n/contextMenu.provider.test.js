import { provide } from '../../../../src/modules/map/i18n/contextMenu.provider';


describe('i18n for context menue', () => {

	it('provides translation for en', () => {

		const map = provide('en');
		
		expect(map.map_contextMenu_header).toBe('Location');		
		expect(map.map_contextMenu_close_button).toBe('Close');		
	});


	it('provides translation for de', () => {

		const map = provide('de');

		expect(map.map_contextMenu_header).toBe('Position');		
		expect(map.map_contextMenu_close_button).toBe('Schließen');		
	});

	it('have the expected amount of translations', () => {
		const expectedSize = 2;
		const deMap = provide('de');
		const enMap = provide('en');

		const actualSize = (o) => Object.keys(o).length;

		expect(actualSize(deMap)).toBe(expectedSize);
		expect(actualSize(enMap)).toBe(expectedSize);										
	});

	it('provides an empty map for a unknown lang', () => {

		const map = provide('unknown');

		expect(map).toEqual({});
	});
});