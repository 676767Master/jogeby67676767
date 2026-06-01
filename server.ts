/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Helper to read database
function getDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  // Fallback default
  return {
    profile: {
      name: "黃亘誼",
      englishName: "HUANG HSUAN YI",
      department: "精密機械科",
      tags: ["戰神賽特", "八國聯軍", "刊蹄", "240", "小丑制霸", "省道特快車"],
      email: "a111182118@nkust.edu.tw",
      bio: "我是一個積極進取、認真負責的人，從小在溫暖善良且重視教育的家庭中成長。父母教導我誠實待人、踏實做事，也讓我明白努力與堅持的重要性。這樣的成長背景，使我養成良好的生活習慣與自律能力。",
      avatarUrl: "/src/assets/images/user_full_photo_1780250845986.png",
      uploadedVideoUrl: "",
      model3dPhotos: [],
      journeyLinks: {
        "vid2": "https://studio.tripo3d.ai/workspace/generate/sport-motorcycle-drifting-with-dark-background-and-white-smoke-plume-752b7cad-55d9-419a-a845-b9d04ad96de6"
      },
      buttonLink1: "",
      buttonLabel1: "",
      buttonLink2: "",
      buttonLabel2: "",
      bottomButtonLink: "",
      bottomButtonLabel: "",
      model3dLinks: {}
    },
    experiences: [
      {
        id: "exp1",
        yearMonth: "2025/5",
        title: "郵輪實習課程",
        country: "日本",
        city: "東京",
        details: ["淺草寺", "阿美橫町"]
      }
    ],
    itineraries: []
  };
}

// Helper to write database
function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving database:', error);
    return false;
  }
}

// REST APIs
app.get('/api/resume', (req, res) => {
  const db = getDatabase();
  res.json(db);
});

app.post('/api/resume', (req, res) => {
  const updatedData = req.body;
  if (!updatedData || !updatedData.profile) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  const success = saveDatabase(updatedData);
  if (success) {
    res.json({ status: 'ok', data: updatedData });
  } else {
    res.status(500).json({ error: 'Failed to write to database file' });
  }
});

app.post('/api/upload-avatar', (req, res) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ error: 'Filename and base64 data are required' });
  }

  try {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64, 'base64');
    }

    const uniqueFilename = `uploaded_avatar_${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const targetDir = path.join(process.cwd(), 'src', 'assets', 'images');
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, uniqueFilename);
    fs.writeFileSync(targetPath, buffer);

    const relativeUrl = `/src/assets/images/${uniqueFilename}`;
    res.json({ success: true, url: relativeUrl });
  } catch (err: any) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Failed to save the image to server' });
  }
});

app.post('/api/upload-3d-photo', (req, res) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ error: 'Filename and base64 data are required' });
  }

  try {
    const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64, 'base64');
    }

    const uniqueFilename = `uploaded_3d_photo_${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const targetDir = path.join(process.cwd(), 'src', 'assets', 'images');
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, uniqueFilename);
    fs.writeFileSync(targetPath, buffer);

    const relativeUrl = `/src/assets/images/${uniqueFilename}`;
    res.json({ success: true, url: relativeUrl });
  } catch (err: any) {
    console.error('3D photo upload failed:', err);
    res.status(500).json({ error: 'Failed to save the image to server' });
  }
});

