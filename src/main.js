import globalCss from './main.css';

//import global css
const style = document.createElement('style');
style.innerHTML = globalCss;
document.head.appendChild(style);

// eslint-disable-next-line no-unused-vars
import * as config from './injection/config';

// register modules
import './modules/header';
import './modules/footer';
import './modules/map';
import './modules/menue';
import './modules/commons';
import './modules/search';
import './modules/contextMenue';
import './modules/utils';
import './modules/iframe';
import './modules/uiTheme';
import './modules/modal';

