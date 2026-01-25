# Tests Manuels - Système de Réservation

> Checklist complète pour tester le flux de réservation Au Marais

## Prérequis

### Variables d'environnement (`.env.local`)
```env
# Vercel KV
KV_REST_API_URL=xxx
KV_REST_API_TOKEN=xxx

# Stripe (mode TEST pour les tests)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend
RESEND_API_KEY=re_xxx

# Smoobu
SMOOBU_API_KEY=xxx
SMOOBU_APARTMENT_ID=xxx

# Admin
ADMIN_PASSWORD=xxx
ADMIN_EMAIL=ton@email.com
ADMIN_WHATSAPP=33612345678
```

### Stripe Webhook (mode test)
1. Dashboard Stripe → Developers → Webhooks
2. Add endpoint: `https://[preview-url].vercel.app/api/webhooks/stripe`
3. Event: `checkout.session.completed`
4. Copier le Signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 1. Création de Réservation

### Test 1.1 - Formulaire basique
- [ ] Aller sur `/fr/reserver`
- [ ] Sélectionner dates (ex: dans 2 semaines, 3 nuits)
- [ ] Vérifier que le prix se calcule automatiquement
- [ ] Remplir : Prénom, Nom, Email, Téléphone
- [ ] Soumettre le formulaire
- [ ] **Attendu** : Message de confirmation affiché

### Test 1.2 - Calcul des prix
| Durée | Réduction attendue |
|-------|-------------------|
| 1-6 nuits | 0% |
| 7-13 nuits | 10% |
| 14-27 nuits | 15% |
| 28+ nuits | 20% |

- [ ] Tester chaque palier de durée
- [ ] Vérifier : sous-total, réduction, frais ménage, taxe séjour, total

### Test 1.3 - Notifications admin
- [ ] Vérifier réception email admin (ADMIN_EMAIL)
- [ ] Vérifier contenu : client, dates, prix, boutons action
- [ ] Cliquer sur lien WhatsApp dans l'email (si configuré)

---

## 2. Gestion Admin

### Test 2.1 - Connexion admin
- [ ] Aller sur `/admin`
- [ ] Entrer le mot de passe admin
- [ ] **Attendu** : Redirection vers `/admin/reservations`

### Test 2.2 - Liste des réservations
- [ ] Vérifier que la nouvelle réservation apparaît
- [ ] Tester les filtres (Toutes, En attente, Approuvées, etc.)
- [ ] Vérifier affichage des détails

---

## 3. Approbation de Réservation

### Test 3.1 - Via lien email
- [ ] Cliquer sur "Valider" dans l'email admin
- [ ] Vérifier affichage page d'approbation
- [ ] Modifier le montant de caution si nécessaire
- [ ] Cliquer "Valider la réservation"
- [ ] **Attendu** :
  - Message succès
  - Dates bloquées dans Smoobu
  - Payment Link Stripe créé

### Test 3.2 - Via interface admin
- [ ] Aller sur `/admin/reservations`
- [ ] Cliquer sur une réservation "En attente"
- [ ] Approuver depuis l'interface
- [ ] Vérifier même résultat que 3.1

### Test 3.3 - Email client après approbation
- [ ] Vérifier réception email client
- [ ] Vérifier contenu : détails séjour, bouton "Payer la caution"
- [ ] Vérifier que le lien Stripe fonctionne

---

## 4. Modification Tarifaire

### Test 4.1 - Modifier le prix avant approbation
- [ ] Aller sur `/admin/reservations`
- [ ] Cliquer "Modifier" sur une réservation en attente
- [ ] Changer le tarif nuitée
- [ ] Changer la réduction
- [ ] Changer les frais de ménage
- [ ] Sauvegarder
- [ ] **Attendu** : Total recalculé

### Test 4.2 - Modifier la caution à l'approbation
- [ ] Lors de l'approbation, modifier le champ "Montant caution"
- [ ] Approuver
- [ ] **Attendu** : Payment Link Stripe avec le nouveau montant

### Test 4.3 - Ajouter des notes admin
- [ ] Éditer une réservation
- [ ] Ajouter une note admin
- [ ] Sauvegarder
- [ ] Vérifier que la note est visible dans l'admin

