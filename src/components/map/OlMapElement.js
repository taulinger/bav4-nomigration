import { html } from 'lit-html';
import BaElement from '../BaElement';
import 'ol/ol.css';
import './olMapElement.css';
import { Map, View } from 'ol';
import TileLayer from "ol/layer/Tile";
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import { changeZoomAndPosition, updatePointerPosition } from '../../store/map/MapActions';



/**
 * Element which renders the ol map.
 * @class
 * @author aul
 */
export class OlMapElement extends BaElement {


    constructor() {
        super();
        //if we want Shadow DOM
        // this.root = this.attachShadow({ mode: "open" });
    }


    /**
    * @override
    */
    createView() {
        return html`<div id="ol-map"></div>`;
    }

    /**
    * @override
    */
    initialize() {

        const { zoom, position } = this.state;


        this.view = new View({
            center: position,
            zoom: zoom,
        });

        this.map = new Map({
            layers: [
                new TileLayer({
                    source: new OSM(),
                })],
            // target: 'ol-map',
            view: this.view,
            controls: defaultControls({
                // attribution: false,
                zoom: false,
            }),
        });

        this.map.on('moveend', () => {
            if (this.view) {
                this.log('updating store');

                changeZoomAndPosition({
                    zoom: this.view.getZoom(),
                    position: this.view.getCenter()

                });
            }
        });


        this.map.on('pointermove', (evt) => {
            if (evt.dragging) {
                // the event is a drag gesture, this is handled by openlayers (map move)
                return;
            }
            const coord = this.map.getEventCoordinate(evt.originalEvent);
            updatePointerPosition(coord);
        });


        this.map.on('singleclick', (evt) => {
            const coord = this.map.getEventCoordinate(evt.originalEvent);
            this.emitEvent('map_clicked', coord);
        });

        //if we want Shadow DOM
        // this.map.setTarget(this.root.firstElementChild); 
    }

    /**
    * @override
    */
    onDisconnect() {
        this.map = null;
        this.view = null;
    }

    /**
     * @override
     * @param {Object} store 
     */
    extractState(store) {
        const { map: { zoom, position } } = store;
        return { zoom, position };
    }

    /**
    * @override
    */
    onStateChanged() {
        const { zoom, position } = this.state;

        this.log("map state changed by store");


        this.view.animate({
            zoom: zoom,
            center: position,
            duration: 500
        });

    }

    /**
     * @override
     */
    onAfterRender() {
        this.map.setTarget('ol-map');
    }

    /**
     * @override
     */
    static get tag() {
        return 'ba-ol-map';
    }

    //if we want Shadow DOM
    // getRenderTarget(){
    //     return this.root;
    // }

}