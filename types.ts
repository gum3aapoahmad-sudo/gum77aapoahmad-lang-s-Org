
export type Language = 'en' | 'ar';

export interface MockupProject {
  id: string;
  name: string;
  logo: string | null;
  productType: ProductType;
  generatedImageUrl: string | null;
  status: 'idle' | 'generating' | 'completed' | 'error';
}

export type ProductType = 't-shirt' | 'hoodie' | 'mug' | 'tote-bag' | 'poster' | 'premium-bottle';

export interface ProductTemplate {
  id: ProductType;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  baseImage: string;
}

export interface VoiceMessage {
  role: 'user' | 'model';
  text: string;
}
