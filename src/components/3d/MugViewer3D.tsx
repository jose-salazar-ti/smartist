"use client";
import React, { useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture, useGLTF, Center, Environment } from "@react-three/drei";
import * as THREE from "three";

// Suppress known THREE.Clock deprecation warning from @react-three/fiber internals
if (typeof console !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
      return;
    }
    originalWarn(...args);
  };
}

interface MugViewer3DProps {
  textureUrl: string | null;
  baseColor?: string;
  modelUrl?: string;
  wrapMode?: "center" | "both-sides" | "full-wrap";
}

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Canvas Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          padding: "24px",
          background: "var(--bg-card, #fef2f2)",
          borderRadius: "12px",
          textAlign: "center",
        }}>
          {/* Title */}
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "14px", color: "var(--text-primary, #1e293b)" }}>
              No se pudo cargar el Visor 3D
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              WebGL no disponible o error de red
            </p>
            <p style={{ margin: "10px 0 0", fontSize: "11px", color: "red", maxWidth: "80%", wordBreak: "break-all" }}>
              {this.state.error?.message || String(this.state.error)}
            </p>
          </div>

          {/* Mobile instruction — visible only on small screens via CSS class */}
          <div className="viewer3d-error-mobile" style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}>
            <span style={{ fontSize: "22px" }}>👆</span>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--primary, #6366f1)" }}>
              Desliza hacia abajo para recargar
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted, #94a3b8)" }}>
              (Pull to refresh desde el inicio de la página)
            </p>
          </div>

          {/* Desktop instruction — visible only on large screens via CSS class */}
          <div className="viewer3d-error-desktop" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                background: "var(--primary, #6366f1)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              🔄 Recargar página
            </button>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted, #94a3b8)" }}>
              También puedes presionar{" "}
              <kbd style={{ background: "var(--bg-dark-3,#f1f5f9)", padding: "1px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "11px", border: "1px solid var(--border,#e2e8f0)" }}>Ctrl</kbd>
              {" + "}
              <kbd style={{ background: "var(--bg-dark-3,#f1f5f9)", padding: "1px 6px", borderRadius: "4px", fontFamily: "monospace", fontSize: "11px", border: "1px solid var(--border,#e2e8f0)" }}>F5</kbd>
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


/** Animated loading overlay shown while the 3D model & WebGL shaders compile */
function Viewer3DLoadingFallback() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      background: "transparent",
      zIndex: 5,
    }}>
      {/* Spinning dual-ring with mug emoji */}
      <div style={{ position: "relative", width: "72px", height: "72px" }}>
        {/* Outer spinner ring */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "3px solid rgba(99,102,241,0.15)",
          borderTopColor: "var(--primary, #6366f1)",
          borderRightColor: "var(--primary, #6366f1)",
          animation: "spin3d 1.1s linear infinite",
        }} />
        {/* Inner counter-spinner ring */}
        <div style={{
          position: "absolute",
          inset: "10px",
          borderRadius: "50%",
          border: "2px solid rgba(165,180,252,0.2)",
          borderTopColor: "var(--primary-light, #a5b4fc)",
          animation: "spin3d 0.8s linear infinite reverse",
        }} />
        {/* Center mug icon */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          animation: "pulse3d 1.5s ease-in-out infinite",
        }}>
          ☕
        </div>
      </div>

      {/* Labels */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          margin: 0,
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text-primary, #1e293b)",
          letterSpacing: "0.3px",
        }}>
          Cargando Visor 3D
        </p>
        <p style={{
          margin: "4px 0 0",
          fontSize: "11px",
          color: "var(--text-muted, #94a3b8)",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
        }}>
          Preparando tu taza...
        </p>
      </div>

      {/* Bouncing dot progress */}
      <div style={{ display: "flex", gap: "6px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--primary, #6366f1)",
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}


function GLBMugModelInner({ textureUrl, baseColor = "#ffffff", modelUrl = "/models/mug.glb", wrapMode = "center" }: MugViewer3DProps) {
  const { scene } = useGLTF(modelUrl) as any;
  const transparentPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  
  const designTexture = useTexture(textureUrl || transparentPixel);

  const blendedTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 384;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [baseColor]);

  React.useEffect(() => {
    const canvas = blendedTexture.image;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (designTexture.image) {
      const img = designTexture.image as any;
      const isTemplate = Math.abs((img.width / img.height) - (1024 / 384)) < 0.02;
      
      if (isTemplate) {
        // Direct draw of pre-composed template to preserve 20cm x 9.5cm sublimation proportions
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else if (wrapMode === "both-sides") {
        // Double side logo layout (left centered at 256, right centered at 768)
        const targetHeight = canvas.height * 0.70; // Increased logo size for better presence
        const aspectRatio = img.width / img.height;
        const targetWidth = targetHeight * aspectRatio;
        // Perfectly centered vertically
        const y = (canvas.height - targetHeight) / 2; 
        
        // Left side
        const x1 = 256 - targetWidth / 2;
        ctx.drawImage(img, x1, y, targetWidth, targetHeight);
        
        // Right side
        const x2 = 768 - targetWidth / 2;
        ctx.drawImage(img, x2, y, targetWidth, targetHeight);
      } else if (wrapMode === "full-wrap") {
        // Full Panoramic Wrap 20cm x 9.5cm centered on the canvas (Ratio: 2.105)
        const printHeight = canvas.height;
        const printWidth = printHeight * (20 / 9.5); // 384 * 2.105 = ~808px
        const printX = (canvas.width - printWidth) / 2; // 108px margin next to handle on both sides
        
        // Scale and crop the image inside the print area to avoid stretching (object-cover math)
        const imgRatio = img.width / img.height;
        const printRatio = printWidth / printHeight;
        
        let drawWidth = printWidth;
        let drawHeight = printHeight;
        let drawX = printX;
        let drawY = 0;
        
        if (imgRatio > printRatio) {
          drawWidth = printHeight * imgRatio;
          drawX = printX + (printWidth - drawWidth) / 2;
        } else {
          drawHeight = printWidth / imgRatio;
          drawY = (printHeight - drawHeight) / 2;
        }
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(printX, 0, printWidth, printHeight);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
      } else {
        // Centered single photo (default dedication style)
        const targetHeight = canvas.height * 0.9;
        const aspectRatio = img.width / img.height;
        const targetWidth = targetHeight * aspectRatio;
        const x = 512 - targetWidth / 2;
        // Perfectly centered vertically
        const y = (canvas.height - targetHeight) / 2;
        ctx.drawImage(img, x, y, targetWidth, targetHeight);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    blendedTexture.needsUpdate = true;
  }, [designTexture, baseColor, blendedTexture, wrapMode]);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    return clone;
  }, [scene]);

  const scaleFactor = useMemo(() => {
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 2.4 / size.y : 1;
  }, [scene]);

  useMemo(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(baseColor),
          map: blendedTexture,
          roughness: 0.08,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });

        child.material.onBeforeCompile = (shader: any) => {
          shader.vertexShader = shader.vertexShader.replace(
            "void main() {",
            `varying vec3 vLocalPosition;
            void main() {
              vLocalPosition = position;`
          );

          shader.fragmentShader = "varying vec3 vLocalPosition;\n" + shader.fragmentShader;

          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <map_fragment>",
            `#ifdef USE_MAP
              float dist = length(vLocalPosition.xz);
              bool isOutsideCylinder = (dist >= 14.2 && dist <= 15.3 && vLocalPosition.x <= 15.1 && vLocalPosition.y >= 1.0 && vLocalPosition.y <= 34.0);
              
              vec4 sampledDiffuseColor;
              if (isOutsideCylinder) {
                float u_tex = vMapUv.y / 9.424778 + 0.5;
                float v_tex = (vMapUv.x + 0.1) / -3.3;
                
                if (u_tex >= 0.0 && u_tex <= 1.0 && v_tex >= 0.0 && v_tex <= 1.0) {
                  vec4 rawTex = texture2D(map, vec2(u_tex, v_tex));
                  // Convert sRGB texture color to Linear space to fix washed-out "claro" colors
                  sampledDiffuseColor = vec4(pow(rawTex.rgb, vec3(2.2)), rawTex.a);
                } else {
                  sampledDiffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
              } else {
                sampledDiffuseColor = vec4(1.0, 1.0, 1.0, 1.0);
              }
              
              diffuseColor *= sampledDiffuseColor;
            #endif`
          );
        };
      }
    });
  }, [clonedScene, blendedTexture]);

  React.useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material.color.set(baseColor);
      }
    });
  }, [clonedScene, baseColor]);

  React.useEffect(() => {
    return () => {
      clonedScene.traverse((child: any) => {
        if (child.isMesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
      blendedTexture.dispose();
    };
  }, [clonedScene, blendedTexture]);

  return (
    <group position={[0, 0, 0]}>
      <Center>
        <primitive 
          object={clonedScene} 
          rotation={[0, -Math.PI / 2, 0]}
          scale={[scaleFactor, scaleFactor, scaleFactor]}
        />
      </Center>
    </group>
  );
}

const decryptionCache = new Map<string, string>();
const decryptionPromises = new Map<string, Promise<string>>();

function useDecryptedUrl(url: string): string {
  if (url.endsWith(".glb")) {
    return url;
  }
  if (decryptionCache.has(url)) return decryptionCache.get(url)!;
  if (!decryptionPromises.has(url)) {
    const promise = fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const view = new Uint8Array(buffer);
        const KEY = 42;
        for (let i = 0; i < view.length; i++) {
          view[i] ^= KEY;
        }
        const blob = new Blob([view], { type: 'model/gltf-binary' });
        const blobUrl = URL.createObjectURL(blob);
        decryptionCache.set(url, blobUrl);
        return blobUrl;
      })
      .catch(e => {
        console.error("Error decrypting model:", e);
        throw e;
      });
    decryptionPromises.set(url, promise);
  }
  throw decryptionPromises.get(url);
}

