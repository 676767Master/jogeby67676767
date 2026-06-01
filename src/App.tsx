/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Edit3, 
  Eye, 
  Save, 
  Plus, 
  Trash2, 
  MapPin, 
  Calendar, 
  Mail, 
  Compass, 
  Clock, 
  Plane, 
  Utensils, 
  Hotel, 
  Anchor, 
  FileText, 
  DollarSign, 
  Play, 
  Check, 
  X, 
  HelpCircle,
  FolderOpen,
  Image as ImageIcon,
  Sliders,
  ChevronRight,
  Info,
  Box,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResumeData, DayItinerary, DayItineraryEvent, LocationDetail } from './types';
import { LUXURY_PRESENTATION_HTML } from './presentationHtml';
import { INITIAL_RESUME_DATA } from './initialData';

// Luxury Mock Videos inspired directly by the video
interface MockVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  placeholderUrl: string;
  videoUrlSimulated: string;
}

const LUXURY_VIDEOS: MockVideo[] = [
  {
    id: 'vid1',
    title: '私人專機豪奢品味 (艙內銅浴舒緩)',
    description: '在極致高空奢豪專機中，配備純金銅質浴缸。窗外是 4 萬英尺的高空雲海，室內是溫熱精油浴與管家隨侍。',
    category: '空航體驗',
    duration: '0:45',
    placeholderUrl: '/src/assets/images/luxury_private_jet_png_1780248573802.png',
    videoUrlSimulated: '高空專機豪華影片串流中...'
  },
  {
    id: 'vid2',
    title: '海景遊艇上的香檳燭光晚宴',
    description: '夕陽餘暉灑落羅馬海岸，於 120 呎私人遊艇甲板享受新鮮伊比 Almas 魚子醬與唐培里儂香檳。',
    category: '遊艇生活',
    duration: '1:12',
    placeholderUrl: '/src/assets/images/luxury_dinner_yacht_png_1780248502037.png',
    videoUrlSimulated: '海景遊艇浪漫影片串流中...'
  },
  {
    id: 'vid3',
    title: '沙漠王國與頂級超跑巡遊之旅',
    description: '埃及與迪拜的宏偉沙丘旁，一列 Bugatti 與 Phantom 超跑狂飆。引擎聲浪迴盪與星光熠熠的營火交織。',
    category: '超跑奔馳',
    duration: '0:58',
    placeholderUrl: '/src/assets/images/luxury_desert_resort_png_1780248527853.png',
    videoUrlSimulated: '埃及沙漠超跑影片串流中...'
  },
  {
    id: 'vid4',
    title: '傑拉什古城湖畔漫步與耀眼光芒',
    description: '漫步在地中海古老遺跡傑拉什的岸邊，落日下古羅馬立柱襯托，男女穿戴極珍 24K 金絲運動鞋悠閒享受。',
    category: '古蹟紀實',
    duration: '1:30',
    placeholderUrl: '/src/assets/images/mediterranean_hypercar_png_1780248548935.png',
    videoUrlSimulated: '傑拉什古典旅程影片串流中...'
  }
];

