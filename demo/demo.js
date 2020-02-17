/**
 * Created by federuiz on 7/17/17.
 */
let Autocompleter = require('../lib/Autocompleter.js').Autocompleter;
let Suggester = require('../lib/Autocompleter.js').Suggester;
let callejero = require('../callejero.json');
class mySuggester extends Suggester {
  constructor(name, options) {
    super(name, options);
  }

  /**
   * Dado un string, realiza una busqueda de direcciones y llama al callback con las
   * opciones encontradas.
   * @param {String} text Texto de input
   * @param {Function} callback Funcion que es llamada con la lista de sugerencias
   * @param {Integer} maxSuggestions (optional) Maximo numero de sugerencias a devolver
   */
  getSuggestions(text, callback, maxSuggestions) {
    callback([{ title: 'sug1' }, { title: 'sug2' }], text, this.name);
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
    // this.options.geoCoder.setOptions(opts);
  }
}
let callback = results => {
  console.log('All suggesters are done');
  console.log(results);
};

let updateCallback = state => {
  // console.log (state);
};
let errorCallback = state => {
  console.log(state);
};
let messageCallback = state => {
  console.log(state);
};
let autocompleter = new Autocompleter({ onCompleteSuggestions: callback });
// let autocompleter = new Autocompleter({onBufferResults: callback}, {flushTimeout: 2000});
autocompleter.addSuggester('Direcciones', { inputPause: 400, callejero: callejero.callejero });
autocompleter.addSuggester('DireccionesAMBA', {});
// autocompleter.removeSuggester("DireccionesAMBA");
// autocompleter.removeSuggester("Lugares");
// autocompleter.updateSuggestions("fede");

setTimeout(() => {
  console.log('Listo despues de 2 segundos?: ' + autocompleter.isInitialized());
  autocompleter.updateSuggestions('fede 232323');
  setTimeout(() => {
    autocompleter.updateSuggestions('Pueyrredon, Honorio, Dr. Av. 1800');
    // autocompleter.updateSuggestions("libertador 300");
  }, 500);
}, 2000);
