import React, { useState } from 'react';
import { generateHighQualityImage, editWoodImage } from '../services/geminiService';

export default function AIStudio() {
  const [tab, setTab] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const image = await generateHighQualityImage(prompt);
      setGeneratedImage(image);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage || !editPrompt.trim()) return;
    setLoading(true);
    try {
      const base64 = generatedImage.split(',')[1];
      const editedImage = await editWoodImage(base64, editPrompt);
      if (editedImage) {
        setGeneratedImage(editedImage);
        setEditPrompt('');
      }
    } catch (error) {
      console.error('Edit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20">
      <h2 className="display-font text-5xl font-bold mb-6 italic text-[#1a241e]">
        AI Studio
      </h2>
      <p className="text-gray-600 mb-12 max-w-2xl">
        Generer vakre bilder av ved og fyringsscener ved hjelp av AI. Perfekt for markedsføring og inspirasjon.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Generator */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setTab('generate')}
              className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                tab === 'generate'
                  ? 'bg-[#1a241e] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Generer
            </button>
            <button
              onClick={() => setTab('edit')}
              className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                tab === 'edit'
                  ? 'bg-[#1a241e] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              disabled={!generatedImage}
            >
              Rediger
            </button>
          </div>

          {tab === 'generate' && (
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Beskriv bildet du vil generere... f.eks. 'Premium bjørkeved stakket i en vakker bjørkskog'"
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a241e] resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-3 bg-[#1a241e] text-white rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Genererer...' : 'Generer bilde'}
              </button>
            </div>
          )}

          {tab === 'edit' && generatedImage && (
            <div className="space-y-4">
              <textarea
                value={editPrompt}
                onChange={e => setEditPrompt(e.target.value)}
                placeholder="Hva vil du endre på bildet?"
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a241e] resize-none"
              />
              <button
                onClick={handleEdit}
                disabled={loading || !editPrompt.trim()}
                className="w-full py-3 bg-[#1a241e] text-white rounded-lg font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Redigerer...' : 'Rediger bilde'}
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex items-center justify-center">
          {generatedImage ? (
            <img
              src={generatedImage}
              alt="Generated or edited image"
              className="w-full h-auto rounded-2xl"
            />
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-lg font-semibold mb-2">Ingen bilde generert ennå</p>
              <p className="text-sm">Skriv en beskrivelse og generer ditt første bilde</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
