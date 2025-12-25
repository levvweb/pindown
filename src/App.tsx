import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, Image as ImageIcon, Film, AlertCircle, X, ExternalLink, Github, Clipboard, Check, ArrowRight } from 'lucide-react';
import type { PinterestData } from './services/pinterest';
import { downloadPinterest, downloadMedia } from './services/pinterest';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<PinterestData | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await downloadPinterest(url.trim());
      setData(result);
      if (result.images.length === 0 && result.videos.length === 0) {
        setError('No downloadable media found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (mediaUrl: string, type: string, index: number) => {
    setDownloadingIndex(index);
    const ext = type === 'video' ? 'mp4' : 'jpg';
    const filename = `pin_${data?.id || 'media'}_${index + 1}.${ext}`;
    await downloadMedia(mediaUrl, filename);
    setTimeout(() => setDownloadingIndex(null), 1000);
  };

  const totalMedia = data ? data.images.length + data.videos.length : 0;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-red-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 text-white fill-current">
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.43l1.28-5.43s-.33-.66-.33-1.63c0-1.53.89-2.67 2-2.67.94 0 1.4.7 1.4 1.55 0 .95-.6 2.36-.91 3.67-.26 1.1.55 2 1.63 2 1.96 0 3.46-2.06 3.46-5.04 0-2.63-1.89-4.47-4.59-4.47-3.13 0-4.97 2.35-4.97 4.77 0 .95.36 1.96.82 2.51a.33.33 0 0 1 .08.31l-.31 1.24c-.05.2-.16.24-.37.14-1.39-.65-2.26-2.68-2.26-4.32 0-3.52 2.56-6.75 7.38-6.75 3.87 0 6.88 2.76 6.88 6.44 0 3.85-2.43 6.95-5.8 6.95-1.13 0-2.2-.59-2.56-1.29l-.7 2.66c-.25.97-1.11 2.45-1.65 3.28A12 12 0 1 0 12 0z" />
                </svg>
              </div>
            </div>
            <span className="font-semibold tracking-tight">PinDown</span>
          </div>

          <a
            href="https://github.com/levvweb/pindown"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
          >
            <Github className="w-[18px] h-[18px]" />
          </a>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 px-4 py-8 md:py-16">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-10"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-[11px] font-medium bg-zinc-800/80 text-zinc-400 rounded-full border border-zinc-700/50">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-subtle" />
              Free & Open Source
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-3">
              Pinterest Downloader
            </h1>
            <p className="text-zinc-500 text-sm md:text-base max-w-md mx-auto">
              Download gambar dan video Pinterest dalam kualitas tinggi. Tanpa watermark, tanpa login.
            </p>
          </motion.div>

          {/* Input */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <div className={`flex items-center gap-1 p-1.5 bg-zinc-900 border rounded-xl transition-all ${loading ? 'border-red-600/50' : 'border-zinc-800 focus-within:border-zinc-700'
                }`}>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Pinterest URL..."
                  className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm md:text-base px-3 py-2.5 md:py-3 focus:outline-none min-w-0"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={loading}
                  className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg transition-all ${pasteSuccess
                    ? 'bg-green-600/20 text-green-500'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                    }`}
                >
                  {pasteSuccess ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="shrink-0 h-10 px-4 md:px-5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden md:inline">Download</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.form>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-950/50 border border-red-900/50 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError('')} className="shrink-0 p-1 hover:bg-red-900/30 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {data && totalMedia > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 md:mt-8"
              >
                {/* Stats */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-3">
                    {data.author?.avatar && (
                      <img src={data.author.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-zinc-800" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{data.author?.name || 'Pinterest'}</p>
                      <p className="text-xs text-zinc-600">{totalMedia} file{totalMedia > 1 ? 's' : ''} found</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    {data.images.length > 0 && <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" />{data.images.length}</span>}
                    {data.videos.length > 0 && <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" />{data.videos.length}</span>}
                  </div>
                </div>

                {/* Media List */}
                <div className="space-y-2">
                  {data.videos.map((video, index) => (
                    <motion.div
                      key={`v-${index}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex items-center gap-3 p-2.5 md:p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl transition-all"
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-black shrink-0 relative">
                        <video src={video.url} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                            <Film className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded uppercase tracking-wide">Video</span>
                          {video.width && video.height && (
                            <span className="text-[10px] text-zinc-600">{video.width}×{video.height}</span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">pinterest.com</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDownload(video.url, 'video', index)}
                          disabled={downloadingIndex === index}
                          className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                        >
                          {downloadingIndex === index ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden md:inline">{downloadingIndex === index ? 'Done' : 'Download'}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {data.images.map((image, index) => {
                    const realIndex = data.videos.length + index;
                    return (
                      <motion.div
                        key={`i-${index}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: realIndex * 0.05 }}
                        className="group flex items-center gap-3 p-2.5 md:p-3 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700/50 rounded-xl transition-all"
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-black shrink-0">
                          <img src={image.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded uppercase tracking-wide">
                              {image.type === 'gif' ? 'GIF' : 'Image'}
                            </span>
                            {image.width && image.height && (
                              <span className="text-[10px] text-zinc-600">{image.width}×{image.height}</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate">pinterest.com</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDownload(image.url, 'image', realIndex)}
                            disabled={downloadingIndex === realIndex}
                            className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                          >
                            {downloadingIndex === realIndex ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden md:inline">{downloadingIndex === realIndex ? 'Done' : 'Download'}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty */}
          {!loading && !data && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-16 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Download className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-zinc-600 text-sm">Paste link untuk mulai</p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>© 2025 𝐋𝐞𝐯𝐢 𝐒𝐞𝐭𝐢𝐚𝐝𝐢. Open Source.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/levvweb/pindown" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <span className="text-zinc-800">•</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
