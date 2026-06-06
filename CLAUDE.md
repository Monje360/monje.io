# monje·io — Landing (handoff para Claude Code)

Landing premium de **monje.io** (rebrand de la agencia monje360). Página de una sola
pantalla: orbe animado + un chat que recoge el problema del usuario y lo lleva a
**reservar una llamada de consultoría gratis**. Sin build step: HTML/CSS/JS vanilla.

> Idioma del proyecto: **español**. Tono de marca: seguro y pícaro (estilo Ira Bravo /
> Putos Modernos) pero **premium**, casi sin tacos. "No ataca, desarma."

---

## Cómo arrancar

No hay dependencias ni compilación. Dos opciones:

```bash
# opción rápida
open index.html            # (mac)  /  xdg-open index.html (linux)

# opción recomendada (evita restricciones file:// y sirve los assets bien)
python3 -m http.server 8000
# luego abre http://localhost:8000
```

Las fuentes (Sora + JetBrains Mono) se cargan desde Google Fonts por CDN → hace falta internet.

---

## Mapa de archivos

```
index.html                     Markup de la landing (nav · hero · chat · footer)
assets/css/styles.css          TODO el estilo (tokens de marca como CSS vars arriba)
assets/js/orb.js               Orbe = vídeo real (assets/video/orb.mp4): loop calmado + acelera al hover
assets/video/orb.mp4           Vídeo de la esfera (verde+negro, fondo gris claro). Pesa ~9 MB (pendiente comprimir)
assets/js/chat.js              Lógica del chat → llama a POST /api/chat (mock local si no hay backend)
api/chat.js                    Endpoint del chat (Vercel) → {reply, offerCall}. Guion on-voice; LLM si hay clave
vercel.json                    Config de Vercel (cleanUrls, cache de assets, headers)
assets/img/avatar.jpg          Foto real para el chip "te responde una persona"
assets/logo/preview-*.png      Referencias visuales del logo (3 variantes)
assets/logo/source/*.html      Exports originales del logo (fuente para vectorizar)
brand/monje-marca-v2.md        Documento maestro de marca (concepto, voz, guion)
```

---

## Sistema de marca (no inventar, respetar)

**Colores** (definidos como CSS vars en `styles.css :root`):
- `--black` Pilo Black `#0F0F0F`
- `--green` Electric Green / lima `#C7FF2E`  ← color de marca, úsalo con criterio
- `--white` `#FFFFFF` · `--charcoal` `#2E2E2E` · `--gray` `#808080`

**Tipografía**:
- **Una sola tipografía en TODO: Sora** (`--disp`). El logotipo está hecho en Sora.
- (Antes había una secundaria mono —JetBrains Mono— para eyebrow/footer/status; **eliminada**.
  El var `--mono` se mantiene como alias de Sora por compatibilidad; no reintroducir mono.)

**Logotipo** = `monje` + `.io` dentro de una **pastilla lima** (componente `.logo` en CSS,
reconstruido en vector con texto Sora, nítido y escalable). Variantes:
- Sobre fondo claro → `monje` negro + pastilla lima (nav).
- Sobre fondo oscuro → `monje` blanco + pastilla lima (footer).
- (Existe variante "sobre lima": pastilla negra. Ver `assets/logo/`.)
Los `.html` en `assets/logo/source/` son los exports oficiales; si necesitas SVG sueltos,
vectorízalos desde ahí (la copyright/propiedad del logo es del cliente).

**Claims / north star**:
- "Tu marca hace ruido. Monje la hace sonar."
- "No es una agencia. Es Monje." · "Tienes el talento. Te falta la batuta."
- Posicionamiento (en la web): **"Especialistas en Marketing, IA y optimización de empresas."**
- Pilares: **Atraer · Convertir · Automatizar · Escalar** (son los chips del hero).

---

## El orbe (`assets/js/orb.js` + `assets/video/orb.mp4`)

Ahora es el **vídeo real** de la esfera (cristal con fluido verde+negro), no el shader WebGL.
`<video id="mjOrb">` autoplay/loop/muted/playsinline en `index.html`.

