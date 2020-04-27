import { Component, OnInit } from '@angular/core';

import { Autocompleter } from '@usig-gcba/autocompleter';

let autocompleter;

@Component({
  selector: 'app-autocompleter',
  templateUrl: './autocompleter.component.html',
  styleUrls: ['./autocompleter.component.css'],
})
export class AutocompleterComponent implements OnInit {
  inputValue: String;
  suggestions: [];
  selectedSuggestion: null;
  selectedSuggestionJSON: String;
  error: null;

  inputChangeHandler(inputValue) {
    autocompleter.updateSuggestions(inputValue);
  }

  selectSuggestion(suggestion) {
    if (suggestion) {
      this.selectedSuggestion = suggestion;
      this.selectedSuggestionJSON = JSON.stringify(suggestion, null, 2);
      if (suggestion.type === 'CALLE') {
        this.suggestions = [];
        this.inputValue = suggestion.title + ' ';
      } else {
        this.inputValue = suggestion.title;
        this.suggestions = [];
      }
    }
  }

  constructor() {
    const options = { maxSuggestions: 10, debug: false };

    const suggestionsCallback = (suggestions) => {
      this.suggestions = suggestions;
    };

    const completeSuggestionsCallback = (suggestions) => {
      if (suggestions.length === 0) {
        this.suggestions = [];
      } else {
        this.error = null;
      }
    };

    const errorCallback = (error) => {
      this.error = error;
    };

    autocompleter = new Autocompleter(
      {
        onCompleteSuggestions: completeSuggestionsCallback,
        onSuggestions: suggestionsCallback,
        onError: errorCallback,
      },
      options
    );

    autocompleter.addSuggester('Direcciones', { inputPause: 250 });
    autocompleter.addSuggester('DireccionesAMBA');
  }

  ngOnInit(): void {}
}