app.post('/api/upload-video', (req, res) => {
  const { filename, base64 } = req.body;
  if (!filename || !base64) {
    return res.status(400).json({ error: 'Filename and base64 data are required' });
  }

  try {
    const matches = base64.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    let buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64, 'base64');
    }

    const uniqueFilename = `uploaded_video_${Date.now()}_${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const targetDir = path.join(process.cwd(), 'src', 'assets', 'videos');
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, uniqueFilename);
    fs.writeFileSync(targetPath, buffer);

    const relativeUrl = `/src/assets/videos/${uniqueFilename}`;
    res.json({ success: true, url: relativeUrl });
  } catch (err: any) {
    console.error('Video upload failed:', err);
    res.status(500).json({ error: 'Failed to save the video to server' });
  }
});

// AI generator endpoint using @google/genai SDK
app.post('/api/gemini/extend', async (req, res) => {
  const { prompt, nextDayNumber } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // If API key is missing, mock some beautiful luxury details gracefully and let user know it's a fallback
    console.warn('GEMINI_API_KEY environment variable is not defined.');
    const mockTheme = prompt || "豪華假期體驗";
    const mockedGeneratedDay = {
      dayNumber: nextDayNumber || 5,
      badge: "【奢享】",
      destination: `${mockTheme.substring(0, 20)} - 精緻探索專屬計畫`,
      imageUrl: "https://picsum.photos/seed/luxury/800/450",
      events: [
        {
          id: `ai-e1-${Date.now()}`,
          time: "09:30",
          category: "行衣",
          title: "身著訂製高級套服與休閒配飾",
          details: ["由管家攜帶隨身行囊，步入專屬座車", "感受低調奢華出航氣息"]
        },
        {
          id: `ai-e2-${Date.now()}`,
          time: "13:00",
          category: "食他",
          title: "米其林三星主廚親製尊榮午餐",
          details: ["佐以皇家珍藏香檳與精選在地特產魚鮮", "俯瞰無邊際海景與私密地標景觀"]
        },
        {
          id: `ai-e3-${Date.now()}`,
          time: "20:00",
          category: "住",
          title: "夜宿頂級私人城堡別墅或套房",
          details: ["享受皇家熱泉浴池與特裝水療芳療", "攜手伴侶共賞漫天繁星，行程完美極致"]
        }
      ]
    };
    return res.json({
      data: mockedGeneratedDay,
      warning: "Note: Running in demo mode without GEMINI_API_KEY. Formatted mock data generated gracefully."
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `You are an elite luxury travel planner specializing in high-end, cinematic concierge experiences like superyacht charters, private jet excursions, Michelin stellar fine dining, luxury sports car tours, and pharaoh-level resort pampering.
Generate a beautifully formatted custom itinerary day for an ongoing elite tour. Follow the user's focus theme.
Write output labels and descriptions in Traditional Chinese (繁體中文).
The dayNumber should be ${nextDayNumber || 5}.
The events list must contain 2 to 3 chronological events of the day, using categories such as "行衣", "食他", "住行", "住他", "乘伙", "魚付", "住".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Create a luxurious day itinerary with the theme: "${prompt}". Ensure it sounds incredibly exclusive, cinematic, and matches a high-budget global lifestyle.`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ["dayNumber", "badge", "destination", "imageUrl", "events"],
          properties: {
            dayNumber: { type: Type.INTEGER },
            badge: { type: Type.STRING, description: "A luxury tag like 【起點】, 【亮點】, 【尋秘】, 【顛峰】, 【秘境】, 【奢華】" },
            destination: { type: Type.STRING, description: "Formatted like 'City - Elegant caption of the place' (e.g., '雅典 - 愛琴海的藍白戀歌')" },
            imageUrl: { type: Type.STRING, description: "A placeholder image URL from picsum, e.g., 'https://picsum.photos/seed/athens/800/450'" },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["time", "category", "title", "details"],
                properties: {
                  time: { type: Type.STRING, description: "HH:MM format, e.g. 09:30" },
                  category: { type: Type.STRING, description: "One of: 行衣, 食他, 住行, 住他, 乘伙, 魚付, 住, 食物" },
                  title: { type: Type.STRING, description: "A high-status grand title of the activity" },
                  details: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Details or side-tasks of this event"
                  }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (jsonText) {
      const generatedDay = JSON.parse(jsonText.trim());
      // Assign IDs to the generated events
      if (generatedDay.events) {
        generatedDay.events = generatedDay.events.map((e: any, idx: number) => ({
          ...e,
          id: `ai-e-${idx}-${Date.now()}`
        }));
      }
      res.json({ data: generatedDay });
    } else {
      throw new Error('Empty response from Gemini');
    }
  } catch (error: any) {
    console.error('Gemini call failed:', error);
    res.status(500).json({ error: 'Gemini service failed to generate', details: error.message });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
