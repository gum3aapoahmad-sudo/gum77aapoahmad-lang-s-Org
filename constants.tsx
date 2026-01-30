
import { ProductTemplate } from './types';

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    id: 't-shirt',
    name: { en: 'Oversized Premium Tee', ar: 'تيشيرت فاخر واسع' },
    description: { en: 'Secure cotton blend, minimalist lighting.', ar: 'مزيج قطني آمن، إضاءة بسيطة.' },
    baseImage: 'https://picsum.photos/seed/tee/800/1000'
  },
  {
    id: 'hoodie',
    name: { en: 'Luxury Heavyweight Hoodie', ar: 'هودي فاخر ثقيل' },
    description: { en: 'Winter campaign, architectural background.', ar: 'حملة شتوية، خلفية معمارية.' },
    baseImage: 'https://picsum.photos/seed/hoodie/800/1000'
  },
  {
    id: 'tote-bag',
    name: { en: 'Canvas Gallery Tote', ar: 'حقيبة قماشية للمعارض' },
    description: { en: 'Texture focus, professional gallery setting.', ar: 'تركيز على الملمس، إعداد معرض احترافي.' },
    baseImage: 'https://picsum.photos/seed/tote/800/1000'
  },
  {
    id: 'premium-bottle',
    name: { en: 'Matte Glass Vessel', ar: 'وعاء زجاجي مطفي' },
    description: { en: 'Luxury finish, champagne branding.', ar: 'لمسات فاخرة، علامة تجارية شامبين.' },
    baseImage: 'https://picsum.photos/seed/bottle/800/1000'
  }
];

export const BOUTIQUE_PRESETS = [
  { id: 'pajama', name: { en: 'Kids Pajama Campaign', ar: 'حملة بيجاما أطفال' }, prompt: "Child model walking with confidence, sunset light, urban blurred background, centered logo." },
  { id: 'winter', name: { en: 'Urban Winter Look', ar: 'مظهر شتوي حضري' }, prompt: "Child in urban street, walking motion, golden hour lighting, jacket logo patch." },
  { id: 'vest', name: { en: 'Stage Luxury Vest', ar: 'صديري مسرحي فاخر' }, prompt: "Vest on stage platform, velvet curtains, focused spotlight, gold logo tag." },
  { id: 'denim', name: { en: 'Lifestyle Denim', ar: 'جينز لايف ستايل' }, prompt: "Child model sitting on ladder, urban wall background, leather logo patch." }
];

export const APP_MODELS = {
  IMAGE: 'gemini-2.5-flash-image',
  PRO_IMAGE: 'gemini-3-pro-image-preview',
  VOICE: 'gemini-2.5-flash-native-audio-preview-12-2025',
  TEXT: 'gemini-3-flash-preview',
};
