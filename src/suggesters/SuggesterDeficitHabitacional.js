import Suggester from './Suggester.js';
import 'isomorphic-fetch';
import URI from 'urijs';

const defaults = {
  serverTimeout: 30000,
  server: 'https://epok.buenosaires.gob.ar/deficithabitacional/buscarManzana/',
  maxRetries: 1,
  maxSuggestions: 10,
  searchOptions: {
    start: 0,
    limit: 20,
    tipoBusqueda: 'ranking',
    categoria: undefined,
    clase: undefined,
    bbox: false,
    extent: undefined,
    returnRawData: false
  }
};

function mkRequest(data, address, serverDefaults) {
    const url = URI(address).search(data);
    return fetch(url.toString(), serverDefaults).then(resp => resp.json());
  }
export default class SuggesterDeficitHabitacional extends Suggester {
  constructor(name, options) {
    let opts = Object.assign({}, defaults, options);
    super(name, opts);
  }

  getSuggestions(text, callback, maxSuggestions) {
    const data = {
      ubicacion: text
      };
      this.lastRequest = mkRequest(data, defaults.server, {}).then(
        res => {
          const results = res.instancias.map(d => {
            return {
              title: d.nombre,
              subTitle: d.clase,
              type: d.type,
              category: d.clase,
              idEpok: d.id,
              suggesterName: this.name
            };
          });
          callback(results, text, this.name);
        },
        err => callback(err, text, this.name)
      );
    
  }

  ready() {
    return true;
  }

  setOptions(options) {
    this.options = Object.assign({}, this.options, options);
  }
}