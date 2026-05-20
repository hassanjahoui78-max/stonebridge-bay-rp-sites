# 🏙️ Stonebridge Bay RP — Guida Completa

## Struttura Cartelle

```
stonebridgebayrp/
├── index.html        ← Homepage principale
├── checkout.html     ← Pagina carrello + PayPal
├── success.html      ← Pagamento riuscito
├── cancel.html       ← Pagamento annullato
├── 404.html          ← Pagina errore GTA-style
├── auth.html         ← Callback Discord OAuth2
├── style.css         ← Tema dark neon completo
├── script.js         ← Carrello + logica JS
└── netlify.toml      ← Configurazione Netlify
```

---

## 🚀 Pubblicare su Netlify

### Metodo 1 — Drag & Drop (più semplice)
1. Vai su https://app.netlify.com
2. Crea account o accedi
3. Trascina l'intera cartella `stonebridgebayrp/` nel riquadro "Deploy manually"
4. Netlify pubblica il sito e assegna un URL temporaneo
5. Vai su **Site settings → Change site name** → imposta `stonebridgebayrp`
6. L'URL sarà: `https://stonebridgebayrp.netlify.app`

### Metodo 2 — GitHub (consigliato per aggiornamenti)
1. Crea repo GitHub e carica la cartella
2. Collega il repo su Netlify → **Add new site → Import from Git**
3. Build command: *(lascia vuoto)*
4. Publish directory: `.` (punto)
5. Clicca **Deploy site**

---

## 💳 Testare PayPal

### Ambiente Sandbox (test senza soldi veri)
1. Vai su https://developer.paypal.com
2. Crea un account sviluppatore
3. In **Sandbox Accounts** crea un account "buyer" e un "business"
4. Nel file `checkout.html`, modifica l'URL del PayPal SDK:
   ```html
   <!-- Aggiungi &buyer-country=IT&locale=it_IT per test italiani -->
   <script src="https://www.paypal.com/sdk/js?client-id=TUO_CLIENT_ID&currency=EUR&buyer-country=IT"></script>
   ```
5. Usa le credenziali del sandbox buyer per fare acquisti di test

### Passare alla modalità Live (soldi reali)
- Il Client ID già inserito (`AVHw83I...`) è quello Live
- Assicurati di avere un account PayPal Business verificato
- Il sito su HTTPS (Netlify lo garantisce) è obbligatorio

---

## 🔑 Testare il Login Discord

### Link OAuth2 generato (pronto all'uso):
```
https://discord.com/oauth2/authorize?client_id=1506207606027583548&redirect_uri=https%3A%2F%2Fstonebridgebayrp.netlify.app%2Fauth.html&response_type=code&scope=identify
```

### Configurare l'app Discord
1. Vai su https://discord.com/developers/applications
2. Seleziona la tua app (ID: `1506207606027583548`)
3. Vai su **OAuth2 → Redirects**
4. Aggiungi: `https://stonebridgebayrp.netlify.app/auth.html`
5. Salva le modifiche

### Testare il flusso
1. Clicca "Accedi con Discord" sul sito
2. Discord chiede il consenso → accetti
3. Vieni reindirizzato a `auth.html?code=XXXXXXXX`
4. La pagina mostra il codice di autorizzazione

### IMPORTANTE — Backend necessario
Il codice OAuth2 ricevuto in `auth.html` deve essere scambiato **lato server**
con un access token tramite:
```
POST https://discord.com/api/oauth2/token
```
con i parametri:
- `client_id`
- `client_secret` ← MAI nel frontend!
- `grant_type=authorization_code`
- `code=<il codice ricevuto>`
- `redirect_uri`

Puoi usare una **Netlify Function** per questo scambio:
crea il file `netlify/functions/discord-auth.js`

---

## 🔧 Personalizzazioni Rapide

### Cambiare il link del server Discord
Cerca `https://discord.gg/tonycodelink` in tutti i file HTML
e sostituisci con il tuo link invite.

### Aggiungere prodotti
In `index.html`, copia un blocco `.product-card` e modifica
gli attributi `data-id`, `data-name`, `data-price`, `data-icon`.

### Cambiare colori neon
In `style.css`, modifica le variabili `:root`:
```css
--neon-cyan:   #00f5ff;  /* colore principale */
--neon-pink:   #ff2d78;  /* colore secondario */
--neon-yellow: #f5c400;  /* accenti */
```

---

## 📁 File generati — riepilogo

| File | Descrizione |
|------|-------------|
| `index.html` | Homepage con hero, shop, features, footer |
| `checkout.html` | Carrello + integrazione PayPal SDK |
| `success.html` | Pagina successo con confetti + dettagli ordine |
| `cancel.html` | Pagamento annullato |
| `404.html` | Errore 404 stile GTA con effetto glitch |
| `auth.html` | Callback Discord OAuth2 con terminale animato |
| `style.css` | Tema dark neon completo (responsive) |
| `script.js` | Carrello localStorage, toast, Discord link |
| `netlify.toml` | Redirect 404 + header sicurezza |

---

*Stonebridge Bay RP — Non affiliato a Rockstar Games / Take-Two Interactive*
