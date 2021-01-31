import { LayerItem } from '../../../../../src/modules/map/components/layerManager/LayerItem';
import { Toggle } from '../../../../../src/modules/commons/components/toggle/Toggle';
import { layersReducer, defaultLayerProperties } from '../../../../../src/modules/map/store/layers/layers.reducer';
import { TestUtils } from '../../../../test-utils';
import { $injector } from '../../../../../src/injection';


window.customElements.define(LayerItem.tag, LayerItem);
window.customElements.define(Toggle.tag, Toggle);



describe('LayerItem', () => {
	const createNewDataTransfer = () => {
		var data = {};
		return {
			clearData: function(key) {
				if (key === undefined) {
					data = {};
				}
				else {
					delete data[key];
				}
			},
			getData: function(key) {
				return data[key];
			},
			setData: function(key, value) {
				data[key] = value;
			},
			setDragImage: function() {},
			dropEffect: 'none',
			files: [],
			items: [],
			types: [],
			// also effectAllowed      
		};
	};

	describe('when layer item is rendered', () => {
		beforeEach(async () => {

			TestUtils.setupStoreAndDi({}, { layers: layersReducer });
			$injector.registerSingleton('TranslationService', {	 translate: (key) => key });
		});	
		it('displays label-property in label', async () => {
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, id:'id0', label:'label0' };
			const label = element.shadowRoot.querySelector('.layer-label');
			
			expect(label.innerText).toBe('label0');			
		});

		it('displays id-property when label is empty in label', async () => {
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, id:'id0', label:'' };
			const label = element.shadowRoot.querySelector('.layer-label');
			
			expect(label.innerText).toBe('id0');			
		});
        
		it('use layer.label property in toggle-title ', async () => {			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, label:'label0' };
			
			const toggle = element.shadowRoot.querySelector('ba-toggle');

			expect(toggle.title).toBe('label0 - layer_item_change_visibility');
		});

		it('use layer.opacity-property in slider ', async () => {
			const layer = { label:'id0', opacity:0.55 };
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = layer;
			
			const slider = element.shadowRoot.querySelector('.opacity-slider');
			expect(slider.value).toBe('55');
		});
        
		it('use layer.visible-property in toggle ', async () => {			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, label:'id0', visible:false };
			const toggle = element.shadowRoot.querySelector('ba-toggle');
		
			expect(toggle.checked).toBe(false);
		});
        
		it('use layer.collapsed-property in element style ', async () => {
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, label:'id0', visible:false, collapsed:false };
			
			const layerBody = element.shadowRoot.querySelector('.layer-body');
			const collapseButton = element.shadowRoot.querySelector('.collapse-button');

			
			expect(layerBody.classList.contains('expand')).toBeTrue();
			// expect(collapseButton.classList.contains('iconexpand')).toBeTrue();

			element.layer = { ...element.layer, collapsed:true };
			expect(layerBody.classList.contains('expand')).toBeFalse();
			expect(collapseButton.classList.contains('iconexpand')).toBeFalse();
		});
	
		it('slider-elements stops dragstart-event propagation ', async () => {
			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...element.layer, label:'id0', visible:false, collapsed:false };
			
			const slider = element.shadowRoot.querySelector('.opacity-slider');
			const sliderContainer = element.shadowRoot.querySelector('.slider-container');
			const dragstartContainerSpy = jasmine.createSpy();
			const dragstartSliderSpy = jasmine.createSpy();
			slider.addEventListener('dragstart', dragstartSliderSpy);
			sliderContainer.addEventListener('dragstart', dragstartContainerSpy);
			
			
			const dragstartEvt = document.createEvent('MouseEvents');
			dragstartEvt.initMouseEvent('dragstart', true, true, window, 1, 1, 1, 0, 0, false, false, false, false, 0, slider);
			dragstartEvt.dataTransfer = createNewDataTransfer();
			slider.dispatchEvent(dragstartEvt);

			
			expect(dragstartSliderSpy).toHaveBeenCalled();
			expect(dragstartContainerSpy).not.toHaveBeenCalled();
		});
	});

	describe('when user interacts with layer item', () => {
		let store;
		const layer0 = { ...defaultLayerProperties,
			id: 'id0', label: 'label0', visible: true, zIndex:0, opacity:1
		};
		const layer1 = { ...defaultLayerProperties,
			id: 'id1', label: 'label1', visible: true, zIndex:1, opacity:1
		};		
		const layer2 = { ...defaultLayerProperties,
			id: 'id2', label: 'label2', visible: true, zIndex:2, opacity:1
		};		

		beforeEach(async () => {	
			
			const state = {
				layers: {
					active: [layer0, layer1, layer2],
					background:'bg0'
				}
			};				
			store = TestUtils.setupStoreAndDi(state, { layers: layersReducer });
			$injector.registerSingleton('TranslationService', {	 translate: (key) => key });
		});	
		

		it('click on layer toggle change state in store', async() => {
			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0, collapsed:true };			

			const toggle = element.shadowRoot.querySelector('ba-toggle');          
			
			toggle.click();
			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.visible).toBeFalse();
		});

		it('click on opacity slider change state in store', async() => {
			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };			

			const slider = element.shadowRoot.querySelector('.opacity-slider');     
			slider.value = 66;
			slider.dispatchEvent(new Event('input'));

			const actualLayer = store.getState().layers.active[0];
			expect(actualLayer.opacity).toBe(0.66);
		});

		it('click on layer toggle change state in store', async() => {
			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0, collapsed:true };			

			const collapseButton = element.shadowRoot.querySelector('.collapse-button a');          
			collapseButton.click();			
			
			expect(element._layer.collapsed).toBeFalse();
		});

		it('click on increase-button change state in store', async() => {
			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };			
			
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const increaseButton = element.shadowRoot.querySelector('.increase');     
			increaseButton.click();
			
			expect(store.getState().layers.active[0].id).toBe('id1');
			expect(store.getState().layers.active[1].id).toBe('id0');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});

		it('click on decrease-button change state in store', async() => {
			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer2 };			
			
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('.decrease');     
			decreaseButton.click();
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id2');
			expect(store.getState().layers.active[2].id).toBe('id1');
		});

		it('click on decrease-button for first layer change not state in store', async() => {
			
			const element = await TestUtils.render(LayerItem.tag);
			element.layer = { ...layer0 };			
			
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
			const decreaseButton = element.shadowRoot.querySelector('.decrease');     
			decreaseButton.click();
			expect(store.getState().layers.active[0].id).toBe('id0');
			expect(store.getState().layers.active[1].id).toBe('id1');
			expect(store.getState().layers.active[2].id).toBe('id2');
		});
	});
});
