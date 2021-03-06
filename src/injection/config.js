import { $injector } from '.';
import { StoreService } from '../services/StoreService';
import { OlCoordinateService } from '../services/OlCoordinateService';
import { EnvironmentService } from '../services/EnvironmentService';
import { ProcessEnvConfigService } from '../services/ProcessEnvConfigService';
import { HttpService } from '../services/HttpService';
import { TranslationService } from '../services/TranslationService';
import { ShareService } from '../services/ShareService';
import { GeoResourceService } from '../services/GeoResourceService';
import { UrlService } from '../services/UrlService';
import { SearchResultProviderService } from '../modules/search/services/SearchResultProviderService';
import { MapService } from '../services/MapService';
import { mapModule } from '../modules/map/services';


$injector
	.register('HttpService', HttpService)
	.registerSingleton('ConfigService', new ProcessEnvConfigService())
	.registerSingleton('TranslationService', new TranslationService)
	.registerSingleton('CoordinateService', new OlCoordinateService())
	.registerSingleton('EnvironmentService', new EnvironmentService())
	.registerSingleton('MapService', new MapService())
	.registerSingleton('StoreService', new StoreService())
	.registerSingleton('GeoResourceService', new GeoResourceService())
	.registerSingleton('SearchResultProviderService', new SearchResultProviderService())
	.registerSingleton('ShareService', new ShareService())
	.register('UrlService', UrlService)
	.registerModule(mapModule)
	.ready();
	


export const init = true;
