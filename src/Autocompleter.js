import SuggesterDirecciones from 'suggesters/SuggesterDirecciones.js';
import SuggesterLugares from 'suggesters/SuggesterLugares.js';
import SuggesterDireccionesAMBA from 'suggesters/SuggesterDireccionesAMBA.js';
import SuggesterDeficitHabitacional from 'suggesters/SuggesterDeficitHabitacional.js';
import SuggesterCatastro from 'suggesters/SuggesterCatastro.js';
import { DONE, PENDING, INPUT_WAIT } from 'constants.js';
import Suggester from 'suggesters/Suggester.js';
import { Direccion } from '@usig-gcba/normalizador';
const defaults = {
  // Opciones para los suggesters
  inputPause: 200,
  maxSuggestions: 10,
  serverTimeout: 30000,
  minTextLength: 3,
  maxRetries: 1,
  flushTimeout: 0,
  // Opciones generales
  suggesters: [
    {
      name: 'Direcciones',
      options: { inputPause: 300, minTextLength: 3 },
      class: SuggesterDirecciones
    },
    {
      name: 'Lugares',
      options: { inputPause: 500, minTextLength: 3 },
      class: SuggesterLugares
    },
    {
      name: 'DireccionesAMBA',
      options: { inputPause: 500, minTextLength: 3 },
      class: SuggesterDireccionesAMBA
    },
    {
      name: 'DeficitHabitacional',
      options: { inputPause: 500, minTextLength: 3 },
      class: SuggesterDeficitHabitacional
    },
    {
      name: 'Catastro',
      options: { inputPause: 500, minTextLength: 3 },
      class: SuggesterCatastro
    }
  ],
  debug: false,
  texts: {
    nothingFound: 'No se hallaron resultados coincidentes con su b&uacute;squeda.'
  }
};

function emptyCallback() {
  if (this.options.debug) console.log('Callback not implemented');
}

/*
 * Aborta las llamadas asincronicas a servidores realizadas por los suggesters
 * y las llamadas pendientes
 */
function abort() {
  this.suggesters.forEach(suggester => {
    if (suggester.inputTimer) {
      if (this.options.debug) console.log('aborting suggester ' + suggester.name);
      clearTimeout(suggester.inputTimer);
      suggester.status = DONE;
    }
  });
}
/*
 * Ejecuta el metodo getSuggestion de sugObj.suggester
 * @param {Object} sugObj Objeto con el suggester y las opciones.
 * @param {Strin} str Texto a buscar
 */
function suggest(sugObj, str) {
  let suggester = sugObj;
  let sugOpts = sugObj.options;
  onServerRequest.bind(this)(suggester.name);
  if (this.options.debug)
    console.log('Starting suggestions fetch. Suggesters ready?: ' + this.isInitialized());

  suggester.getSuggestions(str, suggestCallback.bind(this), sugOpts.maxSuggestions);
}

function suggestCallback(results, inputStr, suggesterName) {
  if (this.currentText === inputStr) {
    if (results.getError !== undefined) {
      this.onError(results.getError() ? results.getError() : results.message);
    } else {
      if (results.length === 0) {
        //send message
        this.onMessage({
          message: 'No results found',
          suggester: suggesterName
        });
      } else if (results instanceof Array) {
        // We only want the maximum amount of suggestions set in the options
        this.suggestions = this.suggestions.concat(results).slice(0, this.options.maxSuggestions);

        if (this.options.flushTimeout > 0) {
          this.bufferResults(results, this.appendResults);
        } else {
          // callBack devolviendo los resultados
          this.onSuggestions(this.suggestions, this.appendResults);
        }
        this.appendResults = true;
      }
    }
  } else {
    //Respuesta a destiempo
  }
  onServerResponse.bind(this)(suggesterName);
  checkForCompleteSuggestions.bind(this)();
}
//Check if all the suggesters are in done state
function checkForCompleteSuggestions() {
  if (this.suggesters.filter(s => s.status === DONE).length === this.suggesters.length)
    this.onCompleteSuggestions(this.suggestions, this.appendResults);
}

/*
 * Callback del evento afterAbort de los suggesters.
 */
function onAbort(suggesterName) {
  if (this.pendingRequests[suggesterName] > 0) {
    this.pendingRequests[suggesterName]--;
    this.numPendingRequests--;
  }
  if (this.options.debug)
    console.log('usig.AutoCompleter.onAbort. Num Pending Requests: ' + this.numPendingRequests);
  if (this.options.debug) console.log(this.pendingRequests);
}

