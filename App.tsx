import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, LoadingOverlay } from './components/ui-elements';
import { editImageWithGemini } from './services/geminiService';
import { ImageHistoryItem, AppStatus } from './types';

type Language = 'en' | 'ar' | 'fr';

const translations = {
  en: {
    title: "IMAGINE WITH ABDO",
    controls: "Edit Controls",
    upload: "1. Upload Image",
    prompt: "2. Tell Gemini what to do",
    magicEdit: "Magic Edit",
    history: "Generation History",
    source: "Source",
    result: "Result",
    placeholder: "e.g., Make a girl wear these shoes on a beach...",
    drop: "Drop image or click to browse",
    change: "Change Photo",
    noImage: "No Image Loaded",
    noImageSub: "Upload a photo to begin the styling magic.",
    tips: "Styling Tips",
    tip1: "Be specific about environment",
    tip2: "Mention styles: 'retro', 'cinematic'",
    tip3: "Add subjects: 'put a cute cat next to it'",
    success: "Image Loaded"
  },
  ar: {
    title: "تخيّل مع عبدو",
    controls: "أدوات التعديل",
    upload: "١. رفع صورة",
    prompt: "٢. أخبر جمناي ماذا يفعل",
    magicEdit: "تعديل سحري",
    history: "سجل الأجيال",
    source: "الأصل",
    result: "النتيجة",
    placeholder: "مثال: اجعل فتاة ترتدي هذا الحذاء على الشاطئ...",
    drop: "اسحب الصورة أو انقر للتصفح",
    change: "تغيير الصورة",
    noImage: "لم يتم تحميل أي صورة",
    noImageSub: "ارفع صورة لبدء السحر.",
    tips: "نصائح التنسيق",
    tip1: "كن دقيقاً بشأن البيئة",
    tip2: "اذكر الأنماط: 'سينمائي' ، 'كلاسيكي'",
    tip3: "أضف عناصر: 'ضع قطة لطيفة بجانبها'",
    success: "تم تحميل الصورة"
  },
  fr: {
    title: "IMAGINE WITH ABDO",
    controls: "Contrôles d'édition",
    upload: "1. Charger une image",
    prompt: "2. Dites à Gemini quoi faire",
    magicEdit: "Édition Magique",
    history: "Historique",
    source: "Source",
    result: "Résultat",
    placeholder: "ex: Faites porter ces chaussures à une fille sur une plage...",
    drop: "Déposez une image ou cliquez pour parcourir",
    change: "Changer la photo",
    noImage: "Aucune image chargée",
    noImageSub: "Téléchargez une photo pour commencer la magie.",
    tips: "Conseils",
    tip1: "Soyez précis sur l'environnement",
    tip2: "Mentionnez les styles : 'rétro', 'cinématique'",
    tip3: "Ajoutez des sujets : 'mettez un chat mignon à côté'",
    success: "Image chargée"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    // Set default prompt based on language
    if (lang === 'ar') setPrompt('اجعل فتاة ترتدي هذا');
    else if (lang === 'fr') setPrompt('Faites porter cela à une fille');
    else setPrompt('Make a girl wear this');
  }, [lang]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage || !prompt) return;

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const base64Data = selectedImage.split(',')[1];
      const editedImageUrl = await editImageWithGemini(base64Data, mimeType, prompt);

      if (editedImageUrl) {
        setResultImage(editedImageUrl);
        setStatus(AppStatus.SUCCESS);
        
        const newItem: ImageHistoryItem = {
          id: Date.now().toString(),
          originalUrl: selectedImage,
          editedUrl: editedImageUrl,
          prompt: prompt,
          timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev]);
      } else {
        throw new Error("No data returned");
      }
    } catch (err: any) {
      setError(err.message || "Error generating image");
      setStatus(AppStatus.ERROR);
    }
  };

  const clearApp = () => {
    setSelectedImage(null);
    setResultImage(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col items-center max-w-6xl mx-auto ${isRtl ? 'arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      <div className="w-full flex justify-end gap-2 mb-6">
        {(['en', 'ar', 'fr'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              lang === l ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <header className="w-full text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4 tracking-tight">
          {t.title}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
        {/* Control Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-sliders-h text-blue-500"></i> {t.controls}
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">{t.upload}</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  selectedImage ? 'border-green-500 bg-green-500/5' : 'border-slate-700 hover:border-blue-500 bg-slate-800/50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                {selectedImage ? (
                  <div className="flex flex-col items-center">
                    <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                    <p className="text-green-400 text-sm font-medium">{t.success}</p>
                    <button className="text-slate-500 text-xs mt-2 hover:text-slate-300 underline">{t.change}</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <i className="fas fa-cloud-upload-alt text-slate-500 text-3xl mb-2"></i>
                    <p className="text-slate-300 text-sm">{t.drop}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-400 mb-2">{t.prompt}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.placeholder}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1 py-3" 
                onClick={handleProcessImage}
                isLoading={status === AppStatus.PROCESSING}
                disabled={!selectedImage || !prompt}
              >
                {t.magicEdit}
              </Button>
              <Button 
                variant="ghost" 
                className="p-3" 
                onClick={clearApp}
              >
                <i className="fas fa-undo"></i>
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <i className="fas fa-exclamation-circle mt-0.5"></i>
                <p>{error}</p>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-blue-500/5 border-blue-500/20">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">{t.tips}</h3>
            <ul className="text-xs space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <i className="fas fa-lightbulb text-yellow-500 mt-0.5"></i>
                {t.tip1}
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-lightbulb text-yellow-500 mt-0.5"></i>
                {t.tip2}
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-lightbulb text-yellow-500 mt-0.5"></i>
                {t.tip3}
              </li>
            </ul>
          </Card>
        </div>

        {/* Viewport Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="relative flex-1 min-h-[500px] flex items-center justify-center p-4 bg-slate-900/50">
            {status === AppStatus.PROCESSING && <LoadingOverlay />}
            
            {!selectedImage && !resultImage ? (
              <div className="text-center p-10">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-image text-slate-600 text-4xl"></i>
                </div>
                <h3 className="text-xl font-medium text-slate-300">{t.noImage}</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                  {t.noImageSub}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">{t.source}</span>
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-square flex items-center justify-center shadow-xl">
                    <img src={selectedImage!} alt="Original" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-widest text-center">{t.result}</span>
                  <div className={`relative rounded-xl overflow-hidden border-2 aspect-square flex items-center justify-center shadow-2xl transition-all duration-500 ${
                    resultImage ? 'border-blue-500/50 bg-black' : 'border-slate-700 border-dashed bg-slate-800/30'
                  }`}>
                    {resultImage ? (
                      <>
                        <img src={resultImage} alt="Edited Result" className="max-w-full max-h-full object-contain animate-in fade-in zoom-in duration-700" />
                        <a 
                          href={resultImage} 
                          download="imagine-with-abdo.png"
                          className={`absolute bottom-4 ${isRtl ? 'left-4' : 'right-4'} bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110`}
                        >
                          <i className="fas fa-download"></i>
                        </a>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <i className="fas fa-magic text-slate-700 text-3xl mb-2"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* History Section */}
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <i className="fas fa-history text-purple-500"></i> {t.history}
            </h3>
            {history.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative aspect-square rounded-lg overflow-hidden border border-slate-700 cursor-pointer hover:border-blue-500 transition-all"
                    onClick={() => {
                      setSelectedImage(item.originalUrl);
                      setResultImage(item.editedUrl);
                      setPrompt(item.prompt);
                    }}
                  >
                    <img src={item.editedUrl} alt="History Result" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <footer className="w-full mt-16 py-8 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
          <span className="font-bold gradient-text">{t.title}</span> &bull; By Abdo
        </p>
      </footer>
    </div>
  );
};

export default App;