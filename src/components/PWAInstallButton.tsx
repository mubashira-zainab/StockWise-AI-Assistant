/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  variant?: 'button' | 'sidebar' | 'banner';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not iOS, we can still provide a helpful install guide button in sidebar/settings
  const canPrompt = isInstallable || isIOS;

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#0F172A] hover:bg-[#1E293B] border border-slate-800 rounded-lg transition-colors group"
          title="Install StockWise AI as a native app on desktop or mobile"
        >
          <span className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
            <span>Install Web App</span>
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl text-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
                <p>1. Tap the <strong className="text-white">Share</strong> icon in the Safari toolbar at the bottom.</p>
                <p>2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</p>
                <p>3. Tap <strong className="text-white">Add</strong> in the top right corner.</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-2 text-xs font-medium text-white transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Header button variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 rounded-lg transition-colors whitespace-nowrap"
      >
        {installSuccess ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Installed</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </>
        )}
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#0F172A] border border-slate-800 p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>1. Tap the <strong className="text-white">Share</strong> icon in the Safari toolbar at the bottom.</p>
              <p>2. Scroll down and select <strong className="text-white">Add to Home Screen</strong>.</p>
              <p>3. Tap <strong className="text-white">Add</strong> in the top right corner.</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-lg bg-blue-600 hover:bg-blue-500 py-2 text-xs font-medium text-white transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