/*
 * Callback del evento afterServerRequest de los suggesters.
 */
function onServerRequest(suggesterName) {
  this.pendingRequests[suggesterName]++;
  this.numPendingRequests++;
  this.suggesters.filter(s => s.name === suggesterName)[0].status = PENDING;
  if (this.options.debug)
    console.log(
      'usig.AutoCompleter.onServerRequest. Num Pending Requests: ' + this.numPendingRequests
    );
  if (this.options.debug) console.log(this.pendingRequests);
  if (typeof this.options.afterServerRequest == 'function') {
    this.options.afterServerRequest();
  }
  this.onUpdate(this.getGlobalState());
}

/*
 * Callback del evento afterServerResponse de los suggesters.
 */
function onServerResponse(suggesterName) {
  const suggester = this.suggesters.filter(s => s.name === suggesterName)[0];
  if (this.pendingRequests[suggesterName] > 0) {
    this.pendingRequests[suggesterName]--;
    this.numPendingRequests--;
    if (this.pendingRequests[suggesterName] === 0) suggester.status = DONE;
  }
  if (this.options.debug)
    console.log(
      'usig.AutoCompleter.onServerResponse. Num Pending Requests: ' + this.numPendingRequests
    );
  if (this.options.debug) console.log(this.pendingRequests);
  if (typeof this.options.afterServerResponse === 'function' && this.numPendingRequests === 0) {
    this.options.afterServerResponse();
  }
  this.onUpdate(this.getGlobalState());
}

function bufferCallback() {
  if (this.bufferedResults.length > 0) {
    this.onBufferResults(this.suggestions);
    this.bufferedResults = [];
    this.flushTimer = null;
  }
}
/**
 * @class AutoCompleter
 * Esta clase implementa un autocompleter de lugares y direcciones para inputs de texto.<br/>
 */

