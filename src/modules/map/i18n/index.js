
import { provide } from './map.provider';
import { layerManagerProvide } from './layerManager.provider';
import { layerItemProvide } from './layerItem.provider';
import { provide as contextMenueProvide } from './contextMenue.provider';
import { $injector } from '../../../injection';
const { TranslationService: translationService } = $injector.inject('TranslationService');
translationService.register('mapProvider', provide);
translationService.register('layerManagerProvider', layerManagerProvide);
translationService.register('layerItemProvider', layerItemProvide);
translationService.register('contextMenueProvider', contextMenueProvide);
