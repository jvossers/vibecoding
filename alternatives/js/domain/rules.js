// Which metadata fields must match for one product to count as an alternative to another.
//
// PLACEHOLDER RULES. Replace this list with the real rules. A candidate is an alternative
// only when it is in the same category and every rule for that category passes; there is
// no partial match. A missing (null) value never matches.
//
// Each rule:
//   id       stable key
//   label    shown in the UI ("Matched on: …")
//   fields   one or more keys of product.specifications; all of them must match
//   compare  'equal'   — values are identical
//            'sameSet' — arrays contain the same items, in any order

export const RULES = {
  pipette_tip: [
    { id: 'volume', label: 'Volume range', fields: ['volumeMinUl', 'volumeMaxUl'], compare: 'equal' },
    { id: 'fit', label: 'Pipette fit', fields: ['compatibleInstrumentFamilies'], compare: 'sameSet' },
    { id: 'sterile', label: 'Sterile', fields: ['sterile'], compare: 'equal' },
    { id: 'filtered', label: 'Filtered', fields: ['filtered'], compare: 'equal' },
    { id: 'lowRetention', label: 'Low retention', fields: ['lowRetention'], compare: 'equal' },
    { id: 'tipFormat', label: 'Tip format', fields: ['tipFormat'], compare: 'equal' },
  ],
  // Pipettes and accessories have no rules yet, so they have no alternatives.
};