class Autocompleter {
  constructor(callbacks, options) {
    this.options = Object.assign({}, defaults, options);
    if (callbacks) {
      this.onSuggestions = callbacks.onSuggestions
        ? callbacks.onSuggestions
        : emptyCallback.bind(this);
      this.onCompleteSuggestions = callbacks.onCompleteSuggestions
        ? callbacks.onCompleteSuggestions
        : emptyCallback.bind(this);
      this.onUpdate = callbacks.onUpdate ? callbacks.onUpdate : emptyCallback.bind(this);
      this.onError = callbacks.onError ? callbacks.onError : emptyCallback.bind(this);
      this.onMessage = callbacks.onMessage ? callbacks.onMessage : emptyCallback.bind(this);
      this.onBufferResults = callbacks.onBufferResults
        ? callbacks.onBufferResults
        : emptyCallback.bind(this);
    }

    this.suggesters = [];
    this.registeredSuggesters = [];
    this.suggestions = [];
    this.suggestersByName = {};
    this.pendingRequests = [];
    this.currentText = '';
    this.numPendingRequests = 0;
    this.appendResults = false;
    this.bufferedResults = [];
    this.flushTimer = null;
    this.appendBufferedResults = false;
    this.suggestions = [];
    this.globalState = {
      currentText: this.currentText,
      suggesters: this.suggesters
    };
    //When the autocompleter is initialized, the registered suggesters object is loaded with the default suggesters.
    this.options.suggesters.forEach(suggester => {
      this.registeredSuggesters.push(suggester);
    });
  }
  setCallbacks(callbacks) {
    if (callbacks) {
      this.onSuggestions = callbacks.onSuggestions
        ? callbacks.onSuggestions
        : emptyCallback.bind(this);
      this.onCompleteSuggestions = callbacks.onCompleteSuggestions
        ? callbacks.onCompleteSuggestions
        : emptyCallback.bind(this);
      this.onUpdate = callbacks.onUpdate ? callbacks.onUpdate : emptyCallback.bind(this);
      this.onError = callbacks.onError ? callbacks.onError : emptyCallback.bind(this);
      this.onMessage = callbacks.onMessage ? callbacks.onMessage : emptyCallback.bind(this);
      this.onBufferResults = callbacks.onBufferResults
        ? callbacks.onBufferResults
        : emptyCallback.bind(this);
    }
  }
  getSuggesters() {
    return this.suggesters;
  }
  addSuggester(suggester, options) {
    options = options || {};
    let name = typeof suggester === 'string' ? suggester : suggester.name;
    if (typeof this.suggestersByName[name] === 'undefined') {
      let sgObj = suggester;
      if (typeof suggester === 'string') {
        try {
          sgObj = this.createSuggesterByName(name, {
            onReady: this.options.onReady,
            debug: this.options.debug,
            maxRetries: this.options.maxRetries,
            afterServerRequest: onServerRequest.bind(this),
            afterServerResponse: onServerResponse.bind(this),
            afterAbort: onAbort.bind(this),
            callejero: options.callejero
          });
        } catch (e) {
          if (this.options.debug) console.log('ERROR: Suggester: ' + name + ' creation failed.');
          return false;
        }
      } else {
        sgObj.setOptions({
          debug: this.options.debug,
          maxRetries: this.options.maxRetries,
          afterServerRequest: onServerRequest.bind(this),
          afterServerResponse: onServerResponse.bind(this),
          afterAbort: onAbort.bind(this)
        });
      }
      this.suggestersByName[name] = sgObj;
      this.pendingRequests[name] = 0;
      let opt = {
        inputPause: this.options.inputPause,
        maxSuggestions: this.options.maxSuggestions,
        serverTimeout: this.options.serverTimeout,
        minTextLength: this.options.minTextLength,
        maxRetries: this.options.maxRetries,
        showError: this.options.showError
      };

      opt = Object.assign({}, opt, options);
      sgObj.setOptions(opt);
      this.suggesters.push(sgObj);
    } else {
      if (this.options.debug) console.log('Se intento agregar dos suggesters con el mismo nombre.');
    }
  }
  createSuggesterByName(name, opts) {
    const suggester = this.registeredSuggesters.filter(suggester => suggester.name === name)[0];
    if (suggester) return new suggester.class(name, opts);
    throw 'no se encontro';
  }
  removeSuggester(suggester) {
    const name = typeof suggester === 'string' ? suggester : suggester.name;
    this.suggesters = this.suggesters.filter(suggester => suggester.name !== name);
    delete this.suggestersByName[name];
  }
  updateSuggestions(newValue) {
    this.currentText = newValue;
    this.suggestions = [];
    try {
      abort.bind(this)();
    } catch (error) {
      throw error;
    }
    this.appendResults = false;
    this.suggesters.forEach(suggester => {
      if (newValue.length >= suggester.options.minTextLength) {
        suggester.status = INPUT_WAIT;
        suggester.inputTimer = setTimeout(() => {
          suggest.bind(this)(suggester, newValue);
        }, suggester.options.inputPause);
      }
    });
    this.onUpdate(this.getGlobalState());
  }

  bufferResults(results, appendResults) {
    if (!appendResults) {
      if (this.options.debug) console.log('Resetting buffered results...');
      this.bufferedResults = [];
      this.appendBufferedResults = false;
    }
    if (this.options.debug) console.log('Appending to buffered results...');
    for (var i = 0, l = results.length; i < l; i++) {
      this.bufferedResults.push(results[i]);
    }
    if (!this.flushTimer) {
      if (this.options.debug) console.log('Setting flush timer...');
      this.appendBufferedResults = appendResults;
      this.suggestions = this.bufferedResults;
      const t = this;
      this.flushTimer = setTimeout(() => bufferCallback.bind(t)(), this.options.flushTimeout);
    }
  }

  showResults() {
    if (this.options.debug)
      console.log(
        'Flushing buffered results... (' + (appendBufferedResults ? 'append' : 'replace') + ')'
      );
    if (field.value != '' && bufferedResults.length > 0) {
      view.show(bufferedResults, appendBufferedResults);
    }
    if (autoSelectFirst) {
      autoSelectFirst = false;
      view.selectOption();
      if (setAndGoPromise) {
        setAndGoPromise.resolve();
      }
    }
    bufferedResults = [];
    this.flushTimer = null;
  }

  getGlobalState() {
    this.globalState = {
      currentText: this.currentText,
      suggesters: this.suggesters.map(s => {
        return { name: s.name, status: s.status };
      }),
      suggestions: this.suggestions,
      pendingRequests: this.numPendingRequests,
      waitingSuggesters: this.suggesters.filter(s => s.status === INPUT_WAIT).length
    };
    return this.globalState;
  }
  isInitialized() {
    return this.suggesters.filter(s => s.ready() === false).length === 0;
  }
}
export default { Suggester, Direccion, Autocompleter };
