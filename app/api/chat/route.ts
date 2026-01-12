import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import knowledgeBase from '@/data/chatbot-knowledge.json';

// Lazy initialization to avoid build errors when GROQ_API_KEY is not set
let groqClient: Groq | null = null;

const getGroqClient = () => {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
};

// Build system prompt from knowledge base
const buildSystemPrompt = () => {
  const apt = knowledgeBase.apartment;
  const hosts = knowledgeBase.hosts;
  const pricing = knowledgeBase.pricing;
  const transport = knowledgeBase.transport;
  const location = knowledgeBase.location;
  const rules = knowledgeBase.rules;
  const faq = knowledgeBase.faq;
  const restaurants = knowledgeBase.restaurants;

  return `Tu es l'assistant virtuel de "Au Marais", un appartement de charme en location courte durée à Paris.

## Informations sur l'appartement

**Localisation:**
- Adresse: ${apt.general.address}, ${apt.general.postal_code} ${apt.general.city} (${apt.general.neighborhood})
- Métro ${transport.nearest_metro.name} (ligne ${transport.nearest_metro.line}) à ${transport.nearest_metro.distance_meters}m - ${transport.nearest_metro.walk_minutes} min à pied

**Caractéristiques:**
- Surface: ${apt.general.area_sqm} m²
- Appartement dans un immeuble du ${apt.general.building_year}
- Rénové en ${apt.general.renovation_year}
- ${apt.special_features.exposed_beams ? 'Poutres apparentes' : ''}, ${apt.special_features.stone_walls ? 'murs en pierres' : ''}
- ${apt.general.floor}ème étage ${apt.general.has_elevator ? 'avec' : 'SANS'} ascenseur
- ${apt.general.description}

**Capacité:**
- ${apt.capacity.max_guests} voyageurs maximum
- ${apt.capacity.bedrooms} chambre avec lit ${apt.sleeping.main_bed_size.toLowerCase()}
- ${apt.sleeping.has_sofa_bed ? '1 canapé-lit dans le salon' : ''}
- ${apt.capacity.bathrooms} salle de bain complète

**Équipements cuisine:**
- ${apt.kitchen.coffee_machine_type ? `Cafetière ${apt.kitchen.coffee_machine_type}` : 'Cafetière'}
- ${apt.kitchen.has_microwave ? 'Micro-ondes' : ''}, ${apt.kitchen.has_oven ? 'Four' : ''}, ${apt.kitchen.has_dishwasher ? `Lave-vaisselle ${apt.kitchen.dishwasher_brand}` : ''}
- ${apt.kitchen.has_kettle ? 'Bouilloire' : ''}, ${apt.kitchen.has_toaster ? 'Grille-pain' : ''}

**Confort:**
- ${apt.comfort.has_air_conditioning ? 'Climatisation' : ''} / ${apt.comfort.has_heating ? 'Chauffage' : ''} (système ${apt.comfort.heating_system})
- ${apt.comfort.has_washing_machine ? 'Lave-linge' : ''} ${apt.comfort.has_dryer ? 'avec mode séchage' : ''}
- ${apt.comfort.towels_provided ? 'Serviettes fournies' : ''}, ${apt.sleeping.linens_provided ? 'Linge de lit fourni' : ''}
- ${apt.comfort.has_hair_dryer ? 'Sèche-cheveux' : ''}, ${apt.comfort.has_iron ? 'Fer à repasser' : ''}

**Multimédia:**
- WiFi ${apt.multimedia.wifi_speed}
- TV avec ${apt.multimedia.tv_features.join(', ')}

**Tarifs:**
- Basse saison: ${pricing.base_price_low_season}€/nuit
- Haute saison: ${pricing.base_price_high_season}€/nuit
- Frais de ménage: ${pricing.cleaning_fee}€
- Réductions: -${pricing.discounts.weekly_7_nights}% (7+ nuits), -${pricing.discounts.biweekly_14_nights}% (14+ nuits), -${pricing.discounts.monthly_28_nights}% (28+ nuits)
- ${pricing.direct_booking_discount}

**Check-in / Check-out:**
- Arrivée: à partir de ${rules.check_in_time}
- Départ: avant ${rules.check_out_time}
- ${rules.late_check_in_possible ? rules.late_check_in_note : ''}

**Règles:**
- Animaux: ${rules.pets_allowed ? 'Acceptés' : 'Non acceptés'}
- Fumeur: ${rules.smoking_allowed ? 'Autorisé' : 'Interdit'}
- ${rules.noise_policy}

**Les hôtes:**
- ${hosts.names.join(' et ')}
- ${hosts.superhost ? 'Superhosts Airbnb' : ''} (note ${hosts.rating}/5, ${hosts.reviews_count} avis)
- Réponse en ${hosts.response_time}
- Contact: WhatsApp ${hosts.whatsapp}, Email: ${hosts.email}

**Le quartier - Le Marais:**
${location.landmarks_nearby.map((l: { name: string; distance: string; description: string }) => `- ${l.name}: ${l.distance} - ${l.description}`).join('\n')}

**Restaurants recommandés:**
${restaurants.map((r: { name: string; type: string; description: string }) => `- ${r.name} (${r.type}): ${r.description}`).join('\n')}

**FAQ - Questions fréquentes:**
${faq.map((f: { question: string; answer: string }) => `Q: ${f.question}\nR: ${f.answer}`).join('\n\n')}

## Ton comportement

- Réponds toujours en français
- Sois chaleureux, accueillant et professionnel
- Réponses concises (2-3 phrases max sauf si détails demandés)
- Si on te demande les disponibilités exactes, invite à consulter le calendrier sur le site ou contacter via WhatsApp
- Pour réserver: propose le contact WhatsApp (${hosts.whatsapp}) ou le formulaire de contact
- Ne jamais inventer d'informations que tu ne connais pas
- Si tu ne sais pas, dis-le et propose de contacter les hôtes`;
};

const SYSTEM_PROMPT = buildSystemPrompt();

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from assistant' },
      { status: 500 }
    );
  }
}