- El clip tiene **fondo gris claro (~#EBEBED), no blanco**. Para que no se vea un cuadrado:
  `#mjOrb` usa `object-fit:cover` (recorta los laterales grises) + una **máscara circular**
  (`mask:radial-gradient(...)`) que funde el borde en la página. La **sombra de contacto** la
  sigue poniendo CSS (`.orb-wrap::after`), no el vídeo.
- **Vivo + reacción al hover** (`orb.js`): loop a velocidad calmada (`REST=0.82`) y, al pasar el
  cursor por el `.orb-wrap`, sube `playbackRate` hacia `HOT=1.9` con rampa suave; el CSS le da
  además un `scale(1.04)`.
- ⚠️ El mp4 pesa ~9 MB: **pendiente comprimir** (no había ffmpeg al generarlo). Idealmente
  recomprimir a ~1–2 MB y/o añadir un `.webm`.

(El shader WebGL anterior queda en el historial de git si hiciera falta volver a la versión ligera.)

---

## El chat (`assets/js/chat.js`) — conectado a `/api/chat`

`handle()` envía cada turno a **`POST /api/chat`** con `{message, pillar, history}` y pinta
`{reply, offerCall}`. Si `offerCall` es `true`, muestra la tarjeta CTA. Los chips
(Atraer/Convertir/…) precargan un mensaje y mandan su `pillar`.

**Mock local (sin backend):** si el `fetch` falla (abrir por `file://`, 404 al servir estático,
error de red) cae automáticamente a un guion on-voice (`openers` + `second`) idéntico al de
antes, así la landing se puede probar sin servidor. La UI y las funciones `typing()`, `add()`
y `showCTA()` quedan **intactas**. (El texto del usuario se escapa antes de pintarlo.)

### Requisito de marca CLAVE: "persona real, no bot"
El usuario quiere que se perciba que **detrás hay UNA PERSONA (Monje)**, no software/IA. El chat
es solo la forma de ir al grano y no hacer perder el tiempo. Esto está implementado con:
1. chip de presencia (avatar foto + "Te responde una persona, no un bot" + punto verde "en línea"),
2. nota gris bajo el chat ("No es un bot ni un software: detrás estoy yo, una persona…"),
3. el primer mensaje del bot se presenta como persona y la CTA dice "hablas con quien va a estar
   en tu negocio".
**No 'botifiques' el copy.** Mantén el tono humano y directo.

### El backend (`api/chat.js`)
Función serverless de Vercel, **sin dependencias** (usa `fetch` global). Contrato:

```
POST /api/chat   { message, pillar, history:[{role,content}] }  ->  { reply, offerCall }
```

Dos modos, conmuta solo según haya clave:
- **Sin `ANTHROPIC_API_KEY`** → responde con el **guion on-voice** (mismo texto que el mock).
  Despliega y funciona tal cual, gratis, sin tocar nada.
- **Con `ANTHROPIC_API_KEY`** → Monje "de verdad": llama a Claude con el system prompt de marca
  (voz persona-real, el guion como tono base) vía *tool use* para devolver `{reply, offerCall}`
  fiable. Modelo configurable con `ANTHROPIC_MODEL` (por defecto `claude-sonnet-4-6`). Si el LLM
  falla, cae al guion: el chat **nunca** se rompe.

> ⚠️ El system prompt es la voz de marca. **No lo 'botifiques'.** Monje es una persona: el prompt
> le prohíbe decir que es una IA/bot/asistente. Si lo editas, mantén ese tono (ver §"La voz" en
> `brand/monje-marca-v2.md`).

Local: el servidor estático (`python3 -m http.server`) **no** ejecuta `/api/chat` → se usa el
mock. Para probar el endpoint de verdad en local: `vercel dev` (o despliega en Vercel).

---

## TODO (pendientes para terminar)

- [x] **Conectar el chat al bot real** — `chat.js` ya llama a `POST /api/chat` (con mock local de
      fallback) y `api/chat.js` sirve el endpoint. Falta solo poner `ANTHROPIC_API_KEY` en Vercel
      para activar el LLM (sin ella, responde con el guion on-voice).
- [ ] **Enlaces de reserva**: los botones "Fichar a Monje", "Reservar mi llamada" y la CTA del
      chat apuntan a `#`. Cambiar por la agenda real (Calendly / Cal.com).
- [x] ~~**URLs de Servicios** en el footer~~ — columna "Servicios" eliminada del footer (ya no
      hay enlaces de servicios; el footer es brand + Contacto).
- [ ] **Copyright / razón social** del footer: ahora "© 2026 monje". Confirmar entidad legal
      (pendiente: el cliente pasa la razón social).
- [x] **Logo en SVG sueltos** (primaria + reversa) — generados en `assets/logo/monje-io-primaria.svg`
      y `monje-io-reversa.svg`, con Sora outlineada a trazados (sin dependencia de fuente).
- [x] **Titular en móvil** — en <560px parte en 2 líneas a buen tamaño; en desktop/tablet sigue
      en 1 línea (`white-space:nowrap`). Resuelto en `styles.css`.
- [x] (Opcional) mini-avatar (foto) junto a cada burbuja del bot — implementado (`.bot-row` en
      `chat.js`/`styles.css`). El nombre por burbuja se descartó por mantener el aire (ya está en el chip).
- [ ] Páginas legales (Aviso legal / Privacidad / Cookies) si se publica.

## Decisiones ya tomadas (no deshacer sin querer)
- Estética **minimal premium, fondo blanco**. El usuario rechazó versiones "cargadas"
  (eyebrows largos, subtítulos, grano, halos fuertes). Mantener aire.
- Orbe **verde+carbón** (no humo plano, no canica, no contorno de energía sobre negro).
- Footer con info **real de monje360.com**: Valencia · Madrid · Worldwide · 619 814 199 ·
  info@monje360.com · IG @monje.360 · "consultoría inicial gratuita…". (Se filtró el relleno
  demo de la plantilla original: nada de "Mouno", "Los Angeles", etc.)
