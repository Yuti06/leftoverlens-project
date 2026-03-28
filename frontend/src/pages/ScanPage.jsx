import React, { useState, useRef, useCallback } from "react";
import { Camera, Upload, ArrowLeft, X, Loader, AlertCircle, Image } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ScanPage({ onAnalysisComplete, onBack }) {
  const [mode, setMode] = useState("choose"); // choose | camera | preview
  const [preview, setPreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      setStream(mediaStream);
      setMode("camera");
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 100);
    } catch (err) {
      setError("Camera access denied. Please allow camera access or upload a photo instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setMode("choose");
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(dataUrl);
    setImageData(dataUrl);
    stopCamera();
    setMode("preview");
  }, [stopCamera]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setImageData(ev.target.result);
      setMode("preview");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!imageData) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
      const mediaType = imageData.match(/^data:(image\/\w+)/)?.[1] || "image/jpeg";

      const res = await fetch(`${API_BASE}/api/analyze/base64`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const data = await res.json();
      if (!data.ingredients?.length) {
        throw new Error("No food items detected. Try a clearer photo with better lighting.");
      }
      onAnalysisComplete(data);
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [imageData, onAnalysisComplete]);

  const reset = useCallback(() => {
    stopCamera();
    setPreview(null);
    setImageData(null);
    setError(null);
    setMode("choose");
  }, [stopCamera]);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom: 24, paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{
        fontFamily: "var(--font-display)",
        fontSize: "2.2rem",
        color: "var(--forest)",
        marginBottom: 8,
      }}>
        Scan your ingredients
      </h1>
      <p style={{ color: "var(--smoke)", marginBottom: 32, lineHeight: 1.6 }}>
        Take a photo of your fridge, counter, or any ingredients you'd like to use. Try to get good lighting for best results.
      </p>

      {error && (
        <div style={{
          background: "#fde8e0",
          border: "1px solid #f4b8a0",
          borderRadius: "var(--radius)",
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          color: "var(--rust)",
          fontSize: "0.9rem",
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          {error}
        </div>
      )}

      {/* Choose mode */}
      {mode === "choose" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              border: "2px dashed var(--border)",
              borderRadius: "var(--radius-xl)",
              padding: "48px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              background: "var(--cream)",
            }}
          >
            <div style={{
              width: 80, height: 80,
              background: "white",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "var(--shadow)",
            }}>
              <Image size={36} color="var(--moss)" />
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontWeight: 500, color: "var(--ink)", marginBottom: 6 }}>
                Take or upload a photo
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--smoke)" }}>
                Open fridge door, place items on a clean surface, or any angle that shows the ingredients clearly
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <button
                onClick={startCamera}
                className="btn btn-primary"
                style={{ borderRadius: 40 }}
              >
                <Camera size={18} /> Use Camera
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ borderRadius: 40 }}
              >
                <Upload size={18} /> Upload Photo
              </button>
            </div>
          </div>

          <div style={{
            padding: "12px 16px",
            background: "var(--parchment)",
            borderRadius: "var(--radius)",
            fontSize: "0.82rem",
            color: "var(--smoke)",
            fontFamily: "var(--font-mono)",
          }}>
            💡 Tips: Good lighting · Include labels if possible · Closer is better for small items
          </div>
        </div>
      )}

      {/* Camera view */}
      {mode === "camera" && (
        <div style={{ position: "relative" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              borderRadius: "var(--radius-lg)",
              background: "#000",
              display: "block",
              maxHeight: "60vh",
              objectFit: "cover",
            }}
          />
          <div style={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 16,
          }}>
            <button
              onClick={stopCamera}
              className="btn"
              style={{ background: "rgba(0,0,0,0.6)", color: "white", borderRadius: 40 }}
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={capturePhoto}
              style={{
                width: 64, height: 64,
                borderRadius: "50%",
                border: "4px solid white",
                background: "white",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {mode === "preview" && (
        <div>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                borderRadius: "var(--radius-lg)",
                display: "block",
                maxHeight: "60vh",
                objectFit: "cover",
              }}
            />
            <button
              onClick={reset}
              className="btn"
              style={{
                position: "absolute", top: 12, right: 12,
                background: "rgba(0,0,0,0.6)",
                color: "white",
                borderRadius: 40,
                padding: "6px 14px",
                fontSize: "0.85rem",
              }}
            >
              <X size={14} /> Retake
            </button>
          </div>

          <button
            onClick={analyzeImage}
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "1rem", borderRadius: 40 }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                Analyzing ingredients...
              </>
            ) : (
              <>
                <Camera size={18} />
                Detect ingredients
              </>
            )}
          </button>

          {loading && (
            <p style={{
              textAlign: "center", marginTop: 12,
              color: "var(--smoke)", fontSize: "0.85rem",
              fontFamily: "var(--font-mono)",
            }}>
              AI is identifying your ingredients — takes ~5 seconds
            </p>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>
  );
}