---

## 5. Paiement Stripe

### Test 5.1 - Paiement réussi (carte test)
- [ ] Ouvrir le lien de paiement Stripe
- [ ] Utiliser la carte test : `4242 4242 4242 4242`
- [ ] Date expiration : n'importe quelle date future
- [ ] CVV : n'importe quels 3 chiffres
- [ ] Compléter le paiement
- [ ] **Attendu** :
  - Redirection vers `/reservation/confirmed`
  - Page de confirmation affichée
  - Email confirmation envoyé au client

### Test 5.2 - Webhook Stripe
- [ ] Vérifier dans l'admin que le statut est passé à "Payé"
- [ ] Vérifier dans Stripe Dashboard → Webhooks → Recent events

### Test 5.3 - Paiement échoué
- [ ] Utiliser carte test échec : `4000 0000 0000 0002`
- [ ] **Attendu** : Erreur Stripe, pas de changement de statut

### Cartes de test Stripe
| Carte | Résultat |
|-------|----------|
| `4242 4242 4242 4242` | Succès |
| `4000 0000 0000 0002` | Refusée |
| `4000 0000 0000 9995` | Fonds insuffisants |
| `4000 0025 0000 3155` | Authentification 3DS requise |

---

## 6. Refus de Réservation

### Test 6.1 - Refuser une réservation
- [ ] Cliquer sur "Refuser" dans l'email admin ou l'interface
- [ ] Entrer une raison (optionnel)
- [ ] Confirmer le refus
- [ ] **Attendu** :
  - Statut "Refusée"
  - Email de refus envoyé au client
  - Dates libérées dans Smoobu (si étaient bloquées)

---

## 7. Annulation

### Test 7.1 - Supprimer une réservation
- [ ] Dans l'admin, supprimer une réservation
- [ ] **Attendu** :
  - Réservation supprimée de la liste
  - Dates libérées dans Smoobu

---

## 8. Tests Edge Cases

### Test 8.1 - Dates déjà réservées
- [ ] Créer une réservation sur des dates déjà bloquées dans Smoobu
- [ ] **Attendu** : Erreur ou avertissement

### Test 8.2 - Réservation en double
- [ ] Soumettre le même formulaire 2 fois rapidement
- [ ] **Attendu** : Une seule réservation créée

### Test 8.3 - Email invalide
- [ ] Soumettre avec un email mal formaté
- [ ] **Attendu** : Validation côté client

### Test 8.4 - Token expiré/invalide
- [ ] Modifier le token dans l'URL d'approbation
- [ ] **Attendu** : Erreur "Reservation not found or invalid token"

---

## 9. Tests Mobile

- [ ] Formulaire de réservation responsive
- [ ] Page de confirmation responsive
- [ ] Admin responsive (optionnel)

---

## 10. Checklist Pré-Production

Avant de passer en mode live Stripe :

- [ ] Tous les tests ci-dessus passent en mode test
- [ ] Remplacer `sk_test_xxx` par `sk_live_xxx`
- [ ] Créer webhook production sur `https://au-marais.fr/api/webhooks/stripe`
- [ ] Mettre à jour `STRIPE_WEBHOOK_SECRET` avec le secret production
- [ ] Tester un paiement réel de petit montant (ex: 1€)
- [ ] Rembourser le paiement test depuis Stripe Dashboard

---

## Notes

### Logs utiles
```bash
# Voir les logs Vercel en temps réel
vercel logs --follow

# Ou dans le dashboard Vercel → Functions → Logs
```

### Stripe CLI (tests locaux)
```bash
# Installer Stripe CLI
# Puis forward les webhooks en local :
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Déclencher un événement de test :
stripe trigger checkout.session.completed
```

### Problèmes fréquents

| Problème | Solution |
|----------|----------|
| Webhook ne reçoit pas | Vérifier URL et signing secret |
| Email pas reçu | Vérifier RESEND_API_KEY et spam |
| Smoobu non bloqué | Vérifier SMOOBU_API_KEY et APARTMENT_ID |
| Erreur KV | Vérifier KV_REST_API_URL et KV_REST_API_TOKEN |