export default function App() {
  const [data, setData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [mode] = useState<'preview' | 'edit'>('preview');
  
  // States for Gemini Generator
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [generationInfo, setGenerationInfo] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'experiences' | 'itineraries' | 'videos' | 'model3d' | 'presentation'>('itineraries');
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Video Modal State
  const [activeVideo, setActiveVideo] = useState<MockVideo | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [playProgress, setPlayProgress] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    setIsUploadingAvatar(true);
    setGenerationInfo('⏳ 正在上傳圖片至伺服器...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/upload-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64: base64String
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.url) {
            const updated = {
              ...data,
              profile: {
                ...data.profile,
                avatarUrl: result.url
              }
            };
            setData(updated);
            setGenerationInfo('✅ 圖片上傳成功！');
            handleSave(updated);
          } else {
            setGenerationInfo('❌ 圖片上傳失敗');
          }
        } else {
          setGenerationInfo('❌ 上傳發生錯誤');
        }
      } catch (err) {
        console.error('Error uploading avatar:', err);
        setGenerationInfo('❌ 網路或伺服器錯誤');
      } finally {
        setIsUploadingAvatar(false);
        setTimeout(() => setGenerationInfo(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    setIsUploadingVideo(true);
    setGenerationInfo('⏳ 正在上傳影片檔案至伺服器，請稍候...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/upload-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64: base64String
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.url) {
            const updated = {
              ...data,
              profile: {
                ...data.profile,
                uploadedVideoUrl: result.url
              }
            };
            setData(updated);
            setGenerationInfo('✅ 影片已置放上傳成功！現在可於下方直接播放。');
            handleSave(updated);
          } else {
            setGenerationInfo('❌ 影片儲存載入失敗');
          }
        } else {
          setGenerationInfo('❌ 上傳失敗（可能檔案過大）');
        }
      } catch (err) {
        console.error('Error uploading video:', err);
        setGenerationInfo('❌ 網路傳輸或伺服器異常');
      } finally {
        setIsUploadingVideo(false);
        setTimeout(() => setGenerationInfo(''), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  const model3dPhotoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingModel3dPhoto, setIsUploadingModel3dPhoto] = useState<boolean>(false);

  const handleModel3dPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data) return;

    setIsUploadingModel3dPhoto(true);
    setGenerationInfo('⏳ 正在上傳 3D 相關照片，請稍候...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/upload-3d-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64: base64String
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.url) {
            const currentPhotos = data.profile.model3dPhotos || [];
            const updated = {
              ...data,
              profile: {
                ...data.profile,
                model3dPhotos: [...currentPhotos, result.url]
              }
            };
            setData(updated);
            setGenerationInfo('✅ 3D 照片已成功新增！');
            handleSave(updated);
          } else {
            setGenerationInfo('❌ 照片儲存載入失敗');
          }
        } else {
          setGenerationInfo('❌ 照片上傳失敗');
        }
      } catch (err) {
        console.error('Error uploading 3d photo:', err);
        setGenerationInfo('❌ 網路傳輸或伺服器異常');
      } finally {
        setIsUploadingModel3dPhoto(false);
        setTimeout(() => setGenerationInfo(''), 5000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove3dPhoto = (indexToRemove: number) => {
    if (!data) return;
    const currentPhotos = data.profile.model3dPhotos || [];
    const updatedPhotos = currentPhotos.filter((_, idx) => idx !== indexToRemove);
    const updated = {
      ...data,
      profile: {
        ...data.profile,
        model3dPhotos: updatedPhotos
      }
    };
    setData(updated);
    setGenerationInfo('🗑️ 3D 照片已成功刪除');
    handleSave(updated);
    setTimeout(() => setGenerationInfo(''), 3000);
  };

  const handleDownloadPresentation = () => {
    const blob = new Blob([LUXURY_PRESENTATION_HTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Luxury_Itinerary_Presentation.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fetch initial data
  useEffect(() => {
    fetch('/api/resume')
      .then(res => res.json())
      .then((resData: ResumeData) => {
        setData(resData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load resume:', err);
        setIsLoading(false);
      });
  }, []);

  // Simulate progress when video is active
  useEffect(() => {
    let interval: any;
    if (activeVideo && isVideoPlaying) {
      interval = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [activeVideo, isVideoPlaying]);

  // Handle saving data to backend
  const handleSave = async (updatedData = data) => {
    if (!updatedData) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        setGenerationInfo('✅ 所有變更已同步至雲端伺服器！');
        setTimeout(() => setGenerationInfo(''), 4000);
      } else {
        setGenerationInfo('❌ 儲存失敗，請檢查網路連線。');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setGenerationInfo('❌ 伺服器錯誤，無法完成儲存。');
    } finally {
      setIsSaving(false);
    }
  };

  // Profile text change handler
  const handleProfileChange = (key: keyof typeof data.profile, value: string) => {
    if (!data) return;
    const updated = {
      ...data,
      profile: {
        ...data.profile,
        [key]: value
      }
    };
    setData(updated);
  };

  // Add/remove profile tags
  const handleAddTag = () => {
    if (!data) return;
    const tag = prompt('請輸入要新增的標籤/名銜：');
    if (tag) {
      const updated = {
        ...data,
        profile: {
          ...data.profile,
          tags: [...data.profile.tags, tag]
        }
      };
      setData(updated);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    if (!data) return;
    const updated = {
      ...data,
      profile: {
        ...data.profile,
        tags: data.profile.tags.filter((_, idx) => idx !== indexToRemove)
      }
    };
    setData(updated);
  };

  // Experience changes
  const handleExperienceChange = (expId: string, field: keyof LocationDetail, value: any) => {
    if (!data) return;
    const updated = {
      ...data,
      experiences: data.experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, [field]: value };
        }
        return exp;
      })
    };
    setData(updated);
  };

  const handleUpdateExperienceDetail = (expId: string, detailIdx: number, value: string) => {
    if (!data) return;
    const updated = {
      ...data,
      experiences: data.experiences.map(exp => {
        if (exp.id === expId) {
          const updatedDetails = [...exp.details];
          updatedDetails[detailIdx] = value;
          return { ...exp, details: updatedDetails };
        }
        return exp;
      })
    };
    setData(updated);
  };

  const handleAddExperienceDetail = (expId: string) => {
    if (!data) return;
    const updated = {
      ...data,
      experiences: data.experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, details: [...exp.details, '新景點/活動細節'] };
        }
        return exp;
      })
    };
    setData(updated);
  };

  const handleRemoveExperienceDetail = (expId: string, idxToRemove: number) => {
    if (!data) return;
    const updated = {
      ...data,
      experiences: data.experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, details: exp.details.filter((_, idx) => idx !== idxToRemove) };
        }
        return exp;
      })
    };
    setData(updated);
  };

  // Add full new Travel Experience item
  const handleAddNewExperience = () => {
    if (!data) return;
    const newExp: LocationDetail = {
      id: `exp-${Date.now()}`,
      yearMonth: '2025/5',
      title: '豪華旅程活動',
      country: '國家',
      city: '城市',
      details: ['活動景點一', '活動景點二']
    };
    const updated = {
      ...data,
      experiences: [...data.experiences, newExp]
    };
    setData(updated);
  };

  const handleRemoveExperience = (id: string) => {
    if (!data) return;
    const updated = {
      ...data,
      experiences: data.experiences.filter(exp => exp.id !== id)
    };
    setData(updated);
  };

  // Itinerary Changes
  const handleItineraryMetaChange = (dayNum: number, field: 'destination' | 'badge' | 'imageUrl', value: string) => {
    if (!data) return;
    const updated = {
      ...data,
      itineraries: data.itineraries.map(day => {
        if (day.dayNumber === dayNum) {
          return { ...day, [field]: value };
        }
        return day;
      })
    };
    setData(updated);
  };

  const handleEventChange = (dayNum: number, eventId: string, field: keyof DayItineraryEvent, value: any) => {
    if (!data) return;
    const updated = {
      ...data,
      itineraries: data.itineraries.map(day => {
        if (day.dayNumber === dayNum) {
          return {
            ...day,
            events: day.events.map(ev => {
              if (ev.id === eventId) {
                return { ...ev, [field]: value };
              }
              return ev;
            })
          };
        }
        return day;
      })
    };
    setData(updated);
  };

  const handleEventDetailChange = (dayNum: number, eventId: string, detailIdx: number, value: string) => {
    if (!data) return;
    const updated = {
      ...data,
      itineraries: data.itineraries.map(day => {
        if (day.dayNumber === dayNum) {
          return {
            ...day,
            events: day.events.map(ev => {
              if (ev.id === eventId) {
                const updatedDetails = [...ev.details];
                updatedDetails[detailIdx] = value;
                return { ...ev, details: updatedDetails };
              }
              return ev;
            })
          };
        }
        return day;
      })
    };
    setData(updated);
  };

  const handleAddEventDetail = (dayNum: number, eventId: string) => {
    if (!data) return;
    const updated = {
      ...data,
      itineraries: data.itineraries.map(day => {
        if (day.dayNumber === dayNum) {
          return {
            ...day,
            events: day.events.map(ev => {
              if (ev.id === eventId) {
                return { ...ev, details: [...ev.details, '新增描述項目細節'] };
              }
              return ev;
            })
          };
        }
        return day;
      })
    };
    setData(updated);
  };

  const handleRemoveEventDetail = (dayNum: number, eventId: string, idxToRemove: number) => {
    if (!data) return;
    const updated = {
      ...data,
      itineraries: data.itineraries.map(day => {
        if (day.dayNumber === dayNum) {
          return {
            ...day,
            events: day.events.map(ev => {
              if (ev.id === eventId) {
                return { ...ev, details: ev.details.filter((_, idx) => idx !== idxToRemove) };
              }
              return ev;
            })
          };
        }
        return day;
      })
    };
    setData(updated);
  };

  const handleAddEvent = (dayNum: number) => {
    if (!data) return;
    const newEvent: DayItineraryEvent = {
      id: `ev-${Date.now()}`,
      time: '12:00',
      category: '食他',
      title: '頂級奢華美食品鑑食宴',
      details: ['新增頂級餐點細節項目說明', '由私人精選名譽大廚烹飪']
    };
    const updated = {
      ...data,
      itineraries: data.itineraries.map(day => {
        if (day.dayNumber === dayNum) {
          return { ...day, events: [...day.events, newEvent] };
        }
        return day;
      })
    };
    setData(updated);
  };

  const handleRemoveEvent = (dayNum: number, eventId: string) => {
    if (!data) return;
    const updated = {
      ...data,
      itineraries: data.itineraries.map(day => {
        if (day.dayNumber === dayNum) {
          return { ...day, events: day.events.filter(ev => ev.id !== eventId) };
        }
        return day;
      })
    };
    setData(updated);
  };

  const handleRemoveDay = (dayNum: number) => {
    if (!data) return;
    const updated = {
      ...data,
      itineraries: data.itineraries.filter(day => day.dayNumber !== dayNum)
    };
    setData(updated);
  };

  // Gemini assistant action
  const handleGenerateAISuggestion = async () => {
    if (!aiPrompt.trim() || !data) return;
    setIsGeneratingAI(true);
    setGenerationInfo('✨ Gemini 精密分析奢華調性，生成獨家高空/郵輪行程中...');
    
    // Find next day number
    const nextDay = data.itineraries.length > 0 
      ? Math.max(...data.itineraries.map(d => d.dayNumber)) + 1 
      : 1;

    try {
      const response = await fetch('/api/gemini/extend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          nextDayNumber: nextDay
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          const newDay: DayItinerary = result.data;
          
          // Let's use standard placeholders if it returns random domain images to prevent broken images
          if (!newDay.imageUrl.startsWith('/') && !newDay.imageUrl.startsWith('http')) {
            newDay.imageUrl = `https://picsum.photos/seed/luxury-${nextDay}/800/450`;
          }
          
          const updated = {
            ...data,
            itineraries: [...data.itineraries, newDay]
          };
          setData(updated);
          setAiPrompt('');
          setGenerationInfo(`🌸 成功生成！已新增 Day ${nextDay}：${newDay.destination}`);
          setTimeout(() => setGenerationInfo(''), 4000);
          
          // Auto sync to server database
          handleSave(updated);
        } else {
          setGenerationInfo('⚠️ AI 回傳格式不正確。');
        }
      } else {
        setGenerationInfo('❌ AI 旅程生成出了點問題，請稍後再試。');
      }
    } catch (e) {
      console.error(e);
      setGenerationInfo('❌ 呼叫 AI 服務發生錯誤。');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Get icons matching categories in Professional Polish Indigo theme
  const getCategoryIcon = (cat: string) => {
    switch (cat.trim()) {
      case '行衣':
        return <Plane className="w-4 h-4 text-amber-600" />;
      case '食他':
      case '食物':
        return <Utensils className="w-4 h-4 text-emerald-600" />;
      case '住行':
      case '住他':
      case '住':
        return <Hotel className="w-4 h-4 text-indigo-650" />;
      case '乘伙':
        return <Anchor className="w-4 h-4 text-cyan-600" />;
      case '魚付':
        return <DollarSign className="w-4 h-4 text-rose-600" />;
      default:
        return <Compass className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.trim()) {
      case '行衣':
        return 'bg-amber-50 text-amber-800 border border-amber-200/70';
      case '食他':
      case '食物':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-250/70';
      case '住行':
      case '住他':
      case '住':
        return 'bg-indigo-50 text-indigo-800 border border-indigo-250/70';
      case '乘伙':
        return 'bg-cyan-50 text-cyan-805 border border-cyan-200/70';
      case '魚付':
        return 'bg-rose-50 text-rose-805 border border-rose-200/70';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-205/70';
    }
  };

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Header Navigation - Studio Vision Branded Styling */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 flex-shrink-0">
            <Compass className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
            STUDIO<span className="text-indigo-600">VISION</span>
            <span className="ml-2.5 font-normal text-xs sm:text-sm text-slate-400 tracking-normal border-l border-slate-200 pl-2.5 hidden sm:inline-block">黃亘誼 豪華遊航履歷</span>
          </span>
        </div>
        
        {/* Collaborative control panel and Switch Mode Pill removed to run in preview-only mode */}
        <div className="flex items-center gap-3">
          {/* Only showing dynamic feedback indicator or keeping it empty */}
        </div>
      </nav>

      {/* Hero Header Section */}
      <div className="relative h-[220px] sm:h-[300px] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url('/src/assets/images/luxury_dinner_yacht_png_1780248502037.png')` }} />
        
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-24 relative z-10">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold tracking-widest text-indigo-200 uppercase bg-slate-900/60 backdrop-blur px-3 py-1.5 rounded-full border border-indigo-500/30 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>高擬真 Google 協作平台標準履歷及奢華行程範本</span>
          </div>
        </div>
      </div>

      {/* Main Core Body Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-24 relative z-10 pb-24">
        
        {/* Profile Card & Bio Header Block */}
        <section id="personal-profile" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
            
            {/* Round Avatar Container with image fallback or upload trigger */}
            <div className="relative group mx-auto md:mx-0">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-slate-50 rounded-full overflow-hidden border-2 border-slate-200/80 shadow-inner flex items-center justify-center">
                <img 
                  src={data.profile.avatarUrl} 
                  alt={data.profile.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // fallback standard
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/hsuanyi/300/300';
                  }}
                />
                
                {mode === 'edit' && (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-80"
                    >
                      <ImageIcon className="w-4 h-4 mb-1" />
                      {isUploadingAvatar ? '上傳中...' : '更換圖片'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Core Details Text Area */}
            <div className="flex-1 w-full text-center md:text-left">
              {mode === 'edit' ? (
                <div className="space-y-2.5 max-w-xl">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      value={data.profile.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="text-2xl sm:text-3xl font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500"
                      placeholder="姓名（中文）"
                    />
                    <input 
                      type="text" 
                      value={data.profile.englishName}
                      onChange={(e) => handleProfileChange('englishName', e.target.value)}
                      className="text-lg sm:text-xl font-semibold tracking-wide bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-indigo-650 focus:outline-none focus:border-indigo-500"
                      placeholder="姓名（英文）"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={data.profile.department}
                    onChange={(e) => handleProfileChange('department', e.target.value)}
                    className="text-sm text-slate-700 font-semibold tracking-wide bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full max-w-sm focus:outline-none focus:border-indigo-500"
                    placeholder="科系名銜 / 精密機械科"
                  />
                  <div className="flex items-center gap-1.5 justify-center md:justify-start">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <input 
                      type="text" 
                      value={data.profile.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="text-xs text-slate-650 font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 justify-center md:justify-start">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.profile.name}</h1>
                    <span className="text-xl font-bold tracking-wide text-indigo-600">{data.profile.englishName}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-bold tracking-wider">{data.profile.department}</p>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-indigo-600 font-mono font-bold">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{data.profile.email}</span>
                  </div>
                </div>
              )}

              {/* Tags panel - with interactive adding/removing under Edit Mode */}
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center md:justify-start">
                {data.profile.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center gap-1 group/tag"
                  >
                    {tag}
                    {mode === 'edit' && (
                      <button 
                        onClick={() => handleRemoveTag(idx)} 
                        className="text-rose-500 hover:text-rose-700 cursor-pointer text-[10px] font-bold"
                        title="移除此項目"
                      >
                        <X className="w-2.5 h-2.5 ml-0.5" />
                      </button>
                    )}
                  </span>
                ))}
                {mode === 'edit' && (
                  <button 
                    onClick={handleAddTag}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    新增
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Biography details */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 font-mono">
              關於我（個人簡述）
            </h3>
            {mode === 'edit' ? (
              <textarea 
                value={data.profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                rows={4}
                className="w-full bg-slate-50 text-sm border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed font-semibold"
                placeholder="關於我描述內容..."
              />
            ) : (
              <p className="text-sm font-semibold text-slate-600 leading-relaxed tracking-wide text-justify">
                {data.profile.bio}
              </p>
            )}
          </div>
        </section>

        {/* Tab Selector Controls (Standard Professional Polish Tab Bar) */}
        <div id="itinerary-tabs" className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-6 scrollbar-none">
          <button 
            id="tab-itineraries"
            onClick={() => setActiveTab('itineraries')}
            className={`pb-4 px-1.5 text-sm sm:text-base font-extrabold tracking-wide transition-all border-b-2 flex items-center gap-2 outline-none whitespace-nowrap cursor-pointer ${activeTab === 'itineraries' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Compass className="w-4 h-4 sm:w-5 h-5 animate-none" />
            豪華作業行程 ({data.itineraries.length} 天)
          </button>
          
          <button 
            id="tab-experiences"
            onClick={() => setActiveTab('experiences')}
            className={`pb-4 px-1.5 text-sm sm:text-base font-extrabold tracking-wide transition-all border-b-2 flex items-center gap-2 outline-none whitespace-nowrap cursor-pointer ${activeTab === 'experiences' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Calendar className="w-4 h-4 sm:w-5 h-5" />
            工作經歷 / 郵輪實習
          </button>

          <button 
            id="tab-videos"
            onClick={() => setActiveTab('videos')}
            className={`pb-4 px-1.5 text-sm sm:text-base font-extrabold tracking-wide transition-all border-b-2 flex items-center gap-2 outline-none whitespace-nowrap cursor-pointer ${activeTab === 'videos' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Play className="w-4 h-4 sm:w-5 h-5 text-indigo-505" />
            影音全紀錄影片
          </button>

          <button 
            id="tab-model3d"
            onClick={() => setActiveTab('model3d')}
            className={`pb-4 px-1.5 text-sm sm:text-base font-extrabold tracking-wide transition-all border-b-2 flex items-center gap-2 outline-none whitespace-nowrap cursor-pointer ${activeTab === 'model3d' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Box className="w-4 h-4 sm:w-5 h-5 animate-pulse" />
            3D模型相簿
          </button>

          <button 
            id="tab-presentation"
            onClick={() => setActiveTab('presentation')}
            className={`pb-4 px-1.5 text-sm sm:text-base font-extrabold tracking-wide transition-all border-b-2 flex items-center gap-2 outline-none whitespace-nowrap cursor-pointer ${activeTab === 'presentation' ? 'border-amber-500 text-amber-600 font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <FileText className="w-4 h-4 sm:w-5 h-5 text-amber-500" />
            極致奢華簡報 👑
          </button>
        </div>

        {/* Banner Alert for changes or status */}
        <AnimatePresence>
          {generationInfo && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-xl shadow-sm mb-8 text-xs font-semibold flex items-center justify-between border border-indigo-100"
            >
              <div className="flex items-center gap-2 text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                <span>{generationInfo}</span>
              </div>
              <button onClick={() => setGenerationInfo('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Context View 1: EXPERIENCES (工作經歷) */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block"></span>
                經歷航程 & 工作實踐
              </h2>
              {mode === 'edit' && (
                <button 
                  onClick={handleAddNewExperience}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-indigo-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增工作經歷
                </button>
              )}
            </div>

            {data.experiences.length === 0 ? (
              <div className="text-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl shadow-sm">
                <p className="text-slate-400 font-semibold text-sm">尚無經歷紀錄，點選右上方「新增」增加項目。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.experiences.map((exp) => (
                  <div key={exp.id} className="relative group bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:shadow-lg transition-all duration-300">
                    
                    {/* Delete control */}
                    {mode === 'edit' && (
                      <button 
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 p-1.5 bg-slate-50 hover:bg-rose-50 rounded-full transition cursor-pointer"
                        title="刪除此經歷"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Timeline icon */}
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-105 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          {mode === 'edit' ? (
                            <div className="flex flex-col gap-1.5">
                              <input 
                                type="text"
                                value={exp.yearMonth}
                                onChange={(e) => handleExperienceChange(exp.id, 'yearMonth', e.target.value)}
                                className="text-xs font-mono font-bold bg-slate-50 rounded-lg px-2 py-1 border border-slate-200 text-indigo-750 focus:outline-none"
                                placeholder="時間 2025/5"
                              />
                              <input 
                                type="text"
                                value={exp.title}
                                onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
                                className="text-sm font-bold text-slate-800 bg-slate-50 rounded-lg px-2 py-1 border border-slate-200 focus:outline-none flex-1"
                                placeholder="實踐或職稱名稱"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-extrabold text-indigo-750 tracking-wider uppercase px-2 py-0.5 bg-indigo-50 rounded border border-indigo-100">
                                {exp.yearMonth}
                              </span>
                              <h3 className="text-base font-bold text-slate-900 tracking-wide">{exp.title}</h3>
                            </div>
                          )}

                          {mode === 'edit' ? (
                            <div className="flex gap-2 mt-1">
                              <input 
                                type="text"
                                value={exp.country}
                                onChange={(e) => handleExperienceChange(exp.id, 'country', e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 w-20 focus:outline-none"
                                placeholder="國家"
                              />
                              <input 
                                type="text"
                                value={exp.city}
                                onChange={(e) => handleExperienceChange(exp.id, 'city', e.target.value)}
                                className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 w-24 focus:outline-none"
                                placeholder="城市"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-slate-405 font-medium">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{exp.country}</span>
                              <span className="text-slate-300">•</span>
                              <span>{exp.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Details Bullet items */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-100">
                          <div className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
                            造訪景點 / 行程細節
                          </div>
                          <ul className="space-y-1.5">
                            {exp.details.map((detail, dIdx) => (
                              <li key={dIdx} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                                {mode === 'edit' ? (
                                  <div className="flex items-center gap-1.5 w-full">
                                    <span className="text-indigo-500">•</span>
                                    <input 
                                      type="text"
                                      value={detail}
                                      onChange={(e) => handleUpdateExperienceDetail(exp.id, dIdx, e.target.value)}
                                      className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-705 flex-1 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button 
                                      onClick={() => handleRemoveExperienceDetail(exp.id, dIdx)}
                                      className="text-rose-500 hover:text-rose-700 text-xs px-1 cursor-pointer"
                                      title="刪除"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                                    <span>{detail}</span>
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                          {mode === 'edit' && (
                            <button 
                              onClick={() => handleAddExperienceDetail(exp.id)}
                              className="text-indigo-650 hover:text-indigo-755 flex items-center gap-1 text-[11px] font-bold mt-1.5 cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-indigo-650" />
                              增加活動景點細節
                            </button>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Context View 2: LUXURY ITINERARIES (豪華行程編輯器) */}
        {activeTab === 'itineraries' && (
          <div className="space-y-12">
            
            {/* AI Generator Panel (Display on Edit Mode only) */}
            {mode === 'edit' && (
              <div className="bg-gradient-to-br from-indigo-50/70 via-indigo-50/20 to-slate-100/10 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Gemini 智能豪華行程撰寫助理</h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed">輸入旅遊調性與地標（例如：歐洲五日、希臘古蹟），自動為您生成全新極致高規格行程天數及詳細活動！</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="請輸入例如：『希臘聖托里尼懸崖極致之旅，乘皇家遊艇與日落品酒』..."
                    disabled={isGeneratingAI}
                    className="flex-1 bg-white text-sm border border-slate-300 rounded-xl px-4 py-3 text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 disabled:opacity-50"
                  />
                  <button 
                    onClick={handleGenerateAISuggestion}
                    disabled={isGeneratingAI || !aiPrompt.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 tracking-wide cursor-pointer transition shadow-md shadow-indigo-100 disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        生成中
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI 智能生成
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Timeline Header Details */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block"></span>
                  行程詳細日程規劃目錄 (作業)
                </h2>
                {mode === 'edit' && (
                  <button 
                    onClick={() => {
                      if (!data) return;
                      const nextDayNum = data.itineraries.length > 0
                        ? Math.max(...data.itineraries.map(d => d.dayNumber)) + 1
                        : 1;
                      const newDay: DayItinerary = {
                        dayNumber: nextDayNum,
                        badge: '【探索】',
                        destination: '新增奢華旅遊城市 - 朝聖之境',
                        imageUrl: `https://picsum.photos/seed/luxury-${nextDayNum}/800/450`,
                        events: []
                      };
                      const updated = {
                        ...data,
                        itineraries: [...data.itineraries, newDay]
                      };
                      setData(updated);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    手動新增一日
                  </button>
                )}
              </div>

              {/* Day loops - Highly visual structure mimicking the video layout */}
              {data.itineraries.map((day) => (
                <div key={day.dayNumber} className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md mb-8">
                  
                  {/* Delete day control */}
                  {mode === 'edit' && (
                    <button 
                      onClick={() => handleRemoveDay(day.dayNumber)}
                      className="absolute top-4 right-4 z-10 text-rose-500 hover:text-white p-2 bg-white/85 hover:bg-rose-600 border border-rose-300 rounded-xl transition cursor-pointer"
                      title="刪除此天"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left Column: Visual Day Card Banner */}
                    <div className="lg:col-span-5 relative h-[220px] lg:h-auto min-h-[220px] bg-slate-900 overflow-hidden group">
                      <img 
                        src={day.imageUrl} 
                        alt={day.destination}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/day-${day.dayNumber}/800/450`;
                        }}
                      />
                      
                      {/* Gradient overlay mimicking elegant post-modern poster */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/30" />

                      {/* Content panel */}
                      <div className="absolute inset-x-6 bottom-6 flex flex-col justify-end">
                        <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md w-fit mb-2 shadow-sm">
                          Day {day.dayNumber}
                        </div>
                        
                        {mode === 'edit' ? (
                          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-700 backdrop-blur-sm shadow-xl">
                            <input 
                              type="text"
                              value={day.badge}
                              onChange={(e) => handleItineraryMetaChange(day.dayNumber, 'badge', e.target.value)}
                              className="text-xs bg-slate-950 text-indigo-305 font-bold px-2 py-0.5 rounded border border-slate-600 focus:outline-none"
                              placeholder="【焦點標章】"
                            />
                            <textarea 
                              value={day.destination}
                              onChange={(e) => handleItineraryMetaChange(day.dayNumber, 'destination', e.target.value)}
                              className="text-xs font-bold text-white bg-slate-950 p-2 rounded border border-slate-600 w-full focus:outline-none resize-none"
                              rows={2}
                              placeholder="目的地與標題描述"
                            />
                            <input 
                              type="text"
                              value={day.imageUrl}
                              onChange={(e) => handleItineraryMetaChange(day.dayNumber, 'imageUrl', e.target.value)}
                              className="text-[10px] bg-slate-955 text-slate-300 p-1.5 rounded border border-slate-600 w-full focus:outline-none"
                              placeholder="背景圖片路徑"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs font-black text-indigo-300 uppercase tracking-widest block mb-0.5 font-mono">
                              {day.badge}
                            </span>
                            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide shadow-text drop-shadow">
                              {day.destination}
                            </h3>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Events Timetable List */}
                    <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 font-sans">
                          每日活動時序規劃表
                        </div>
                        {mode === 'edit' && (
                          <button 
                            onClick={() => handleAddEvent(day.dayNumber)}
                            className="text-indigo-650 hover:text-indigo-805 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            新增時間節點
                          </button>
                        )}
                      </div>

                      {day.events.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-slate-200 bg-slate-50 rounded-2xl">
                          <p className="text-slate-400 text-xs font-semibold">此天尚無時序，點擊「新增時間節點」建立。</p>
                        </div>
                      ) : (
                        <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[1px] before:bg-slate-200">
                          {day.events.map((ev) => (
                            <div key={ev.id} className="relative flex items-start gap-4 group/item">
                              
                              {/* Left category icon node */}
                              <div className="relative z-10 w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover/item:border-indigo-500/40 group-hover/item:bg-indigo-50 transition text-slate-700">
                                {getCategoryIcon(ev.category)}
                              </div>

                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  
                                  {/* Dynamic Category fields on Edit Mode */}
                                  <div className="flex items-center gap-2">
                                    {mode === 'edit' ? (
                                      <div className="flex gap-1.5 items-center">
                                        <input 
                                          type="text"
                                          value={ev.time}
                                          onChange={(e) => handleEventChange(day.dayNumber, ev.id, 'time', e.target.value)}
                                          className="text-xs font-mono font-bold bg-slate-50 text-slate-800 rounded px-2 py-1 border border-slate-200 w-16 focus:outline-none focus:border-indigo-500"
                                          placeholder="09:00"
                                        />
                                        <select 
                                          value={ev.category}
                                          onChange={(e) => handleEventChange(day.dayNumber, ev.id, 'category', e.target.value)}
                                          className="text-[10.5px] font-bold bg-indigo-50 text-indigo-700 rounded px-1.5 py-1 focus:outline-none border border-indigo-100"
                                        >
                                          <option value="行衣">👕 行衣</option>
                                          <option value="食他">🍽️ 食他</option>
                                          <option value="食物">🦀 食物</option>
                                          <option value="住行">🏨 住行</option>
                                          <option value="住他">🏡 住他</option>
                                          <option value="住">🛌 住</option>
                                          <option value="乘伙">⚓ 乘伙</option>
                                          <option value="魚付">💰 魚付</option>
                                        </select>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                                          {ev.time}
                                        </span>
                                        <span className={`text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded-full ${getCategoryBadgeClass(ev.category)}`}>
                                          {ev.category}
                                        </span>
                                      </div>
                                    )}

                                    {/* Action Header Title */}
                                    {mode === 'edit' ? (
                                      <input 
                                        type="text"
                                        value={ev.title}
                                        onChange={(e) => handleEventChange(day.dayNumber, ev.id, 'title', e.target.value)}
                                        className="text-xs font-bold text-slate-800 bg-slate-50 px-2 py-1 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 w-full max-w-xs"
                                        placeholder="活動標題"
                                      />
                                    ) : (
                                      <span className="text-xs font-extrabold text-slate-800 tracking-wide">
                                        {ev.title}
                                      </span>
                                    )}
                                  </div>

                                  {/* Delete event row button */}
                                  {mode === 'edit' && (
                                    <button 
                                      onClick={() => handleRemoveEvent(day.dayNumber, ev.id)}
                                      className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded transition cursor-pointer self-end sm:self-auto"
                                      title="刪除此項目"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {/* Event detail bullet points */}
                                <div className="pl-1 space-y-1">
                                  {ev.details.map((detail, dIdx) => (
                                    <div key={dIdx} className="flex items-start justify-between text-xs text-slate-650 leading-relaxed font-semibold">
                                      {mode === 'edit' ? (
                                        <div className="flex items-center gap-1.5 w-full mt-1">
                                          <span className="text-slate-400">•</span>
                                          <input 
                                            type="text"
                                            value={detail}
                                            onChange={(e) => handleEventDetailChange(day.dayNumber, ev.id, dIdx, e.target.value)}
                                            className="bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2 py-0.5 text-xs flex-1 focus:outline-none focus:border-indigo-500"
                                          />
                                          <button 
                                            onClick={() => handleRemoveEventDetail(day.dayNumber, ev.id, dIdx)}
                                            className="text-rose-500 hover:text-rose-700 text-xs px-1 cursor-pointer"
                                            title="刪除詳情 bullet"
                                          >
                                            &times;
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-start gap-2">
                                          <span className="text-indigo-500 mt-1">•</span>
                                          <span>{detail}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  
                                  {mode === 'edit' && (
                                    <button 
                                      onClick={() => handleAddEventDetail(day.dayNumber, ev.id)}
                                      className="text-indigo-600 hover:text-indigo-805 flex items-center gap-1 text-[10px] font-extrabold mt-1 cursor-pointer"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      增加事件說明 bullet
                                    </button>
                                  )}
                                </div>


                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab Context View 3: VIDEOS (影音全紀錄) */}
        {activeTab === 'videos' && (
          <div className="space-y-8">

            {/* Custom Link Buttons Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block"></span>
                自訂快速導航連結
              </h3>
              <p className="text-sm font-semibold text-slate-500 mb-6 leading-relaxed">
                此處提供兩個可靈活設定的自訂按鈕。{mode === 'edit' ? '您可以在下方直接輸入按鈕的名稱與跳轉之外部網址，變更將會即時發佈並儲存。' : '點擊按鈕即可立即開啟所關聯的外部網站或說明文件。'}
              </p>

              {mode === 'edit' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Link Button 1 */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-indigo-600 tracking-wider">自訂連結按鈕 A</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-450 block mb-1">按鈕顯示文字</label>
                        <input 
                          type="text"
                          value={data.profile.buttonLabel1 || ''}
                          onChange={(e) => {
                            const updated = {
                              ...data,
                              profile: {
                                ...data.profile,
                                buttonLabel1: e.target.value
                              }
                            };
                            setData(updated);
                            handleSave(updated);
                          }}
                          placeholder="例如：教學講義"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-450 block mb-1">按鈕連結網址</label>
                        <input 
                          type="text"
                          value={data.profile.buttonLink1 || ''}
                          onChange={(e) => {
                            const updated = {
                              ...data,
                              profile: {
                                ...data.profile,
                                buttonLink1: e.target.value
                              }
                            };
                            setData(updated);
                            handleSave(updated);
                          }}
                          placeholder="例如：https://google.com"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Link Button 2 */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-emerald-600 tracking-wider">自訂連結按鈕 B</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-450 block mb-1">按鈕顯示文字</label>
                        <input 
                          type="text"
                          value={data.profile.buttonLabel2 || ''}
                          onChange={(e) => {
                            const updated = {
                              ...data,
                              profile: {
                                ...data.profile,
                                buttonLabel2: e.target.value
                              }
                            };
                            setData(updated);
                            handleSave(updated);
                          }}
                          placeholder="例如：官方入口"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-455 block mb-1">按鈕連結網址</label>
                        <input 
                          type="text"
                          value={data.profile.buttonLink2 || ''}
                          onChange={(e) => {
                            const updated = {
                              ...data,
                              profile: {
                                ...data.profile,
                                buttonLink2: e.target.value
                              }
                            };
                            setData(updated);
                            handleSave(updated);
                          }}
                          placeholder="例如：https://example.com"
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-center py-2">
                  <a 
                    href={data.profile.buttonLink1 ? (data.profile.buttonLink1.startsWith('http') ? data.profile.buttonLink1 : `https://${data.profile.buttonLink1}`) : '#'}
                    target={data.profile.buttonLink1 ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-sm transition-all duration-200 flex-1 min-w-[200px] text-center ${
                      data.profile.buttonLink1 
                        ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] text-white cursor-pointer' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>🚀 {data.profile.buttonLabel1 || '自訂導航按鈕 A（尚未設定）'}</span>
                    {data.profile.buttonLink1 && <span className="text-xs">↗</span>}
                  </a>

                  <a 
                    href={data.profile.buttonLink2 ? (data.profile.buttonLink2.startsWith('http') ? data.profile.buttonLink2 : `https://${data.profile.buttonLink2}`) : '#'}
                    target={data.profile.buttonLink2 ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-sm transition-all duration-200 flex-1 min-w-[200px] text-center ${
                      data.profile.buttonLink2 
                        ? 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.01] text-white cursor-pointer' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>🌐 {data.profile.buttonLabel2 || '自訂導航按鈕 B（尚未設定）'}</span>
                    {data.profile.buttonLink2 && <span className="text-xs">↗</span>}
                  </a>
                </div>
              )}
            </div>
            
            {/* Real Interactive Video Player Container */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-3">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block"></span>
                自主航影播放空間
              </h3>
              <p className="text-sm font-semibold text-slate-500 mb-6 leading-relaxed">
                您可以在此處點選按鈕，將隨附的影片檔案上載至伺服器，直接在頁面上進行流暢播放。
              </p>

              <div className="max-w-2xl mx-auto">
                {data.profile.uploadedVideoUrl ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-inner">
                      <video 
                        src={data.profile.uploadedVideoUrl} 
                        controls 
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
                      <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>已成功儲存並載入您所選取的影片。</span>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="file" 
                          ref={videoInputRef} 
                          onChange={handleVideoUpload} 
                          className="hidden" 
                          accept="video/*" 
                        />
                        <button 
                          onClick={() => videoInputRef.current?.click()}
                          disabled={isUploadingVideo}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition disabled:opacity-50"
                        >
                          {isUploadingVideo ? '上傳中...' : '更換影片檔案'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-405 rounded-3xl p-8 sm:p-12 text-center transition-all duration-300">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Play className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mb-1.5">專屬外部影片待播放</h4>
                    <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mb-6 leading-relaxed">
                      請點選下方上傳影片檔案按鈕（支援 .mp4, .webm, .mov 等），即可在本區塊即時整合您的影片。
                    </p>
                    <input 
                      type="file" 
                      ref={videoInputRef} 
                      onChange={handleVideoUpload} 
                      className="hidden" 
                      accept="video/*" 
                    />
                    <button 
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploadingVideo}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all duration-200 disabled:opacity-55"
                    >
                      {isUploadingVideo ? '上傳並處理中...' : '上傳影片檔案並播放'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Static Image list card layout (No onclick trigger modals) */}
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full inline-block"></span>
                旅程精采片段紀實 (純圖片與解釋)
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                以下為各造訪航程之精選珍珍藏畫面，搭配專屬文字說明與可點開瀏覽的專屬外部連結。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                {LUXURY_VIDEOS.map((vid) => {
                  const currentLink = data?.profile?.journeyLinks?.[vid.id] || '';
                  return (
                    <div 
                      key={vid.id}
                      className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative h-[200px] bg-slate-100 overflow-hidden group">
                          {currentLink ? (
                            <a 
                              href={currentLink.startsWith('http') ? currentLink : `https://${currentLink}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block w-full h-full relative cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                const targetUrl = currentLink.startsWith('http') ? currentLink : `https://${currentLink}`;
                                window.open(targetUrl, '_blank');
                              }}
                            >
                              <img 
                                src={vid.placeholderUrl} 
                                alt={vid.title} 
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.05]"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white text-xs font-black tracking-widest gap-1.5 backdrop-blur-[1px]">
                                <span>🌐 點擊開啟外部連結 ↗</span>
                              </div>
                            </a>
                          ) : (
                            <img 
                              src={vid.placeholderUrl} 
                              alt={vid.title} 
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>

                        <div className="p-5 space-y-2">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">
                            {vid.category}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900">
                            {vid.title}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                            {vid.description}
                          </p>
                        </div>
                      </div>

                      {/* URL input controls & Interactive redirection actions */}
                      <div className="px-5 pb-5 pt-0">
                        {mode === 'edit' ? (
                          <div className="pt-3 border-t border-slate-100 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 block tracking-wider">
                              設定專屬瀏覽網址：
                            </label>
                            <input 
                              type="text"
                              value={currentLink}
                              onChange={(e) => {
                                const updatedLinks = {
                                  ...(data.profile.journeyLinks || {}),
                                  [vid.id]: e.target.value
                                };
                                const updated = {
                                  ...data,
                                  profile: {
                                    ...data.profile,
                                    journeyLinks: updatedLinks
                                  }
                                };
                                setData(updated);
                                handleSave(updated);
                              }}
                              placeholder="例如: https://example.com"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-550"
                            />
                          </div>
                        ) : (
                          currentLink && (
                            <div className="pt-3 border-t border-slate-100 flex justify-end">
                              <a 
                                href={currentLink.startsWith('http') ? currentLink : `https://${currentLink}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-850 transition-colors uppercase tracking-wider cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const targetUrl = currentLink.startsWith('http') ? currentLink : `https://${currentLink}`;
                                  window.open(targetUrl, '_blank');
                                }}
                              >
                                <span>🌐 開啟外部瀏覽連結 ↗</span>
                              </a>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab Context View 4: 3D MODEL (3D模型相簿) */}
        {activeTab === 'model3d' && (
          <div className="space-y-8">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full inline-block"></span>
                    3D模型與設計概念實錄
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed">
                    此專區用於放映 3D 模型圖面、實體構想、精密加工製程或機械原理概念。支持於右側自由匯入與修剪您的影像紀錄。
                  </p>
                </div>
                <div>
                  <input 
                    type="file" 
                    ref={model3dPhotoInputRef} 
                    onChange={handleModel3dPhotoUpload} 
                    className="hidden" 
                    accept="image/*" 
                  />
                  <button 
                    onClick={() => model3dPhotoInputRef.current?.click()}
                    disabled={isUploadingModel3dPhoto}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-55"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploadingModel3dPhoto ? '上傳中...' : '上傳 3D 照片'}
                  </button>
                </div>
              </div>

              {/* Photos Gallery */}
              {data && data.profile.model3dPhotos && data.profile.model3dPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {data.profile.model3dPhotos.map((photoUrl, idx) => {
                    const currentPhotoLink = data?.profile?.model3dLinks?.[photoUrl] || '';
                    return (
                      <div 
                        key={idx}
                        className="group relative bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition hover:shadow-md hover:border-slate-300 animate-none flex flex-col justify-between"
                      >
                        <div>
                          <div className="aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
                            {currentPhotoLink ? (
                              <a 
                                href={currentPhotoLink.startsWith('http') ? currentPhotoLink : `https://${currentPhotoLink}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block w-full h-full relative cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const targetUrl = currentPhotoLink.startsWith('http') ? currentPhotoLink : `https://${currentPhotoLink}`;
                                  window.open(targetUrl, '_blank');
                                }}
                              >
                                <img 
                                  src={photoUrl} 
                                  alt={`3D Model ${idx + 1}`} 
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-white text-xs font-black tracking-widest gap-1.5 backdrop-blur-[1px]">
                                  <span>🌐 開啟 3D 空間 ↗</span>
                                </div>
                              </a>
                            ) : (
                              <img 
                                src={photoUrl} 
                                alt={`3D Model ${idx + 1}`} 
                                loading="lazy"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )}
                          </div>

                          <div className="p-4 bg-white space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">3D 模型圖檔 #{idx + 1}</span>
                              
                              {/* Always show delete option if in edit mode */}
                              {mode === 'edit' && (
                                <button 
                                  onClick={() => handleRemove3dPhoto(idx)}
                                  className="p-1 px-2.5 text-[10px] font-extrabold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 transition-all cursor-pointer"
                                  title="刪除此張相片"
                                >
                                  刪除
                                </button>
                              )}
                            </div>

                            {mode === 'edit' ? (
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 block tracking-wider">
                                  設定 3D 展示連結：
                                </label>
                                <input 
                                  type="text"
                                  value={currentPhotoLink}
                                  onChange={(e) => {
                                    const updatedLinks = {
                                      ...(data.profile.model3dLinks || {}),
                                      [photoUrl]: e.target.value
                                    };
                                    const updated = {
                                      ...data,
                                      profile: {
                                        ...data.profile,
                                        model3dLinks: updatedLinks
                                      }
                                    };
                                    setData(updated);
                                    handleSave(updated);
                                  }}
                                  placeholder="例如: https://studio.tripo3d.ai/..."
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-semibold focus:outline-none focus:border-indigo-550"
                                />
                              </div>
                            ) : (
                              currentPhotoLink && (
                                <div className="pt-2 border-t border-slate-100 flex justify-end">
                                  <a 
                                    href={currentPhotoLink.startsWith('http') ? currentPhotoLink : `https://${currentPhotoLink}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-850 transition-colors uppercase tracking-wider cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const targetUrl = currentPhotoLink.startsWith('http') ? currentPhotoLink : `https://${currentPhotoLink}`;
                                      window.open(targetUrl, '_blank');
                                    }}
                                  >
                                    <span>🌐 點擊開啟 3D 模型 ↗</span>
                                  </a>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Box className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mb-1">暫無 3D 模型照片</h4>
                  <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto mb-4">
                    請點選右上角按鈕上傳與本課程或專利相關的系統 3D 渲染圖或製程作品照。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'presentation' && (
          <div className="space-y-8 animate-fade-in">
            {/* Download and Presentation Info banner */}
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 border border-amber-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-br from-slate-950 via-zinc-900 to-black">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  <h3 className="text-lg font-bold text-amber-400 tracking-wide">
                    頂級奢華與禁忌之巔簡報系統 👑
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-semibold max-w-xl leading-relaxed">
                  本頁面內嵌全互動式多媒體幻燈片系統，完美展示精心編撰之「四日極致奢華行程簡報」。您可直接在下方切換投影片、瀏覽禁忌主題，或點擊右側下載按鈕下載完整單機 HTML 簡報檔案。
                </p>
              </div>
              <div className="shrink-0">
                <button
                  onClick={handleDownloadPresentation}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black text-xs px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2 tracking-wider"
                >
                  📥 下載單機 HTML 簡報檔案
                </button>
              </div>
            </div>

            {/* Simulated slideshow container */}
            <div className="w-full bg-black border border-amber-900/40 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col justify-between p-6 sm:p-12 text-amber-400 font-serif">
              
              {/* Slideshow Top Headers */}
              <div className="flex items-center justify-between border-b border-amber-900/20 pb-4 mb-6">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-500/60">
                  L U X U R Y &nbsp; C H A O S
                </span>
                <span className="text-xs font-mono text-amber-500/60 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-900/30">
                  Slide {activeSlide + 1} of 5
                </span>
              </div>

              {/* Slider Content block */}
              <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-12">
                {activeSlide === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-center max-w-2xl space-y-6"
                  >
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 italic font-serif leading-tight">
                      跨越國界的傲慢
                    </h1>
                    <p className="text-lg sm:text-2xl tracking-[0.2em] text-zinc-400 font-sans font-light">
                      頂級奢華與禁忌之巔：四日極致行程
                    </p>
                    <div className="h-0.5 w-24 bg-amber-600 mx-auto opacity-60"></div>
                    <p className="text-xs text-zinc-500 font-sans tracking-widest max-w-md mx-auto italic leading-relaxed">
                      「在財富堆疊的頂點，法律變成了建議，而道德不過是裝飾...」
                    </p>
                  </motion.div>
                )}

                {activeSlide === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="w-full max-w-4xl space-y-6 sm:space-y-8"
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 border-b border-amber-900/20 pb-2">
                      Day 1：【起航】羅馬
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                      <div className="border border-amber-900/25 p-5 rounded-2xl bg-zinc-950/50 backdrop-blur-sm shadow-inner space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-955 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded text-xs font-mono font-bold">09:00</span>
                          <span className="font-bold text-zinc-200 text-sm">行/衣</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                          勞斯萊斯 Phantom 抵達機坪。穿著雲朵觸感 100% Vicuna。金融路徑：$5M USD 至 BVI 空殼公司。
                        </p>
                      </div>

                      <div className="border border-amber-900/25 p-5 rounded-2xl bg-zinc-950/50 backdrop-blur-sm shadow-inner space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-955 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded text-xs font-mono font-bold">10:30</span>
                          <span className="font-bold text-zinc-200 text-sm">食/色</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                          伊朗 Almas 魚子醬。機上「高空素懶趴」舒壓。黑市獵頭直送。
                        </p>
                      </div>

                      <div className="border border-amber-900/25 p-5 rounded-2xl bg-zinc-950/50 backdrop-blur-sm shadow-inner space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-955 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded text-xs font-mono font-bold">15:00</span>
                          <span className="font-bold text-zinc-200 text-sm">住/行</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                          特警車隊封路送往 Hotel de la Ville。換裝 200支紗海島棉（黑珍珠扣）。安保費已匯出。
                        </p>
                      </div>

                      <div className="border border-rose-900/30 p-5 rounded-2xl bg-rose-950/10 backdrop-blur-sm shadow-inner space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-rose-955 text-rose-455 border border-rose-900/60 px-2 py-0.5 rounded text-xs font-mono font-bold">20:30</span>
                          <span className="font-bold text-rose-300 text-sm">梵蒂岡私密之夜</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                          腔棘魚腹肉刺身（科摩羅地下漁業）。黑色蕾絲吊帶美女於畫室侍奉。
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSlide === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="w-full max-w-4xl space-y-6 sm:space-y-8 font-sans"
                  >
                    <h2 className="text-3xl sm:text-4xl font-serif text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 border-b border-amber-900/20 pb-4">
                      Day 2：【荒漠】埃及 — 法老禁忌
                    </h2>

                    <div className="space-y-4">
                      <div className="border border-amber-900/25 p-5 rounded-2xl bg-zinc-950/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-lg font-serif text-amber-500 font-bold shrink-0 min-w-[100px] border-r border-amber-900/20 pr-4">
                          09:00 AM
                        </div>
                        <div>
                          <p className="font-bold text-zinc-200 text-sm mb-1">加拉巴哥象龜精華清湯</p>
                          <p className="text-xs sm:text-sm text-zinc-400 italic">機上浴缸精油共浴。食材來自非法收藏家轉讓。</p>
                        </div>
                      </div>

                      <div className="border border-amber-900/25 p-5 rounded-2xl bg-zinc-950/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-lg font-serif text-amber-500 font-bold shrink-0 min-w-[100px] border-r border-amber-900/20 pr-4">
                          01:00 PM
                        </div>
                        <div>
                          <p className="font-bold text-zinc-200 text-sm mb-1">金字塔禁區別墅</p>
                          <p className="text-xs sm:text-sm text-zinc-400 italic">直升機直達。香檳沐浴儀式。美女提供深喉服務。考古捐贈洗錢。</p>
                        </div>
                      </div>

                      <div className="border border-rose-900/30 p-5 rounded-2xl bg-rose-950/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-lg font-serif text-rose-500 font-bold shrink-0 min-w-[100px] border-r border-rose-900/20 pr-4">
                          07:30 PM
                        </div>
                        <div>
                          <p className="font-bold text-rose-350 text-sm mb-1">小頭鼠海豚 (Vaquita) 嫩煎腹肉</p>
                          <p className="text-xs sm:text-sm text-zinc-400 italic">墨西哥黑幫直送。星空下「集體素懶趴」至入睡。</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSlide === 3 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="w-full max-w-4xl space-y-6 sm:space-y-8"
                  >
                    <div className="text-center space-y-1">
                      <h2 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                        Day 3：【豪賭】摩納哥
                      </h2>
                      <p className="text-amber-600/80 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-sans">
                        Mediterranean Blood Romance
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                      <div className="border border-amber-900/25 p-6 rounded-2xl bg-zinc-950/60 hover:border-amber-900/40 transition text-center flex flex-col justify-between min-h-[250px] space-y-4">
                        <h3 className="text-lg font-bold text-amber-300 border-b border-amber-950 pb-2">私人航母</h3>
                        <p className="text-xs sm:text-sm text-zinc-400 italic leading-relaxed">
                          「人體盛」白犀牛脊髓。穿著 24K 金絲睡袍。藝術品抵押租金。
                        </p>
                        <span className="text-amber-600/80 text-[10px] font-mono tracking-widest block pt-2">10:00 AM</span>
                      </div>

                      <div className="border border-amber-900/25 p-6 rounded-2xl bg-zinc-950/60 hover:border-amber-900/40 transition text-center flex flex-col justify-between min-h-[250px] space-y-4">
                        <h3 className="text-lg font-bold text-amber-300 border-b border-amber-950 pb-2">Bugatti 狂飆</h3>
                        <p className="text-xs sm:text-sm text-zinc-400 italic leading-relaxed">
                          清場精品店。買斷千萬鑽石項鍊。啟動賭場「泥碼」洗錢。
                        </p>
                        <span className="text-amber-600/80 text-[10px] font-mono tracking-widest block pt-2">04:00 PM</span>
                      </div>

                      <div className="border border-rose-900/40 p-6 rounded-2xl bg-rose-950/10 hover:border-rose-900/60 transition text-center flex flex-col justify-between min-h-[250px] space-y-4">
                        <h3 className="text-lg font-bold text-rose-300 border-b border-rose-950 pb-2">四龍搶珠</h3>
                        <p className="text-xs sm:text-sm text-zinc-400 italic leading-relaxed">
                          野生東北虎虎鞭補酒配犀牛排。煙火聲中享受極致服務。
                        </p>
                        <span className="text-rose-500/80 text-[10px] font-mono tracking-widest block pt-2">09:00 PM</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeSlide === 4 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="w-full max-w-2xl text-center space-y-8 font-sans"
                  >
                    <h2 className="text-2xl sm:text-3xl font-serif italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                      Day 4：【謝幕】凱子的優雅轉身
                    </h2>

                    <div className="space-y-4 text-left max-w-xl mx-auto">
                      <div className="flex gap-4 border-l-2 border-amber-700/50 pl-5 py-1">
                        <span className="text-amber-550/70 font-mono text-sm shrink-0">09:00</span>
                        <div>
                          <p className="font-bold text-zinc-200 text-sm">野生朱䴉肝醬配黑松露</p>
                          <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">換上純蠶絲手工刺繡服。地下錢莊賄賂結清。</p>
                        </div>
                      </div>

                      <div className="flex gap-4 border-l-2 border-amber-700/50 pl-5 py-1">
                        <span className="text-amber-550/70 font-mono text-sm shrink-0">13:00</span>
                        <div>
                          <p className="font-bold text-zinc-200 text-sm">最後一次全體服侍</p>
                          <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">簽署 $10M NDA 協議。鑽石分手禮發放。</p>
                        </div>
                      </div>

                      <div className="flex gap-4 border-l-2 border-rose-700/60 pl-5 py-3 bg-rose-950/10 rounded-r-xl pr-3">
                        <span className="text-rose-400 font-mono text-sm shrink-0">21:00</span>
                        <div>
                          <p className="font-bold text-rose-350 text-sm">焚化與回歸</p>
                          <p className="text-xs text-zinc-400 italic mt-0.5 leading-relaxed">
                            抵達莊園。衣物直接丟入焚化爐。帳目洗錢路徑銷毀。
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xl text-amber-700 tracking-[0.5em] font-light font-serif pt-4">
                      E N D
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Slideshow Bottom Navigation bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-amber-900/20 pt-6 gap-4 font-sans">
                <div className="flex items-center gap-1.5 order-2 sm:order-1">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        idx === activeSlide ? 'bg-amber-400 scale-120' : 'bg-amber-950 hover:bg-amber-800'
                      }`}
                      title={`投影片 ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-4 order-1 sm:order-2">
                  <button
                    onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : 4))}
                    className="border border-amber-900/40 bg-zinc-950 hover:bg-amber-500 hover:text-black hover:border-amber-400 px-6 py-2 rounded-full text-xs tracking-widest text-amber-400 transition cursor-pointer select-none font-extrabold"
                  >
                    PREV
                  </button>
                  <span className="text-amber-500 font-mono text-sm font-bold min-w-[45px] text-center">
                    {activeSlide + 1} / 5
                  </span>
                  <button
                    onClick={() => setActiveSlide((prev) => (prev < 4 ? prev + 1 : 0))}
                    className="border border-amber-900/40 bg-zinc-950 hover:bg-amber-500 hover:text-black hover:border-amber-400 px-6 py-2 rounded-full text-xs tracking-widest text-amber-400 transition cursor-pointer select-none font-extrabold"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



      </main>

      {/* Cinematic Modal Video Player Simulation Removed */}

      {/* Footer credits - Pristine, minimalistic, zero credit bloat */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950 text-center">
        <div className="max-w-6xl mx-auto px-4 text-xs text-zinc-600 font-mono">
          <div>線上履歷 Google 協作平台標準樣式範本 © {new Date().getFullYear()}</div>
          <div className="mt-1">由黃亘誼先生協同研製、並搭載 Gemini 3.5 次世代探索助理。</div>
        </div>
      </footer>

    </div>
  );
}
