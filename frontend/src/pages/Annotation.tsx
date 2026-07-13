import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
interface Polygon { id: number; image: number; points: number[][]; type: string; created_at: string; }
interface AnnotatedImage { id: number; image: string; type: string; uploaded_at: string; polygons: Polygon[]; }

export default function Annotation() {
    const token = useAuthStore((state) => state.accessToken);
    const [images, setImages] = useState<AnnotatedImage[]>([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };
    useEffect(() => {
        document.title = 'Annotation Suite';
        return () => {
          document.title = 'VaiRadiology';
        };
      }, []);
    const fetchImages = async () => {
        if (!token) return;
        try {
            const response = await axios.get("https://ntasnim.pythonanywhere.com/api/annotation/images/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setImages(response.data);
        } catch (error) { console.error("Error loading images:", error); }
    };

    useEffect(() => { fetchImages(); }, [token]);

    return (
        <div className="h-screen w-full bg-slate-950 text-white flex flex-col overflow-hidden">
            <header className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-light tracking-tight text-white">VaiRadiology</h1>
                    <p className="text-[9px] text-cyan-400/80 uppercase tracking-[0.24em] mt-0.5">Clinical Annotation Suite</p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => navigate('/tasks')} 
                        className="flex items-center gap-2 bg-cyan-900 text-white px-4 py-1.5 rounded-lg hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 text-sm font-medium"
                    >
                        <LayoutDashboard size={15} />
                        <span>Task Board</span>
                    </button>

                    <div className="w-px h-5 bg-slate-800 mx-1"></div>                
        
                    <button onClick={handleLogout} className="flex items-center space-x-2 text-slate-400 hover:text-white">
                        <LogOut size={16} />
                    </button>
                </div>
            </header>
            
            <main className="flex-1 flex w-full min-h-0 overflow-hidden">
                <div className="w-1/2 h-full border-r border-slate-800">
                    <ViewerPane title="Axial View" viewType="axial" images={images} onUpdate={fetchImages} />
                </div>
                <div className="w-1/2 h-full">
                    <ViewerPane title="Sagittal View" viewType="sagittal" images={images} onUpdate={fetchImages} />
                </div>
            </main>
        </div>
    );
}

function ViewerPane({ title, viewType, images, onUpdate }: { title: string; viewType: string; images: AnnotatedImage[], onUpdate: () => void }) {
    const [sliceIndex, setSliceIndex] = useState(0);
    const [points, setPoints] = useState<number[][]>([]);
    const [isClosed, setIsClosed] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    
    const [imgDims, setImgDims] = useState({ width: 100, height: 100 });
    
    const token = useAuthStore((state) => state.accessToken);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const myImages = images.filter(img => img.type === viewType);
    const currentImage = myImages[sliceIndex];
    const myPolygons = currentImage?.polygons?.filter(p => p.type === viewType) || [];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isHovered || document.activeElement?.tagName === 'INPUT') return;

            if (e.key === "ArrowRight") {
                setSliceIndex(prev => Math.min(prev + 1, Math.max(0, myImages.length - 1)));
            } else if (e.key === "ArrowLeft") {
                setSliceIndex(prev => Math.max(prev - 1, 0));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [myImages.length, isHovered]);

    const savePolygon = async (pointsToSave: number[][]) => {
        if (!currentImage) return;
        try {
            await axios.post("https://ntasnim.pythonanywhere.com/api/annotation/polygons/", 
                { image: currentImage.id, points: pointsToSave, type: viewType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPoints([]); 
            setIsClosed(false); 
            onUpdate(); 
        } catch (err) { alert("Failed to save polygon"); }
    };

    const deleteSpecificPolygon = async (e: React.MouseEvent, polyId: number) => {
        e.stopPropagation(); 
        try {
            await axios.delete(`https://ntasnim.pythonanywhere.com/api/annotation/polygons/${polyId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onUpdate();
        } catch (err) { alert("Failed to delete annotation"); }
    };

    const deleteImage = async () => {
        if (!currentImage) return; 
        try {
            await axios.delete(`https://ntasnim.pythonanywhere.com/api/annotation/images/${currentImage.id}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSliceIndex(0);
            onUpdate();
        } catch (err) { alert("Delete failed"); }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const formData = new FormData();
        formData.append("image", e.target.files[0]);
        formData.append("type", viewType); 

        try {
            await axios.post("https://ntasnim.pythonanywhere.com/api/annotation/images/", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });
            onUpdate();
        } catch (err) { alert("Upload failed"); }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (isClosed) return; 
        const rect = e.currentTarget.getBoundingClientRect();
        
        const xNormalized = (e.clientX - rect.left) / rect.width;
        const yNormalized = (e.clientY - rect.top) / rect.height;

        setPoints([...points, [xNormalized, yNormalized]]);
    };

    const scaleToImageSpace = (pts: number[][]) => {
        return pts.map(p => [p[0] * imgDims.width, p[1] * imgDims.height]);
    };

    const RenderVertices = ({ pts, isDrawing }: { pts: number[][], isDrawing?: boolean }) => {
        const baseRadius = imgDims.width * 0.008;

        return (
            <>
                {pts.map((p, i) => {
                    const isFirstActive = isDrawing && i === 0;
                    const canClose = isFirstActive && pts.length >= 3;

                    return (
                        <g 
                            key={i} 
                            style={{ 
                                pointerEvents: isFirstActive ? "auto" : "none", 
                                cursor: canClose ? "pointer" : (isFirstActive ? "not-allowed" : "default")
                            }}
                            onClick={(e) => {
                                if (canClose) {
                                    e.stopPropagation(); 
                                    setIsClosed(true);
                                    savePolygon(points); // Saves the raw 0-1 values array directly
                                } else if (isFirstActive) {
                                    e.stopPropagation();
                                }
                            }}
                        >
                            <circle 
                                cx={p[0]} cy={p[1]} 
                                r={canClose ? baseRadius * 1.5 : baseRadius} 
                                fill={canClose ? "#4ade80" : "white"} 
                                className="transition-all duration-200"
                            />
                            <circle cx={p[0]} cy={p[1]} r={baseRadius * 0.3} fill="red" />
                        </g>
                    );
                })}
            </>
        );
    };

    return (
        <div 
            className="flex-1 flex flex-col p-4 h-full min-h-0"
            onMouseEnter={() => setIsHovered(true)} 
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex justify-between items-center mb-2 shrink-0">
                <h2 className="text-sm font-medium text-slate-400">{title}</h2>
                <div className="flex gap-2">
                    <button onClick={() => { setPoints([]); setIsClosed(false); }} className="text-xs bg-orange-900/50 hover:bg-orange-900 px-2 py-1 rounded">Cancel Drawing</button>
                    <button onClick={deleteImage} className="text-xs bg-red-900/50 hover:bg-red-900 px-2 py-1 rounded">Delete Image</button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} accept="image/*" />
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-slate-800 px-2 py-1 rounded">Upload</button>
                    <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="text-xs bg-slate-800 px-2 py-1 rounded">+</button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="text-xs bg-slate-800 px-2 py-1 rounded">-</button>
                </div>
            </div>
            
            <div className="flex-1 min-h-0 bg-black border border-slate-700 rounded relative overflow-hidden flex items-center justify-center p-2">
                {currentImage ? (
                    <div 
                        className="relative cursor-crosshair inline-block max-w-full max-h-full" 
                        style={{ transform: `scale(${zoom})`, transformOrigin: "center" }} 
                        onClick={handleCanvasClick}
                    >
                        <img 
                            src={`https://ntasnim.pythonanywhere.com${currentImage.image}`} 
                            alt="Scan" 
                            className="max-w-full max-h-full block pointer-events-none select-none" 
                            draggable={false}
            
                            onLoad={(e) => setImgDims({
                                width: e.currentTarget.naturalWidth,
                                height: e.currentTarget.naturalHeight
                            })}
                        />
                        
                        <svg 
                            className="absolute inset-0 w-full h-full" 
                            viewBox={`0 0 ${imgDims.width} ${imgDims.height}`}
                            style={{ pointerEvents: points.length > 0 ? "none" : "auto" }}
                        >
                            {myPolygons.map((poly, idx) => {
                                const scaledSavedPoints = scaleToImageSpace(poly.points);
                                return (
                                    <g key={`saved-${idx}`}>
                                        <polygon 
                                            points={scaledSavedPoints.map(p => `${p[0]},${p[1]}`).join(" ")} 
                                            fill="red" 
                                            fillOpacity="0.15" 
                                            stroke="red" 
                                            strokeWidth={imgDims.width * 0.003} 
                                            className="cursor-pointer hover:fill-red-500 hover:fill-opacity-40 transition-all"
                                            onClick={(e) => deleteSpecificPolygon(e, poly.id)}
                                        />
                                        <RenderVertices pts={scaledSavedPoints} />
                                    </g>
                                );
                            })}

                            {isClosed && (
                                <polygon 
                                    points={scaleToImageSpace(points).map(p => `${p[0]},${p[1]}`).join(" ")} 
                                    fill="red" 
                                    fillOpacity="0.15" 
                                    stroke="red" 
                                    strokeWidth={imgDims.width * 0.003} 
                                    className="pointer-events-none"
                                />
                            )}

                            <RenderVertices pts={scaleToImageSpace(points)} isDrawing={true} />
                        </svg>
                    </div>
                ) : <div className="text-slate-600">No images</div>}
            </div>

            <div className="mt-4 flex items-center gap-4 shrink-0">
                <input 
                    type="range" 
                    min="0" 
                    max={Math.max(0, myImages.length - 1)} 
                    value={sliceIndex} 
                    onChange={(e) => setSliceIndex(Number(e.target.value))} 
                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">
                    {myImages.length > 0 ? `Image ${sliceIndex + 1} / ${myImages.length}` : "No images"}
                </span>
            </div>
        </div>
    );
}