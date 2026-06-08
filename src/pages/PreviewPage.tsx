import { useState } from 'react';
import { Smartphone, Monitor, RotateCcw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PreviewRenderer } from '@/components/survey/PreviewRenderer';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

export const PreviewPage = () => {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="flex-1 min-h-screen bg-zinc-100">
      <Header />

      <main className="max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-xl font-bold text-zinc-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              样式预览
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              模拟真实答题体验，检查问卷效果
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-zinc-200">
              <button
                onClick={() => setDevice('desktop')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  device === 'desktop'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                )}
              >
                <Monitor className="w-4 h-4" />
                电脑视图
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  device === 'mobile'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                )}
              >
                <Smartphone className="w-4 h-4" />
                手机视图
              </button>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
              重新开始
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          {device === 'mobile' ? (
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[3rem] shadow-2xl" />
              <div className="absolute -inset-2 bg-zinc-950 rounded-[2.5rem]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-950 rounded-b-3xl z-10" />
              <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-inner" style={{ width: '375px', height: '700px' }}>
                <div className="h-full overflow-y-auto">
                  <div className="p-6">
                    <PreviewRenderer key={key} previewMode="mobile" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
              <div className="h-8 bg-zinc-100 flex items-center px-4 gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-8 min-h-[600px]">
                <PreviewRenderer key={key} previewMode="desktop" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
