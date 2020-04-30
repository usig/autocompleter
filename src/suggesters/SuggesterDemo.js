import Suggester from './Suggester.js';

const defaults = {
  url: 'https://google.com/'
};

/*

Suggester de ejemplo que se puede usar como template para crear
suggesters que se quieran agregar a la librería.
Para usarlo se lo tiene que importar en ../Autocompleter.js y
agregar al array de suggesters en ese mismo archivo.

*/

export default class SuggesterDemo extends Suggester {
  constructor(name, options) {
    let opts = Object.assign({}, defaults, options);
    super(name, opts);
  }

  getSuggestions(text, callback, maxSuggestions) {
    let test = [
      {
        title: 'Título',
        subTitle: 'subTitle',
        type: 'Tipo',
        category: 'Categoría',
        suggesterName: this.name,
        data: 'data'
      }
    ];

    callback(test, text, this.name);
  }

  ready() {
    return true;
  }

  setOptions(options) {
    this.options = Object.assign({}, this.options, options);
  }
}
