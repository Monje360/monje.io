# Prompts para continuar en Claude Code

Copia/pega estos prompts al abrir el proyecto. El primero es el de arranque.

> **Estado (act. 2026-06-05):** el chat YA está conectado a `POST /api/chat` (con mock local de
> fallback y función serverless `api/chat.js`), y se quitó la columna **"Servicios"** del footer.
> Lo hecho está marcado **✅** abajo. Para continuar: empieza por el punto 3 en adelante.

---

## 1) Arranque (pégalo el primero)
> Lee `CLAUDE.md` entero antes de tocar nada. Es una landing de monje.io (HTML/CSS/JS
> vanilla, sin build). Respeta el sistema de marca (Sora, paleta, logo en pastilla lima) y,
> sobre todo, el requisito **"persona real, no bot"**: no conviertas el chat en un chatbot
> frío ni cambies el tono. Cuando lo tengas claro, dime un plan breve de los TODOs pendientes
> antes de empezar.

## 2) Conectar el chat al bot real — ✅ HECHO
> `chat.js` llama a `POST /api/chat` (`{message, pillar, history}` → `{reply, offerCall}`), con
> **mock local** de fallback si no hay backend. El endpoint vive en `api/chat.js` (Vercel, sin
> dependencias): responde con el guion on-voice por defecto y, si defines `ANTHROPIC_API_KEY`
> (opcional `ANTHROPIC_MODEL`, def. `claude-sonnet-4-6`), pasa a ser Monje "de verdad" con un LLM.
> UI y `typing()`/`add()`/`showCTA()` intactas. **Pendiente opcional:** poner `ANTHROPIC_API_KEY`
> en Vercel para activar el LLM. Detalle en `CLAUDE.md` (§"El chat").

## 3) Enlaces reales de reserva
> Cambia los `href="#"` por enlaces reales: el botón "Fichar a Monje", "Reservar mi llamada" y
> la CTA del chat (`#reservar`) → mi agenda (te paso la URL de Calendly/Cal.com). Pregúntame la
> URL que falte. (La columna "Servicios" del footer ya se eliminó, así que esos enlaces ya no
> existen.)

## 4) Logo en SVG sueltos
> Vectoriza el logo a dos SVG limpios (primaria fondo claro y reversa fondo oscuro) a partir
> de `assets/logo/source/`. Texto en Sora convertido a trazados, pastilla lima `#C7FF2E`,
> y guárdalos en `assets/logo/`.

## 5) Titular responsive
> Ahora el `<h1>` está forzado a una línea (`white-space:nowrap` + tamaño por vw) y en móvil
> se hace pequeño. Haz que en pantallas < 560px pueda partir en dos líneas con un tamaño
> cómodo, manteniéndolo en UNA sola línea en desktop/tablet.

## 6) (Opcional) Mini-avatar en las burbujas
> Añade la foto (`assets/img/avatar.jpg`) como mini-avatar junto a cada mensaje del bot y el
> nombre real bajo "Monje", para reforzar el "hay una persona detrás". Sutil, sin recargar.
