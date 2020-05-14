import React, { Component } from 'react';
import { Autocompleter } from '@usig-gcba/autocompleter';
import './App.css';

class App extends Component {
  state = {
    autocompleter: null,
    showMap: false,
    loading: false,
    x: null,
    y: null,
    input: '',
    error: null,
    suggestions: [],
    selectedSuggestion: null
  };

  handleInputChange = (event) => {
    const text = event.target.value;
    this.state.autocompleter.updateSuggestions(text);
    this.setState({ input: text, showMap: false });
  };

  handleClick = async (suggestion) => {
    if (suggestion) {
      this.setState({ selectedSuggestion: suggestion });
      if (suggestion.type === 'CALLE') {
        this.setState({
          suggestions: [],
          input: suggestion.title + ' '
        });
      } else {
        this.setState({
          input: suggestion.title,
          suggestions: [],
          loading: true
        });
        if (suggestion.type === 'DIRECCION') {
          this.setState({
            showMap: true,
            loading: false,
            x: suggestion.data.coordenadas.x,
            y: suggestion.data.coordenadas.y
          });
        }
      }
    }
  };

  componentDidMount() {
    // Opciones de config del autocomplete
    const options = { maxSuggestions: 10, debug: false };
    const buscarDireccionesAmba = true;

    //Callbacks del autocomplete
    const suggestionsCallback = (suggestions) => {
      console.log('suggestions', suggestions);
      this.setState({ suggestions: suggestions });
    };

    const completeSuggestionsCallback = (suggestions) => {
      if (suggestions.length === 0) {
        this.setState({ suggestions: [] });
      } else {
        this.setState({ error: null });
      }
    };

    const errorCallback = (error) => {
      this.setState({ error: error });
    };

    const autocompleter = new Autocompleter(
      {
        onCompleteSuggestions: completeSuggestionsCallback,
        onSuggestions: suggestionsCallback,
        onError: errorCallback
      },
      options
    );

    autocompleter.addSuggester('Direcciones', { inputPause: 250 });
    autocompleter.addSuggester('Lugares');
    autocompleter.addSuggester('DeficitHabitacional');
    autocompleter.addSuggester('Catastro');
    if (buscarDireccionesAmba) autocompleter.addSuggester('DireccionesAMBA');

    this.setState({ autocompleter: autocompleter, suggestions: [] });
  }

  render() {
    return (
      <div className="App">
        <div className="section">
          <div id="header">
            <div id="logo">
              <h1>USIG AutoCompleter (Demo)</h1>
            </div>
          </div>
          Lugar{' '}
          <input id="search-input" value={this.state.input} onChange={this.handleInputChange} />
          <span id="ejemplo">ej.: Callao y Corrientes, Florida 550, Teatro San Martín, etc.</span>
          {this.state.error ? this.state.error.message : null}
          {this.state.suggestions.map((suggestion, index) => {
            const title = suggestion.alias || suggestion.title || suggestion.nombre || suggestion.data.smp || suggestion.data;
            const subTitle = suggestion.subTitle ? suggestion.subTitle : suggestion.descripcion;
            return (
              <div className="sugerencia" key={index} onClick={() => this.handleClick(suggestion)}>
                <div
                  className="titulo-sugerencia"
                  id={title + '-title-sug-' + index}
                  aria-hidden="true"
                >
                  {title}
                </div>
                <div className="clase" id={subTitle + '-subtitle-sug-' + index} aria-hidden="true">
                  {subTitle}
                </div>
              </div>
            );
          })}
          {this.state.selectedSuggestion ? (
            <div style={{ zIndex: 0, display: 'inline-block', maxWidth: '35 vw' }}>
              <pre>{JSON.stringify(this.state.selectedSuggestion, null, 2)}</pre>
            </div>
          ) : null}
          {this.state.loading ? 'cargando ...' : null}
          {this.state.showMap ? (
            <img
              style={{ display: 'inline-block', maxWidth: '35 vw' }}
              alt="mapa"
              src={`http://servicios.usig.buenosaires.gob.ar/LocDir/mapa.phtml?x=${this.state.x}&y=${this.state.y}&w=600&punto=1&desc=`}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default App;
