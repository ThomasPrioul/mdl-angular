import { InjectionToken } from '@angular/core';

/** French default translations. */
export const FrenchTimewindowStrings: TimewindowStrings = {
  absoluteDates: 'Absolues',
  cancel: 'Annuler',
  clearValues: 'Effacer les valeurs',
  confirm: 'Appliquer',
  relativeDates: 'Relatives',
  chooseTimeRange: 'Choisir une plage',

  absolute: {
    endDate: 'Date de fin',
    endDateTime: 'Date/heure de fin',
    endTime: 'Heure de fin',
    maxValidationHint: 'Max: ',
    minMaxValidationHint: 'Doit être < à la date de fin',
    minValidationHint: 'Min: ',
    startDate: 'Date de début',
    startDateTime: 'Date/heure de début',
    startTime: 'Heure de début',
  },

  relative: {
    chooseRange: 'Choisissez une plage',
    customRange: 'Plage personnalisée',
    customRangeDescription: 'Choisir une plage personnalisée dans le passé',
  },

  duration: {
    label: 'Durée',
    placeholder: 'Entrer une durée',
    timeUnit: 'Unité de temps',
    seconds: 'Secondes',
    minutes: 'Minutes',
    hours: 'Heures',
    days: 'Jours',
    weeks: 'Semaines',
    months: 'Mois',
    years: 'Années',
  },
  last: 'Dernier',
};

/** Timewindow strings translations injection token.*/
export const TIMEWINDOW_STRINGS = new InjectionToken<TimewindowStrings>('TIMEWINDOW_STRINGS');

/** Timewindow list of strings. */
export interface TimewindowStrings {
  absolute: {
    endDate: string;
    endDateTime: string;
    endTime: string;
    maxValidationHint: string;
    minMaxValidationHint: string;
    minValidationHint: string;
    startDate: string;
    startDateTime: string;
    startTime: string;
  };
  absoluteDates: string;
  cancel: string;
  chooseTimeRange: string;
  clearValues: string;
  confirm: string;
  duration: {
    label: string;
    placeholder: string;
    timeUnit: string;
    seconds: string;
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
  };
  last: string;
  relative: {
    chooseRange: string;
    customRange: string;
    customRangeDescription: string;
  };
  relativeDates: string;
}
