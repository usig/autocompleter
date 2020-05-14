import Suggester from './Suggester.js';
import 'isomorphic-fetch';

/**
 * @class SuggesterCatastro
 * Implementa un suggester de direcciones usando el Normalizador de Direcciones.<br/>
 * Requiere: jQuery-1.3.2+, jquery.class, usig.Suggester, Normalizador de Direcciones 1.4+, GeoCoder<br/>
 * @namespace usig
 * @cfg {Integer} maxSuggestions Maximo numero de sugerencias a devolver
 * @cfg {Integer} serverTimeout Tiempo maximo de espera (en ms) antes de abortar una busqueda en el servidor
 * @cfg {Integer} maxRetries Maximo numero de reintentos a realizar en caso de timeout
 * @cfg {Boolean} acceptSN Indica si debe permitir como altura S/N para las calles sin numeracion oficial. Por defecto es <code>True</code>. Ej: de los italianos s/n.
 * @cfg {Boolean} callesEnMinusculas Indica si se desea que los nombres de las calles normalizados sean en minúsculas (Por defecto: false)
 * @cfg {Boolean} ignorarTextoSobrante Indica si se desea ignorar el texto sobrante cuando se encuentra una direccion. Por ejemplo: Corrientes 1234 3ro D seria aceptado como Corrientes 1234 (Por defecto: true)
 * @cfg {Function} afterAbort Callback que es llamada cada vez que se aborta un pedido al servidor.
 * @cfg {Function} afterRetry Callback que es llamada cada vez que se reintenta un pedido al servidor.
 * @cfg {Function} afterServerRequest Callback que es llamada cada vez que se hace un pedido al servidor.
 * @cfg {Function} afterServerResponse Callback que es llamada cada vez que se recibe una respuesta del servidor.
 * @cfg {Function} onReady Callback que es llamada cuando el componente esta listo
 * @constructor
 * @param {Object} options (optional) Un objeto conteniendo overrides para las opciones disponibles
 */

const defaults = {
  serverTimeout: 30000,
  maxRetries: 1,
  maxSuggestions: 10
};

function mkRequest(data) {
  return fetch(`https://epok.buenosaires.gob.ar/catastro/smp/${data}`).then(resp => resp.json());
}

export default class SuggesterCatastro extends Suggester {
  constructor(name, options) {
    let opts = Object.assign({}, defaults, options);
    super(name, opts);
    this.lastRequest = null;
  }

  /**
   * Dado un string, realiza una busqueda de direcciones y llama al callback con las
   * opciones encontradas.
   * @param {String} text Texto de input
   * @param {Function} callback Funcion que es llamada con la lista de sugerencias
   * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
   */
  getSuggestions(text, callback, maxSuggestions) {
    let data = text.replace(/-/g, "/");
    this.lastRequest = mkRequest(data, defaults.server, {}).then(
      res => {
        const results = res.datos.map((d) => {
          if(data.split('/', 3)[2]){
            d.coordenadas = {
              x: parseFloat(d.centroide.split('(', 2)[1]),
              y: parseFloat(d.centroide.split(' ', 3)[2]),
              srid: 4326
            };
          }
          return {
            suggesterName: this.name,
            data: d
          };
        });
        callback(results, text, this.name);
      },
      (err) => callback(err, text, this.name)
    );
  }

  /**
   * Indica si el componente esta listo para realizar sugerencias
   * @return {Boolean} Verdadero si el componente se encuentra listo para responder sugerencias
   */
  ready() {
    return true;
  }

  /**
   * Actualiza la configuracion del componente a partir de un objeto con overrides para las
   * opciones disponibles
   * @param {Object} options Objeto conteniendo overrides para las opciones disponibles
   */
  setOptions(options) {
    this.options = Object.assign({}, this.options, options);
  }
}