function GLBMugModel({ textureUrl, baseColor = "#ffffff", modelUrl = "/models/asset_core_01.dat", wrapMode = "center" }: MugViewer3DProps) {
  const decryptedUrl = useDecryptedUrl(modelUrl);

  return (
    <GLBMugModelInner
      textureUrl={textureUrl}
      baseColor={baseColor}
      modelUrl={decryptedUrl}
      wrapMode={wrapMode}
    />
  );
}

export default function MugViewer3D({ textureUrl, baseColor, modelUrl, wrapMode = "center" }: MugViewer3DProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isAppleDevice, setIsAppleDevice] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent;
      const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || 
        (navigator.maxTouchPoints > 0 && /Intel Mac/i.test(ua));
      const isApple = /Macintosh|MacIntel|iPad|iPhone|iPod/i.test(ua);
      
      setIsMobile(isMobileDevice);
      setIsAppleDevice(isApple);
    }
  }, []);

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      style={{ width: "100%", height: "100%", cursor: "grab", borderRadius: "12px", overflow: "hidden", background: "transparent", position: "relative" }}
    >
      <CanvasErrorBoundary>
        {/* Show animated loader while Canvas + GLB + shaders are compiling */}
        <Suspense fallback={<Viewer3DLoadingFallback />}>
          <Canvas 
            camera={{ position: [0, 1.8, 4.0], fov: 45 }} 
            dpr={isMobile ? 1 : (isAppleDevice ? 1.5 : [1, 1.5])}
            gl={{ 
              alpha: true, 
              antialias: !isMobile, 
              powerPreference: "high-performance",
              precision: isMobile ? "mediump" : "highp"
            }}
          >
            <Suspense fallback={null}>
              {!isMobile && <Environment preset="studio" />}
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 8, 5]} intensity={0.8} />
              <directionalLight position={[-5, 3, 2]} intensity={0.4} />
              <directionalLight position={[0, 5, -5]} intensity={0.4} />
              <GLBMugModel textureUrl={textureUrl} baseColor={baseColor} modelUrl={modelUrl} wrapMode={wrapMode} />
               <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                autoRotate={true}
                autoRotateSpeed={1.5}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2 + 0.05}
                target={[0, 0, 0]}
              />
            </Suspense>
          </Canvas>
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
}
