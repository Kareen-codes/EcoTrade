import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  SparklesIcon,
  CameraIcon,
  CubeTransparentIcon,
  LightBulbIcon,
  PhotographIcon,
  RefreshIcon,
  ChevronDoubleRightIcon,
  ExclamationCircleIcon,
  BanIcon,
  SparklesIcon as SparklesSolid,
} from "@heroicons/react/solid";
import useScrollReveal from "../hooks/useScrollReveal";
import { getApiUrl } from "../config/api";

/**
 * EcoMate Playground — test drive the AI classification service.
 *
 * Upload (or drag & drop / paste) a photo of a recyclable item or artwork and
 * the backend forwards it to the FastAPI classifier, which answers with:
 *   { isRecyclable, category, qualityScore, estimatedPrice, confidence?, explanation? }
 *
 * Client behaviour mirrors the Next.js playground this page was ported from:
 *  - 5MB / image-type validation happens in the browser AND on the server.
 *  - A preview thumbnail is shown before sending.
 *  - Results are presented on a structured card (category, quality gauge,
 *    estimated Nigerian market price in naira).
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // mirrors the FastAPI service's own limit
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const CATEGORY_META = {
  plastic: { label: "Plastic", emoji: "🥤", tint: "bg-blue-50 text-blue-700" },
  metal: { label: "Metal", emoji: "🥫", tint: "bg-gray-100 text-gray-700" },
  e_waste: { label: "E-Waste", emoji: "🔌", tint: "bg-purple-50 text-purple-700" },
  glass: { label: "Glass", emoji: "🍾", tint: "bg-teal-50 text-teal-700" },
  rubber: { label: "Rubber", emoji: "🛞", tint: "bg-yellow-50 text-yellow-700" },
  artwork: { label: "Artwork", emoji: "🖼️", tint: "bg-pink-50 text-pink-700" },
  non_recyclable: { label: "Non-Recyclable", emoji: "🗑️", tint: "bg-red-50 text-red-700" },
};

const formatNaira = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `₦${num.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
};

const qualityTone = (score) => {
  if (score >= 90) return { label: "Excellent", color: "text-green-600", bar: "bg-green-500" };
  if (score >= 70) return { label: "Good", color: "text-lime-600", bar: "bg-lime-500" };
  if (score >= 50) return { label: "Average", color: "text-yellow-600", bar: "bg-yellow-500" };
  if (score >= 30) return { label: "Poor", color: "text-orange-600", bar: "bg-orange-500" };
  return { label: "Very Poor", color: "text-red-600", bar: "bg-red-500" };
};

const PlaygroundPage = () => {
  useScrollReveal();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const inputRef = useRef(null);
  const previewUrlRef = useRef(null);

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const acceptFile = (candidate) => {
    if (!candidate) return;
    if (!candidate.type.startsWith("image/")) {
      setError("That doesn't look like an image. Please choose a photo of an item.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setError("Image exceeds maximum size of 5MB.");
      return;
    }
    setError("");
    setResult(null);
    setStatus("idle");
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(candidate);
    previewUrlRef.current = url;
    setFile(candidate);
    setPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handlePaste = (e) => {
    const item = Array.from(e.clipboardData?.items || []).find((i) =>
      i.type.startsWith("image/")
    );
    if (item) {
      const pasted = item.getAsFile();
      if (pasted) acceptFile(pasted);
    }
    e.preventDefault();
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async () => {
    if (!file || status === "analyzing") return;
    setStatus("analyzing");
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file, file.name || "snapshot.jpg");

      const res = await fetch(getApiUrl("playground/classify"), {
        method: "POST",
        body: formData,
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.error || `Classification failed (${res.status}).`);
      }

      setResult(payload);
      setStatus("done");
    } catch (err) {
      // "Failed to fetch" means the API server itself isn't reachable
      // (e.g. preview running without the backend) — explain that clearly.
      const message =
        err instanceof TypeError
          ? "The classification backend isn't reachable from this preview. Once FASTAPI_CLASSIFIER_URL (and GEMINI_API_KEY) are configured on the API server, scans will work live."
          : err.message || "Something went wrong. Please try again.";
      setError(message);
      setStatus("error");
    }
  };

  const handleReset = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setStatus("idle");
  };

  const categoryInfo = result ? CATEGORY_META[result.category] || null : null;
  const quality = result ? qualityTone(Number(result.qualityScore) || 0) : null;
  const priceValue = result ? Number(result.estimatedPrice) : NaN;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-10 reveal">
          <span className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold">
            <SparklesIcon className="w-4 h-4" />
            AI Playground
          </span>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Scan it. <span className="text-green-600 dark:text-green-400">Know it.</span> Value it.
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Upload a photo of any recyclable item or recycled artwork and EcoMate AI
            will identify it, score its quality, and estimate its Nigerian market value.
          </p>
        </div>

        {/* Upload / preview / result flow */}
        <div className="reveal">
          {!preview ? (
            /* ---------- Drop zone ---------- */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
              }}
              className={`relative border-2 border-dashed rounded-3xl p-12 md:p-16 text-center cursor-pointer transition-all bg-white dark:bg-gray-800 ${
                isDragging
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 scale-[1.01]"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-gray-700/50"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  acceptFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-green-500/25 mb-5">
                <PhotographIcon className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Drop an image here, or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                JPG, PNG, WebP or GIF — up to 5MB. You can also paste from clipboard (Ctrl+V).
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-medium">
                {["Plastic", "Metal", "E-Waste", "Glass", "Rubber", "Artwork"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-green-50 dark:bg-gray-700 text-green-700 dark:text-green-300 border border-green-100 dark:border-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* ---------- Preview + analysis ---------- */
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="grid md:grid-cols-2">
                {/* Image side */}
                <div className="relative bg-gray-100 dark:bg-gray-900 min-h-[280px]">
                  <img
                    src={preview}
                    alt="Selected item"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  {status !== "analyzing" && (
                    <button
                      onClick={handleReset}
                      aria-label="Choose a different image"
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 shadow transition-colors"
                    >
                      <BanIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Action / result side */}
                <div className="p-7 md:p-9 flex flex-col">
                  {status === "idle" && (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Ready when you are
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                        Our AI will check whether the item is recyclable, place it in a
                        category, estimate its condition, and price it in naira.
                      </p>
                      <button
                        onClick={handleAnalyze}
                        className="mt-auto inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25"
                      >
                        <SparklesIcon className="w-5 h-5" />
                        Analyze with EcoMate AI
                      </button>
                    </>
                  )}

                  {status === "analyzing" && (
                    <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
                        <SparklesSolid className="w-6 h-6 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Analyzing your image…
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Identifying material, scoring quality, estimating price.
                      </p>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="flex flex-col flex-1">
                      <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-2xl p-4 mb-5">
                        <ExclamationCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
                            Classification failed
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                        </div>
                      </div>
                      <div className="mt-auto flex gap-3">
                        <button
                          onClick={handleAnalyze}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        >
                          <RefreshIcon className="w-4 h-4" />
                          Try again
                        </button>
                        <button
                          onClick={handleReset}
                          className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          New image
                        </button>
                      </div>
                    </div>
                  )}

                  {status === "done" && result && (
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold">
                          ✓ Analysis complete
                        </span>
                      </div>

                      {/* Category */}
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Category
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {categoryInfo ? `${categoryInfo.emoji} ${categoryInfo.label}` : result.category || "Unknown"}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            result.isRecyclable
                              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          }`}
                        >
                          {result.isRecyclable ? "Recyclable" : "Not recyclable"}
                        </span>
                      </div>

                      {/* Quality */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Quality score
                          </p>
                          <p className={`text-sm font-bold ${quality.color}`}>
                            {result.qualityScore}/100 — {quality.label}
                          </p>
                        </div>
                        <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${quality.bar} transition-all duration-700`}
                            style={{ width: `${Math.max(0, Math.min(100, Number(result.qualityScore) || 0))}%` }}
                          />
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl p-4 mb-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Estimated market value
                          </p>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            {Number.isNaN(priceValue) ? "—" : formatNaira(priceValue)}
                          </p>
                        </div>
                        <CubeTransparentIcon className="w-9 h-9 text-green-500/70" />
                      </div>

                      {result.explanation && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                          {result.explanation}
                        </p>
                      )}

                      <div className="mt-auto flex gap-3 pt-2">
                        <button
                          onClick={handleReset}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                        >
                          <PhotographIcon className="w-4 h-4" />
                          Scan another item
                        </button>
                        <Link
                          to="/"
                          className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Back to home
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Inline error for rejected files */}
          {error && !preview && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <ExclamationCircleIcon className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-16 grid sm:grid-cols-3 gap-6">
          {[
            {
              Icon: CameraIcon,
              tint: "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
              title: "Snap & Upload",
              description: "Take a clear photo of the item — drag, drop, browse or paste it in.",
            },
            {
              Icon: CubeTransparentIcon,
              tint: "bg-teal-50 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300",
              title: "AI Identifies It",
              description: "EcoMate AI classifies the material and scores its quality from 0–100.",
            },
            {
              Icon: LightBulbIcon,
              tint: "bg-amber-50 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
              title: "Know Its Value",
              description: "Get an instant Nigerian market price estimate in naira for the item.",
            },
          ].map(({ Icon, tint, title, description }, i) => (
            <div
              key={i}
              className="reveal bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-md border border-gray-100 dark:border-gray-700"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tint}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center reveal">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Like what you see? Join EcoMate to trade what you scan.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25"
          >
            Get Started Free
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PlaygroundPage;
