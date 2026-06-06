// api/chat.js — endpoint del chat de monje.io (Vercel Serverless Function, Node 18+)
//
//   POST  { message, pillar, history:[{role,content}] }  ->  { reply, offerCall }
//
// Por defecto responde con el GUION on-voice: sin dependencias ni claves, despliega y funciona.
// Si defines  ANTHROPIC_API_KEY  el chat pasa a ser Monje "de verdad" (LLM con la voz de marca);
// opcional  ANTHROPIC_MODEL  (por defecto claude-sonnet-4-6).
//
// Regla de marca innegociable: Monje es UNA PERSONA, nunca un bot. No 'botifiques' el copy.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

const OPENERS = {
  atraer:"Atraer está sobrevalorado si luego no se quedan. ¿Tu problema es que no llega gente… o que llega y no engancha?",
  convertir:"Si entra gente y no compra, no es la web: es el mensaje. ¿Qué quieres que haga el que llega —comprar, reservar, escribirte?",
  automatizar:"Lo que repites cada semana lo puede hacer la IA por ti. ¿Qué es lo que más horas te roba ahora mismo?",
  escalar:"Crecer sin sistema es solo currar más. ¿Qué se rompería si mañana te entra el triple de clientes?",
  _default:"Te leo. Suena a producto bueno con una comunicación que no está a su altura. ¿Qué es lo que más te frena ahora mismo?"
};
const SECOND = "Lo tengo. Esto no se arregla con posts sueltos, sino con marketing e IA trabajando juntos —y se ve clarísimo en una llamada de 20 minutos. Te la regalo: sales con un plan, fiches a Monje o no.";
const KEEP = [
  "Te sigo. ¿Qué has probado ya que no te haya terminado de funcionar?",
  "Vale. Y de todo esto, ¿qué es lo que más te urge resolver ahora?"
];

// Cadencia de la llamada: se ofrece en el 2º mensaje del visitante (turn 1) y, si no reserva,
// cada 3 turnos (1, 4, 7…). Entre medias, se aporta valor sin presionar.
function isOfferTurn(turn){ return turn >= 1 && (turn - 1) % 3 === 0; }

// Guion de respaldo (si el LLM falla o no hay clave). Mantiene la misma cadencia.
function scripted(turn, pillar){
  if (turn <= 0) return { reply: 'Soy <b>Alex</b> —una persona de verdad, no un bot. Vamos al grano para no hacerte perder el tiempo. ' + (OPENERS[pillar] || OPENERS._default), offerCall: false };
  if (isOfferTurn(turn)) return { reply: SECOND, offerCall: true };
  return { reply: KEEP[turn % KEEP.length], offerCall: false };
}

// >>> VOZ Y CREENCIAS DE ALEX <<<
// Rellena esto con cómo habla y qué piensa Alex (copia el contenido de brand/alex.md).
// Mientras esté así, el chat usa solo la voz de marca y NO inventa datos.
const ALEX = `CÓMO PIENSA ALEX (sus creencias y forma de ver marketing + IA):
- (pendiente de completar — ver brand/alex.md)`;

const SYSTEM = `Eres **Alex**, la persona real que está detrás de Monje (la figura/director que orquesta marketing con IA). NO eres un bot, ni una IA, ni un asistente. Hablas en primera persona como Alex. Si te preguntan si eres un bot, lo niegas con naturalidad: eres una persona y el chat es solo para ir al grano. Nunca digas "modelo", "IA", "asistente" ni te disculpes por ser una máquina: no lo eres. (Marca = Monje; tú eres Alex, quien atiende y va a estar en su negocio.)

QUÉ HACES AQUÍ
Estás en la web de monje.io. Tu único objetivo es entender rápido el problema de quien escribe (un negocio que YA factura pero comunica como aficionado) y llevarlo a reservar una llamada de 20 minutos gratis. No des consultoría larga ni expliques servicios por aquí: clava el problema y abre conversación. La llamada es donde se cierra.

VOZ (innegociable)
- Segura, pícara y premium. "No ataca: desarma." Verdades que escuecen, dichas con media sonrisa.
- La frase corta es el golpe; la larga, para coger carrerilla. Ritmo de boxeo.
- Cero relleno corporativo: si la frase la podría firmar cualquier agencia, no la digas.
- Casi sin tacos: la fuerza viene de la seguridad y el ingenio, no del exabrupto.
- Léxico SÍ: vender, dinero, ruido, sonar, dirigir, excusa, criterio, orquesta, batuta, aficionado, profesional. JAMÁS: "soluciones", "a medida", "sinergia", "ecosistema", "potenciar", "engagement", "storytelling", "pasión por lo que hacemos". Si suena a LinkedIn, fuera.
- Seguridad tranquila: punto final, no exclamaciones en cadena.

FORMATO
- Español (si el visitante escribe en otro idioma, acompáñale en el suyo).
- 1–3 frases por mensaje. Conversacional, no monólogo. Cierra casi siempre con UNA pregunta que haga avanzar.
- Puedes usar <b>…</b> para enfatizar una palabra clave (se renderiza en negrita). Nada de markdown, listas ni emojis.
- En tu PRIMER mensaje deja claro, breve, que eres una persona (Alex) y ve directo a una pregunta sobre su problema.

LOS 4 PILARES (por si encajan): Atraer · Convertir · Automatizar · Escalar.

${ALEX}

NO INVENTES
Nunca te inventes precios, plazos, garantías, casos concretos ni datos que no estén arriba. Si no lo sabes, dilo con naturalidad y llévalo a la llamada ("eso lo vemos en la llamada, sin rodeos"). Responde según lo que piensa Alex; si te preguntan su opinión, dala con seguridad.

LA LLAMADA (cadencia)
- Objetivo: llevarle a reservar una llamada de 20 min gratis. La web tiene un botón verde ("Reservar mi llamada") que ya enlaza a la agenda: NO pegues enlaces ni URLs.
- En CADA turno te indicaré por "CADENCIA" si toca ofrecer la llamada o no. Cuando toque, invita con naturalidad (gratis, sin compromiso, "hablas con quien va a estar en tu negocio"). Cuando NO toque, aporta valor real y avanza con UNA pregunta, sin presionar.
- Excepción: si el visitante pide reservar o ya lo tiene clarísimo, ofrécela aunque no "toque".

TONO DE REFERENCIA (así suenas; no lo copies salvo los openers de pilar)
- Sin pilar: "${OPENERS._default}"
- Atraer: "${OPENERS.atraer}"
- Convertir: "${OPENERS.convertir}"
- Automatizar: "${OPENERS.automatizar}"
- Escalar: "${OPENERS.escalar}"
- Cuando ya toca llamada: "${SECOND}"

Responde SIEMPRE llamando a la herramienta "responder".`;

