import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  ChevronRight, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Sparkles,
  ShoppingBag,
  Undo2,
  Redo2,
  Languages,
  ShieldCheck,
  Lock,
  Star,
  Phone,
  Twitter,
  Facebook,
  Instagram,
  MessageCircle,
  Mail,
  MapPin,
  User,
  Heart
} from 'lucide-react';
import { MockupProject, Language } from './types';
import { PRODUCT_TEMPLATES, BOUTIQUE_PRESETS } from './constants';
import { generateMockup, refineMockup } from './services/geminiService';
import VoiceAssistant from './components/VoiceAssistant';

const translations = {
  en: {
    lab: "Premium AI Fashion Suite",
    archive: "Couture Collections",
    preOrder: "Reserve Collection",
    identity: "01. Brand Identity",
    uploadLogo: "Secure Logo/Face Upload",
    changeLogo: "Update Identity",
    selection: "02. Garment Selection",
    environment: "03. Campaign Setting",
    envPlaceholder: "Describe your high-end setting (e.g., 'Parisian loft at sunset')...",
    developing: "Rendering Couture...",
    generate: "Launch Campaign",
    refining: "Mastering Aesthetics",
    refiningDesc: "Enhancing fabric, skin, and cinematic lighting...",
    export: "Export Masterfile",
    preparing: "Processing High-Res...",
    masterpiece: "Identity Secured",
    masterpieceDesc: "Upload your logo or base image to generate an international luxury campaign.",
    smartRefinement: "AMNA Smart Refinement",
    refinementPlaceholder: "Voice or text refinement (e.g., 'Add golden hour glow')",
    presets: "Boutique Presets",
    privacy: "Privacy Policy",
    terms: "Secure Terms",
    sustainability: "Ethical AI",
    contact: "Consultation",
    brandName: "AMNA",
    verified: "Identity Verified",
    contactInfo: "Jumaa Muhaimeed +90 534 829 2352",
    share: "Share Creation",
    twitter: "Twitter",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
    instagram: "Instagram",
    copyrightTitle: "Property Rights & Information",
    copyrightDesc: "This platform and its systems are protected by intellectual property laws. All rights reserved to Jumaa Muhaimeed © 2025. Copying or reproducing any part of this site without prior written permission is prohibited.",
    owner: "Founder",
    email: "Email",
    phone: "Phone",
    location: "Location",
    locationValue: "Turkey",
    socialConnect: "Social Connect",
    signature: "Designed and programmed with great care to provide the best user experience while ensuring the highest standards of security and privacy.",
    brandProtection: "AMNA - Protected by Jumaa Muhaimeed",
    sharePrompt: "Download image to share on Instagram"
  },
  ar: {
    lab: "مجموعة أزياء الذكاء الاصطناعي الفاخرة",
    archive: "مجموعات الكوتور",
    preOrder: "احجز مجموعتك",
    identity: "٠١. هوية العلامة",
    uploadLogo: "رفع شعار أو صورة آمنة",
    changeLogo: "تحديث الهوية",
    selection: "٠٢. اختيار القطعة",
    environment: "٠٣. إعداد الحملة",
    envPlaceholder: "صف الإعداد الفاخر (مثلاً: 'شقة باريسية عند الغروب')...",
    developing: "جاري تطوير الرؤية...",
    generate: "إطلاق الحملة",
    refining: "إتقان الجماليات",
    refiningDesc: "تحسين الأقمشة، البشرة، والإضاءة السينمائية...",
    export: "تصدير الملف النهائي",
    preparing: "معالجة دقة الطباعة...",
    masterpiece: "الهوية محمية",
    masterpieceDesc: "ارفع شعارك أو صورتك الأساسية لإنشاء حملة أزياء عالمية فاخرة.",
    smartRefinement: "تحسين أمنة الذكي",
    refinementPlaceholder: "تحسين صوتي أو نصي (مثلاً: 'أضف توهج الغروب')",
    presets: "قوالب البوتيك",
    privacy: "سياسة الخصوصية",
    terms: "الشروط الأمنية",
    sustainability: "ذكاء اصطناعي أخلاقي",
    contact: "استشارة",
    brandName: "أمنة",
    verified: "تم التحقق من الهوية",
    contactInfo: "جمعة محيميد ٠٥٣٤٨٢٩٢٣٥٢",
    share: "مشاركة الإبداع",
    twitter: "تويتر",
    facebook: "فيسبوك",
    whatsapp: "واتساب",
    instagram: "إنستقرام",
    copyrightTitle: "حقوق الملكية والمعلومات الشخصية",
    copyrightDesc: "هذا الموقع وأنظمته محمية بموجب قوانين حقوق الملكية الفكرية. جميع الحقوق محفوظة لصالح جمعة محيميد © ٢٠٢٥. يحظر نسخ أو إعادة إنتاج أي جزء من هذا الموقع دون إذن كتابي مسبق.",
    owner: "المؤسس",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    location: "الموقع",
    locationValue: "تركيا",
    socialConnect: "تواصل اجتماعي",
    signature: "تم التصميم والبرمجة بعناية فائقة لتقديم أفضل تجربة مستخدم مع ضمان أعلى معايير الأمان والخصوصية.",
    brandProtection: "أمنة - حماية وتطوير: جمعة محيميد",
    sharePrompt: "قم بتنزيل الصورة لمشاركتها على إنستغرام"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];

  const [project, setProject] = useState<MockupProject>({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Amna Collection',
    logo: null,
    productType: 't-shirt',
    generatedImageUrl: null,
    status: 'idle',
  });

  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [prompt, setPrompt] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProject(prev => ({ ...prev, logo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!project.logo) return;
    setProject(prev => ({ ...prev, status: 'generating' }));
    try {
      const template = PRODUCT_TEMPLATES.find(temp => temp.id === project.productType);
      const result = await generateMockup(project.logo, template?.name.en || project.productType, prompt);
      setProject(prev => ({ ...prev, generatedImageUrl: result, status: 'completed' }));
      setHistory([result]);
      setHistoryIndex(0);
    } catch (err) {
      console.error(err);
      setProject(prev => ({ ...prev, status: 'error' }));
    }
  };

  const handleRefine = useCallback(async (refinePrompt: string) => {
    if (!project.generatedImageUrl) return;
    setProject(prev => ({ ...prev, status: 'generating' }));
    try {
      const result = await refineMockup(project.generatedImageUrl, refinePrompt);
      const newHistory = [...history.slice(0, historyIndex + 1), result];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setProject(prev => ({ ...prev, generatedImageUrl: result, status: 'completed' }));
    } catch (err) {
      console.error(err);
      setProject(prev => ({ ...prev, status: 'error' }));
    }
  }, [project.generatedImageUrl, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const imageUrl = history[newIndex];
      setHistoryIndex(newIndex);
      setProject(prev => ({ ...prev, generatedImageUrl: imageUrl }));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const imageUrl = history[newIndex];
      setHistoryIndex(newIndex);
      setProject(prev => ({ ...prev, generatedImageUrl: imageUrl }));
    }
  };

  const handleExport = () => {
    if (!project.generatedImageUrl) return;
    setIsExporting(true);
    const link = document.createElement('a');
    link.href = project.generatedImageUrl;
    link.download = `amna-campaign-${project.id}.png`;
    link.click();
    setTimeout(() => setIsExporting(false), 2000);
  };

  const shareOnSocial = (platform: string) => {
    const text = `Experience the AMNA luxury campaign. #Amna #LuxuryFashion #AI`;
    const url = window.location.href;
    let shareUrl = '';

    switch(platform) {
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'whatsapp': shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`; break;
      case 'instagram': alert(t.sharePrompt); return;
      case 'tiktok': window.open('https://tiktok.com/@halabi_4_4', '_blank'); return;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen bg-white text-[#0A0A0A] font-light ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Security Bar */}
      <div className="bg-black text-white py-2 px-8 text-[10px] flex justify-between items-center tracking-widest uppercase font-semibold">
        <div className="flex items-center gap-2">
          <Lock size={10} className="text-[#C5A059]" />
          <span>{t.verified}</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="tel:+905348292352" className="flex items-center gap-1.5 hover:text-[#C5A059] transition-colors">
            <Phone size={10} /> +90 534 829 2352
          </a>
          <span className="hidden sm:inline">جمعة محيميد</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-neutral-100 py-8 px-8 sticky top-0 bg-white/95 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-luxury-gradient rounded-full flex items-center justify-center text-[#C5A059] shadow-2xl border border-white/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="serif text-4xl font-bold tracking-tighter text-black leading-none mb-1">{t.brandName}</h1>
              <p className="text-[9px] tracking-[0.4em] font-bold uppercase text-[#C5A059]">{t.lab}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="text-[11px] font-bold uppercase tracking-widest hover:text-[#C5A059] transition-all"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <button className="px-8 py-3 bg-black text-white text-[11px] uppercase tracking-widest font-bold hover:bg-[#1A1A1A] transition-all rounded-full flex items-center gap-2 shadow-xl">
              <ShoppingBag size={14} />
              {t.preOrder}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 space-y-12">
          <section className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden">
            <h2 className={`text-xs font-bold uppercase tracking-[0.3em] mb-8 text-[#C5A059] flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Lock size={12} /> {t.identity}
            </h2>
            <div className="relative group">
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`aspect-square rounded-2xl border transition-all duration-700 flex flex-col items-center justify-center p-8 bg-white ${
                project.logo ? 'border-black' : 'border-dashed border-neutral-200 group-hover:border-[#C5A059]'
              }`}>
                {project.logo ? (
                  <div className="relative w-full h-full">
                    <img src={project.logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <>
                    <Upload className="text-neutral-200 mb-6" size={40} strokeWidth={1} />
                    <p className="text-[11px] font-semibold text-neutral-400 text-center uppercase tracking-widest leading-loose">{t.uploadLogo}</p>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className={`text-xs font-bold uppercase tracking-[0.3em] mb-8 text-[#C5A059] flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <ImageIcon size={12} /> {t.selection}
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {PRODUCT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setProject(prev => ({ ...prev, productType: template.id }))}
                  className={`p-6 rounded-2xl border transition-all duration-500 ${isRtl ? 'text-right' : 'text-left'} relative overflow-hidden ${
                    project.productType === template.id 
                      ? 'border-black bg-black text-white scale-[1.02] shadow-2xl' 
                      : 'border-neutral-100 bg-neutral-50 hover:bg-white hover:border-[#C5A059]'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-2">{template.name[lang]}</p>
                  <p className={`text-[10px] leading-relaxed opacity-60`}>
                    {template.description[lang]}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100">
            <h2 className={`text-xs font-bold uppercase tracking-[0.3em] mb-8 text-[#C5A059] flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Sparkles size={12} /> {t.environment}
            </h2>
            <div className="space-y-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.envPlaceholder}
                className={`w-full h-32 p-6 text-[13px] bg-white border border-neutral-100 rounded-2xl focus:outline-none focus:border-[#C5A059] transition-all resize-none placeholder:text-neutral-300 ${isRtl ? 'text-right' : 'text-left'}`}
              />
              <button
                onClick={handleGenerate}
                disabled={!project.logo || project.status === 'generating'}
                className="w-full py-5 bg-black text-white text-[11px] uppercase tracking-[0.3em] font-bold rounded-2xl disabled:opacity-30 hover:bg-[#C5A059] transition-all flex items-center justify-center gap-4"
              >
                {project.status === 'generating' ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {project.status === 'generating' ? t.developing : t.generate}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Preview & Editor */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex-1 min-h-[600px] bg-neutral-50 rounded-[40px] overflow-hidden relative border border-neutral-100 shadow-2xl">
            {project.status === 'generating' && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl z-20 flex flex-col items-center justify-center text-center p-12 animate-in fade-in duration-700">
                <div className="w-16 h-16 border-t-2 border-[#C5A059] rounded-full animate-spin mb-10" />
                <h3 className="serif text-4xl italic mb-4 text-black">{t.refining}</h3>
                <p className="text-[10px] text-[#C5A059] uppercase tracking-[0.4em] font-bold">{t.refiningDesc}</p>
              </div>
            )}

            {project.generatedImageUrl ? (
              <div className="w-full h-full relative group">
                <img src={project.generatedImageUrl} alt="Amna Campaign" className="w-full h-full object-cover animate-in fade-in duration-1000" />
                
                <div className="absolute top-8 inset-inline-start-8 bg-black/90 backdrop-blur-xl text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold border border-white/10 flex items-center gap-3">
                  <ShieldCheck size={14} className="text-[#C5A059]" /> {t.verified}
                </div>

                <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <button onClick={undo} className="p-5 bg-white text-black rounded-full shadow-2xl hover:bg-black hover:text-white transition-all"><Undo2 size={20}/></button>
                      <button onClick={redo} className="p-5 bg-white text-black rounded-full shadow-2xl hover:bg-black hover:text-white transition-all"><Redo2 size={20}/></button>
                    </div>
                    <button onClick={handleExport} className="flex items-center gap-4 px-10 py-5 bg-white text-black text-[11px] uppercase tracking-[0.3em] font-bold rounded-full shadow-2xl hover:scale-105 transition-all">
                      <Download size={20} /> {t.export}
                    </button>
                  </div>
                  <div className="flex gap-4 justify-center bg-white/20 backdrop-blur-2xl p-4 rounded-full self-center border border-white/10">
                    {['twitter', 'facebook', 'whatsapp', 'instagram'].map(p => (
                      <button key={p} onClick={() => shareOnSocial(p)} className={`w-12 h-12 social-badge-${p} rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 shadow-lg`}>
                        {p === 'twitter' && <Twitter size={20}/>}
                        {p === 'facebook' && <Facebook size={20}/>}
                        {p === 'whatsapp' && <MessageCircle size={20}/>}
                        {p === 'instagram' && <Instagram size={20}/>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-16">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-10 shadow-sm">
                  <ImageIcon size={48} strokeWidth={0.5} className="text-[#C5A059]" />
                </div>
                <h3 className="serif text-4xl mb-6 text-black italic tracking-tighter">{t.masterpiece}</h3>
                <p className="max-w-md text-[10px] leading-loose uppercase tracking-[0.3em] text-neutral-400 font-bold">{t.masterpieceDesc}</p>
                <div className="mt-12 flex gap-4">
                  <div className="px-6 py-2 rounded-full border border-neutral-100 bg-white text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><Lock size={10}/> SSL ENCRYPTED</div>
                  <div className="px-6 py-2 rounded-full border border-neutral-100 bg-white text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={10}/> IDENTITY SHIELD</div>
                </div>
              </div>
            )}
          </div>

          {project.generatedImageUrl && (
            <div className="mt-12 p-10 bg-neutral-50 rounded-[32px] border border-neutral-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-black flex items-center gap-3">
                  <Sparkles size={16} className="text-[#C5A059]" /> {t.smartRefinement}
                </h3>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.refinementPlaceholder}
                  className={`w-full pl-8 pr-16 py-5 bg-white border border-neutral-200 rounded-2xl text-[13px] focus:outline-none focus:border-black transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRefine(e.currentTarget.value); }}
                />
                <button onClick={() => { const input = document.querySelector('input[type="text"]') as HTMLInputElement; if (input.value) handleRefine(input.value); }} className={`absolute top-1/2 -translate-y-1/2 p-4 text-[#C5A059] hover:text-black transition-all ${isRtl ? 'left-2' : 'right-2'}`}>
                  <ChevronRight size={24} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer & Copyright - Preserved but updated for Amna */}
      <footer className="mt-32">
        <div className="copyright-pattern py-32 px-10 text-center text-white">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="inline-flex items-center gap-6 px-10 py-3 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20">
              <Lock size={20} className="text-[#C5A059]"/>
              <h3 className="text-sm font-bold tracking-[0.5em] uppercase">{t.copyrightTitle}</h3>
            </div>
            
            <p className="text-2xl leading-relaxed max-w-4xl mx-auto opacity-80 serif italic">
              {t.copyrightDesc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 border-t border-white/10">
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-[0.4em] opacity-40">{t.owner}</div>
                <div className="text-xl font-bold">جمعة محيميد</div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-[0.4em] opacity-40">{t.email}</div>
                <div className="text-lg font-bold">Gum3aapoahmad@gmail.com</div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-[0.4em] opacity-40">{t.phone}</div>
                <div className="text-xl font-bold">+90 534 829 2352</div>
              </div>
            </div>

            <div className="pt-20 space-y-10">
              <p className="text-xs tracking-[0.2em] opacity-60 leading-relaxed font-medium italic">{t.signature}</p>
              <div className="text-[10px] uppercase tracking-[0.6em] opacity-40">© 2025 {t.brandName} WORLDWIDE</div>
              <div className="flex items-center justify-center gap-4 text-[#C5A059] font-bold text-xs tracking-widest uppercase">
                <Heart size={16} className="fill-[#C5A059]"/> {t.brandProtection}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <VoiceAssistant onRefine={handleRefine} />
    </div>
  );
};

export default App;