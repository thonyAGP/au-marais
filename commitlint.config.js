/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Types autorisés
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nouvelle fonctionnalité
        'fix',      // Correction de bug
        'docs',     // Documentation
        'style',    // Formatage (pas de changement de code)
        'refactor', // Refactoring
        'perf',     // Amélioration de performance
        'test',     // Ajout/modification de tests
        'chore',    // Maintenance (dépendances, config)
        'ci',       // CI/CD
        'revert',   // Revert d'un commit
        'build',    // Système de build
      ],
    ],
    // Longueur du sujet
    'subject-max-length': [2, 'always', 100],
    // Pas de point à la fin du sujet
    'subject-full-stop': [2, 'never', '.'],
  },
};