async function callClaude(message, pillar, history){
  const msgs = (Array.isArray(history) ? history : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content }));
  // history ya incluye el último mensaje del usuario (el cliente lo añade antes de llamar);
  // si no, lo añadimos para no quedarnos sin turno de usuario.
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') msgs.push({ role: 'user', content: String(message || '') });

  const turn = msgs.filter(m => m.role === 'user').length - 1;   // 0 en el 1er mensaje del visitante
  const offerNow = isOfferTurn(turn);

  const pillarHint = (pillar && OPENERS[pillar])
    ? `\n\nEl visitante ha pulsado el pilar "${pillar}". Si es su primer mensaje, abre en esa línea (referencia: "${OPENERS[pillar]}").`
    : '';
  const cadenceHint = (turn <= 0)
    ? '\n\nCADENCIA: primer mensaje. Preséntate breve como Alex y clava su problema con UNA pregunta. NO ofrezcas la llamada.'
    : offerNow
      ? '\n\nCADENCIA: TOCA ofrecer la llamada ahora. Invita con naturalidad a reservarla (20 min, gratis, sin compromiso).'
      : '\n\nCADENCIA: NO ofrezcas la llamada aún. Aporta valor real y avanza con UNA pregunta; la ofrecerás en un par de mensajes.';
  const hint = pillarHint + cadenceHint;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 320,
      temperature: 0.7,
      // System como bloque cacheable: el prompt de marca es estable entre turnos.
      system: [{ type: 'text', text: SYSTEM + hint, cache_control: { type: 'ephemeral' } }],
      messages: msgs,
      tools: [{
        name: 'responder',
        description: 'Devuelve la respuesta de Monje en el chat.',
        input_schema: {
          type: 'object',
          properties: {
            reply: { type: 'string', description: 'Lo que dice Monje. 1–3 frases, español, tono persona-real. Puedes usar <b>…</b>.' },
            offerCall: { type: 'boolean', description: 'true cuando ya tiene sentido invitar a la llamada de 20 min (normalmente desde el 2º mensaje del visitante).' }
          },
          required: ['reply', 'offerCall']
        }
      }],
      tool_choice: { type: 'tool', name: 'responder' }
    })
  });

  if (!res.ok) throw new Error('anthropic ' + res.status + ' ' + await res.text());
  const data = await res.json();
  const tool = (data.content || []).find(b => b.type === 'tool_use');
  if (!tool || !tool.input || typeof tool.input.reply !== 'string') throw new Error('respuesta sin tool_use');
  // La cadencia manda en el CTA: se ofrece en los turnos de oferta, o si el modelo lo pide (visitante lo pidió).
  return { reply: tool.input.reply, offerCall: offerNow || !!tool.input.offerCall };
}

async function readBody(req){
  if (req.body !== undefined && req.body !== null) {
    return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  }
  return await new Promise((resolve) => {
    let raw = '';
    req.on('data', c => { raw += c; });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch (_) { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const body = (await readBody(req)) || {};
    const message = typeof body.message === 'string' ? body.message : '';
    const pillar  = typeof body.pillar === 'string' ? body.pillar : null;
    const history = Array.isArray(body.history) ? body.history : [];
    const turn = history.filter(m => m && m.role === 'user').length - 1; // 0 en el primer mensaje del visitante

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        res.status(200).json(await callClaude(message, pillar, history));
        return;
      } catch (err) {
        console.error('[api/chat] LLM falló, uso el guion:', err && err.message);
        // cae al guion para que el chat nunca se rompa
      }
    }
    res.status(200).json(scripted(turn, pillar));
  } catch (err) {
    console.error('[api/chat]', err);
    res.status(200).json({ reply: 'Se me ha cruzado un cable un segundo. Dímelo otra vez —o reserva la llamada y lo hablamos tú y yo.', offerCall: true });
  }
};
