export const LUXURY_PRESENTATION_HTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>頂級奢華與禁忌之巔 - 四日極致行程</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&display=swap');
        
        body {
            font-family: 'Noto Serif TC', serif;
            background-color: #0a0a0a;
            color: #d4af37;
            overflow: hidden;
        }

        .slide {
            display: none;
            height: 100vh;
            width: 100vw;
            padding: 2rem;
            animation: fadeIn 0.8s ease-out forwards;
        }

        .slide.active {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .gold-border {
            border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .text-gradient {
            background: linear-gradient(to right, #d4af37, #fcf6ba, #d4af37);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .btn-nav {
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid #d4af37;
            transition: all 0.3s;
        }

        .btn-nav:hover {
            background: #d4af37;
            color: #000;
        }

        .tag {
            background: rgba(212, 175, 55, 0.2);
            padding: 2px 10px;
            border-radius: 4px;
            font-size: 0.8rem;
            margin-right: 8px;
            color: #fcf6ba;
        }

        /* 隱藏滾動條 */
        ::-webkit-scrollbar {
            display: none;
        }
    </style>
</head>
<body>

    <!-- Slide 1: Cover -->
    <div class="slide active" id="slide-0">
        <div class="text-center max-w-4xl p-12 gold-border bg-black bg-opacity-60 backdrop-blur-md relative">
            <h1 class="text-6xl font-bold mb-6 text-gradient italic">跨越國界的傲慢</h1>
            <p class="text-2xl tracking-widest text-gray-400 mb-8 font-light">頂級奢華與禁忌之巔：四日極致行程</p>
            <div class="h-1 w-32 bg-yellow-600 mx-auto mb-10"></div>
            
            <!-- Download Action -->
            <button onclick="downloadSelf()" class="text-xs border border-yellow-900 px-4 py-2 text-yellow-900 hover:text-yellow-600 hover:border-yellow-600 transition-colors">
                [ 點擊下載本簡報檔案 ]
            </button>
        </div>
    </div>

    <!-- Slide 2: Day 1 -->
    <div class="slide" id="slide-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full">
            <div class="space-y-6">
                <h2 class="text-4xl font-bold text-gradient">Day 1：【起航】羅馬</h2>
                <div class="gold-border p-5 bg-zinc-900 bg-opacity-40">
                    <p class="text-xl mb-2 font-bold"><span class="tag">09:00</span> 行/衣</p>
                    <p class="text-gray-400 leading-relaxed">勞斯萊斯 Phantom 抵達機坪。穿著雲朵觸感 100% Vicuna。金融路徑：$5M USD 至 BVI 空殼公司。</p>
                </div>
                <div class="gold-border p-5 bg-zinc-900 bg-opacity-40">
                    <p class="text-xl mb-2 font-bold"><span class="tag">10:30</span> 食/色</p>
                    <p class="text-gray-300 italic">伊朗 Almas 魚子醬。機上「高空素懶趴」舒壓。黑市獵頭直送。</p>
                </div>
            </div>
            <div class="space-y-6">
                <div class="gold-border p-5 bg-zinc-900 bg-opacity-40">
                    <p class="text-xl mb-2 font-bold"><span class="tag">15:00</span> 住/行</p>
                    <p class="text-gray-400 leading-relaxed">特警車隊封路送往 Hotel de la Ville。換裝 200支紗海島棉（黑珍珠扣）。安保費已匯出。</p>
                </div>
                <div class="gold-border p-5 bg-zinc-900 bg-opacity-40 border-red-900 border-opacity-50">
                    <p class="text-xl mb-2 font-bold text-red-400"><span class="tag">20:30</span> 梵蒂岡私密之夜</p>
                    <p class="text-gray-400 italic">腔棘魚腹肉刺身（科摩羅地下漁業）。黑色蕾絲吊帶美女於畫室侍奉。</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Slide 3: Day 2 -->
    <div class="slide" id="slide-2">
        <div class="max-w-5xl w-full">
            <h2 class="text-4xl font-bold text-gradient mb-10 text-center tracking-widest">Day 2：【荒漠】埃及 — 法老禁忌</h2>
            <div class="grid grid-cols-1 gap-6">
                <div class="gold-border p-6 bg-zinc-900 flex items-center space-x-8">
                    <div class="text-2xl font-serif text-yellow-700 w-32 border-r border-yellow-900">09:00 AM</div>
                    <div>
                        <p class="font-bold text-xl text-gray-200">加拉巴哥象龜精華清湯</p>
                        <p class="text-gray-400 italic">機上浴缸精油共浴。食材來自非法收藏家轉讓。</p>
                    </div>
                </div>
                <div class="gold-border p-6 bg-zinc-900 flex items-center space-x-8">
                    <div class="text-2xl font-serif text-yellow-700 w-32 border-r border-yellow-900">01:00 PM</div>
                    <div>
                        <p class="font-bold text-xl text-gray-200">金字塔禁區別墅</p>
                        <p class="text-gray-400 italic">直升機直達。香檳沐浴儀式。美女提供深喉服務。考古捐贈洗錢。</p>
                    </div>
                </div>
                <div class="gold-border p-6 bg-red-950 bg-opacity-10 border-red-900 flex items-center space-x-8">
                    <div class="text-2xl font-serif text-red-600 w-32 border-r border-red-900">07:30 PM</div>
                    <div>
                        <p class="font-bold text-xl text-red-400">小頭鼠海豚 (Vaquita) 嫩煎腹肉</p>
                        <p class="text-gray-400 italic">墨西哥黑幫直送。星空下「集體素懶趴」至入睡。</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Slide 4: Day 3 -->
    <div class="slide" id="slide-3">
        <div class="max-w-6xl w-full space-y-8">
            <div class="text-center">
                <h2 class="text-5xl font-bold text-gradient mb-2">Day 3：【豪賭】摩納哥</h2>
                <p class="text-gray-500 tracking-widest uppercase">Mediterranean Blood Romance</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="gold-border p-8 bg-zinc-900 text-center flex flex-col justify-between min-h-[300px]">
                    <h3 class="text-2xl font-bold border-b border-yellow-900 pb-4">私人航母</h3>
                    <p class="text-gray-400 italic">「人體盛」白犀牛脊髓。穿著 24K 金絲睡袍。藝術品抵押租金。</p>
                    <span class="text-yellow-800 text-xs">10:00 AM</span>
                </div>
                <div class="gold-border p-8 bg-zinc-900 text-center flex flex-col justify-between min-h-[300px]">
                    <h3 class="text-2xl font-bold border-b border-yellow-900 pb-4">Bugatti 狂飆</h3>
                    <p class="text-gray-400 italic">清場精品店。買斷千萬鑽石項鍊。啟動賭場「泥碼」洗錢。</p>
                    <span class="text-yellow-800 text-xs">04:00 PM</span>
                </div>
                <div class="gold-border p-8 bg-zinc-900 border-red-900 text-center flex flex-col justify-between min-h-[300px]">
                    <h3 class="text-2xl font-bold text-red-400 border-b border-red-900 pb-4">四龍搶珠</h3>
                    <p class="text-gray-400 italic">野生東北虎虎鞭補酒配犀牛排。煙火聲中享受極致服務。</p>
                    <span class="text-red-900 text-xs">09:00 PM</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Slide 5: Day 4 -->
    <div class="slide" id="slide-4">
        <div class="max-w-4xl w-full text-center space-y-12">
            <h2 class="text-4xl font-bold text-gradient italic tracking-widest">Day 4：【謝幕】凱子的優雅轉身</h2>
            <div class="space-y-8 text-left max-w-2xl mx-auto">
                <div class="flex items-start space-x-6 border-l-2 border-yellow-900 pl-6">
                    <span class="text-gray-500 font-mono">09:00</span>
                    <div>
                        <p class="font-bold text-xl">野生朱䴉肝醬配黑松露</p>
                        <p class="text-gray-500 text-sm">換上純蠶絲手工刺繡服。地下錢莊賄賂結清。</p>
                    </div>
                </div>
                <div class="flex items-start space-x-6 border-l-2 border-yellow-900 pl-6">
                    <span class="text-gray-500 font-mono">13:00</span>
                    <div>
                        <p class="font-bold text-xl">最後一次全體服侍</p>
                        <p class="text-gray-500 text-sm">簽署 $10M NDA 協議。鑽石分手禮發放。</p>
                    </div>
                </div>
                <div class="flex items-start space-x-6 border-l-2 border-red-900 pl-6 bg-red-900 bg-opacity-5 py-4">
                    <span class="text-red-900 font-mono">21:00</span>
                    <div>
                        <p class="font-bold text-xl text-red-400">焚化與回歸</p>
                        <p class="text-gray-500 text-sm italic">抵達莊園。衣物直接丟入焚化爐。帳目洗錢路徑銷毀。</p>
                    </div>
                </div>
            </div>
            <p class="text-2xl text-gray-400 tracking-[0.5em] font-light">E N D</p>
        </div>
    </div>

    <!-- Navigation -->
    <div class="fixed bottom-10 left-0 right-0 flex justify-center items-center space-x-12 z-50">
        <button onclick="prevSlide()" class="btn-nav px-8 py-2 rounded-full text-sm tracking-widest">PREV</button>
        <div id="slide-counter" class="text-yellow-700 font-mono text-lg">1 / 5</div>
        <button onclick="nextSlide()" class="btn-nav px-8 py-2 rounded-full text-sm tracking-widest">NEXT</button>
    </div>

    <script>
        let currentSlide = 0;
        const totalSlides = 5;

        function showSlide(index) {
            document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
            document.getElementById(\`slide-\\\${index}\`).classList.add('active');
            document.getElementById('slide-counter').innerText = \\\`\\\${index + 1} / \\\${totalSlides}\\\`;
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        }

        // 鍵盤導航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        });

        // 下載功能
        function downloadSelf() {
            const htmlContent = document.documentElement.outerHTML;
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Luxury_Itinerary_Presentation.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
