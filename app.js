(function() {
    // ============ SAFE LOCAL STORAGE ============
    function safeGetJSON(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            const parsed = JSON.parse(item);
            return (typeof defaultValue === 'object' && defaultValue !== null) ?
                (Array.isArray(defaultValue) ? (Array.isArray(parsed) ? parsed : defaultValue) : (typeof parsed === 'object' && parsed !== null ? parsed : defaultValue)) :
                parsed;
        } catch (e) {
            console.warn(`Erro ao ler ${key} do localStorage:`, e);
            return defaultValue;
        }
    }
    function safeSetJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Erro ao salvar ${key} no localStorage:`, e);
        }
    }

    // ============ DATABASE ============
    const exerciseDB = [
        { nome: "Australian Pull Up", nivel: "Iniciante", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Core"], tipo: "Pull", xp: 15 },
        { nome: "Pull Up", nivel: "Iniciante", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Antebraço"], tipo: "Pull", xp: 20 },
        { nome: "Chin Up", nivel: "Iniciante", grupo_principal: "Bíceps", grupos_secundarios: ["Dorsal", "Core"], tipo: "Pull", xp: 20 },
        { nome: "Archer Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Ombro"], tipo: "Pull", xp: 35 },
        { nome: "Typewriter Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Core"], tipo: "Pull", xp: 35 },
        { nome: "Chest-to-Bar Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Trapézio"], tipo: "Pull", xp: 35 },
        { nome: "Explosive Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Ombro"], tipo: "Pull", xp: 40 },
        { nome: "Muscle Up", nivel: "Avançado", grupo_principal: "Costas", grupos_secundarios: ["Peitoral", "Tríceps", "Core"], tipo: "Pull", xp: 70 },
        { nome: "One Arm Pull Up", nivel: "Avançado", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Core"], tipo: "Pull", xp: 80 },
        { nome: "Incline Push Up", nivel: "Iniciante", grupo_principal: "Peitoral", grupos_secundarios: ["Ombro", "Tríceps"], tipo: "Push", xp: 10 },
        { nome: "Push Up", nivel: "Iniciante", grupo_principal: "Peitoral", grupos_secundarios: ["Ombro", "Tríceps"], tipo: "Push", xp: 12 },
        { nome: "Diamond Push Up", nivel: "Iniciante", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Push", xp: 15 },
        { nome: "Decline Push Up", nivel: "Intermediário", grupo_principal: "Peitoral Superior", grupos_secundarios: ["Ombro"], tipo: "Push", xp: 25 },
        { nome: "Archer Push Up", nivel: "Intermediário", grupo_principal: "Peitoral", grupos_secundarios: ["Ombro", "Core"], tipo: "Push", xp: 30 },
        { nome: "Ring Push Up", nivel: "Intermediário", grupo_principal: "Peitoral", grupos_secundarios: ["Core", "Ombro"], tipo: "Push", xp: 30 },
        { nome: "Pseudo Planche Push Up", nivel: "Avançado", grupo_principal: "Ombro", grupos_secundarios: ["Peitoral", "Core"], tipo: "Push", xp: 55 },
        { nome: "Planche Push Up", nivel: "Avançado", grupo_principal: "Ombro", grupos_secundarios: ["Peitoral", "Core"], tipo: "Push", xp: 75 },
        { nome: "Pike Hold", nivel: "Iniciante", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 12 },
        { nome: "Pike Push Up", nivel: "Iniciante", grupo_principal: "Ombros", grupos_secundarios: ["Tríceps"], tipo: "Ombros", xp: 18 },
        { nome: "Elevated Pike Push Up", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 28 },
        { nome: "Wall Handstand Hold", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 25 },
        { nome: "Handstand Push Up Negativa", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: ["Tríceps"], tipo: "Ombros", xp: 32 },
        { nome: "Handstand Push Up", nivel: "Avançado", grupo_principal: "Ombros", grupos_secundarios: ["Core", "Tríceps"], tipo: "Ombros", xp: 60 },
        { nome: "Freestanding HSPU", nivel: "Avançado", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 70 },
        { nome: "Bench Dip", nivel: "Iniciante", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Tríceps", xp: 10 },
        { nome: "Parallel Bar Dip", nivel: "Intermediário", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Tríceps", xp: 28 },
        { nome: "Korean Dip", nivel: "Intermediário", grupo_principal: "Tríceps", grupos_secundarios: ["Ombro"], tipo: "Tríceps", xp: 32 },
        { nome: "Ring Dip", nivel: "Avançado", grupo_principal: "Tríceps", grupos_secundarios: ["Core"], tipo: "Tríceps", xp: 50 },
        { nome: "Straight Bar Dip", nivel: "Avançado", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Tríceps", xp: 55 },
        { nome: "Hollow Body Hold", nivel: "Iniciante", grupo_principal: "Abdômen", grupos_secundarios: ["Lombar"], tipo: "Core", xp: 10 },
        { nome: "Dead Bug", nivel: "Iniciante", grupo_principal: "Abdômen", grupos_secundarios: ["Lombar"], tipo: "Core", xp: 10 },
        { nome: "Knee Raise", nivel: "Iniciante", grupo_principal: "Abdômen", grupos_secundarios: ["Flexores do Quadril"], tipo: "Core", xp: 12 },
        { nome: "Leg Raise", nivel: "Intermediário", grupo_principal: "Abdômen", grupos_secundarios: ["Core"], tipo: "Core", xp: 22 },
        { nome: "Toes to Bar", nivel: "Intermediário", grupo_principal: "Abdômen", grupos_secundarios: ["Costas"], tipo: "Core", xp: 28 },
        { nome: "Dragon Flag", nivel: "Avançado", grupo_principal: "Core", grupos_secundarios: ["Lombar"], tipo: "Core", xp: 55 },
        { nome: "Windshield Wiper", nivel: "Avançado", grupo_principal: "Core", grupos_secundarios: ["Ombros"], tipo: "Core", xp: 60 },
        { nome: "Agachamento Livre", nivel: "Iniciante", grupo_principal: "Quadríceps", grupos_secundarios: ["Glúteos"], tipo: "Pernas", xp: 12 },
        { nome: "Afundo", nivel: "Iniciante", grupo_principal: "Quadríceps", grupos_secundarios: ["Glúteos"], tipo: "Pernas", xp: 12 },
        { nome: "Step Up", nivel: "Iniciante", grupo_principal: "Quadríceps", grupos_secundarios: ["Panturrilha"], tipo: "Pernas", xp: 10 },
        { nome: "Bulgarian Split Squat", nivel: "Intermediário", grupo_principal: "Quadríceps", grupos_secundarios: ["Glúteos"], tipo: "Pernas", xp: 25 },
        { nome: "Jump Squat", nivel: "Intermediário", grupo_principal: "Quadríceps", grupos_secundarios: ["Panturrilha"], tipo: "Pernas", xp: 22 },
        { nome: "Pistol Squat Assistido", nivel: "Intermediário", grupo_principal: "Quadríceps", grupos_secundarios: ["Core"], tipo: "Pernas", xp: 28 },
        { nome: "Pistol Squat", nivel: "Avançado", grupo_principal: "Quadríceps", grupos_secundarios: ["Core"], tipo: "Pernas", xp: 50 },
        { nome: "Shrimp Squat", nivel: "Avançado", grupo_principal: "Quadríceps", grupos_secundarios: ["Core"], tipo: "Pernas", xp: 52 },
        { nome: "Scapula Pull", nivel: "Iniciante", grupo_principal: "Front Lever", grupos_secundarios: ["Costas"], tipo: "Front Lever", xp: 15 },
        { nome: "Tuck Front Lever Hold", nivel: "Iniciante", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 20 },
        { nome: "Advanced Tuck Front Lever", nivel: "Intermediário", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 35 },
        { nome: "One Leg Front Lever", nivel: "Intermediário", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 40 },
        { nome: "Straddle Front Lever", nivel: "Avançado", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 60 },
        { nome: "Full Front Lever", nivel: "Avançado", grupo_principal: "Front Lever", grupos_secundarios: ["Corpo inteiro"], tipo: "Front Lever", xp: 75 },
        { nome: "Front Lever Pull Up", nivel: "Elite", grupo_principal: "Front Lever", grupos_secundarios: ["Bíceps", "Core"], tipo: "Front Lever", xp: 100 },
        { nome: "Frog Stand", nivel: "Iniciante", grupo_principal: "Planche", grupos_secundarios: ["Ombros"], tipo: "Planche", xp: 15 },
        { nome: "Planche Lean", nivel: "Iniciante", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 18 },
        { nome: "Tuck Planche", nivel: "Intermediário", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 35 },
        { nome: "Advanced Tuck Planche", nivel: "Intermediário", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 40 },
        { nome: "Straddle Planche", nivel: "Avançado", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 65 },
        { nome: "Full Planche", nivel: "Avançado", grupo_principal: "Planche", grupos_secundarios: ["Corpo inteiro"], tipo: "Planche", xp: 85 },
        { nome: "Planche Push Up (Elite)", nivel: "Elite", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Peitoral", "Core"], tipo: "Planche", xp: 110 },
        { nome: "Wall Walk", nivel: "Iniciante", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 15 },
        { nome: "Wall Handstand", nivel: "Iniciante", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 18 },
        { nome: "Shoulder Tap", nivel: "Intermediário", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 30 },
        { nome: "Freestanding Handstand", nivel: "Intermediário", grupo_principal: "Handstand", grupos_secundarios: ["Core"], tipo: "Handstand", xp: 40 },
        { nome: "Handstand Press", nivel: "Avançado", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 65 },
        { nome: "One Arm Handstand", nivel: "Elite", grupo_principal: "Handstand", grupos_secundarios: ["Core", "Ombros"], tipo: "Handstand", xp: 120 },
        { nome: "Vertical Flag Hold", nivel: "Iniciante", grupo_principal: "Human Flag", grupos_secundarios: ["Ombros", "Core"], tipo: "Human Flag", xp: 20 },
        { nome: "Tuck Flag", nivel: "Intermediário", grupo_principal: "Human Flag", grupos_secundarios: ["Core", "Ombros"], tipo: "Human Flag", xp: 35 },
        { nome: "Advanced Tuck Flag", nivel: "Intermediário", grupo_principal: "Human Flag", grupos_secundarios: ["Core", "Ombros"], tipo: "Human Flag", xp: 40 },
        { nome: "Straddle Flag", nivel: "Avançado", grupo_principal: "Human Flag", grupos_secundarios: ["Core", "Ombros"], tipo: "Human Flag", xp: 60 },
        { nome: "Full Human Flag", nivel: "Avançado", grupo_principal: "Human Flag", grupos_secundarios: ["Corpo inteiro"], tipo: "Human Flag", xp: 80 },
        { nome: "Human Flag Pull Up", nivel: "Elite", grupo_principal: "Human Flag", grupos_secundarios: ["Costas", "Core", "Ombros"], tipo: "Human Flag", xp: 130 },
        { nome: "Muscle Up (Full Body)", nivel: "Avançado", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Costas","Peitoral","Ombros","Tríceps","Core"], tipo: "Corpo Inteiro", xp: 70 },
        { nome: "Front Lever Pull Up (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Costas","Bíceps","Core"], tipo: "Corpo Inteiro", xp: 100 },
        { nome: "Planche Push Up (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Ombros","Peitoral","Core","Tríceps"], tipo: "Corpo Inteiro", xp: 110 },
        { nome: "Human Flag (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Ombros","Costas","Core"], tipo: "Corpo Inteiro", xp: 80 },
        { nome: "One Arm Pull Up (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Costas","Bíceps","Core"], tipo: "Corpo Inteiro", xp: 80 },
        { nome: "Full Planche (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Corpo inteiro"], tipo: "Corpo Inteiro", xp: 85 },
        { nome: "Full Front Lever (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Corpo inteiro"], tipo: "Corpo Inteiro", xp: 75 }
    ];

    // Atribuir duração padrão para cada exercício (em segundos)
    exerciseDB.forEach(ex => {
        if (!ex.duracao) {
            if (ex.nome.toLowerCase().includes('hold') || ex.nome.toLowerCase().includes('flag') ||
                ex.tipo === 'Front Lever' || ex.tipo === 'Planche' || ex.tipo === 'Human Flag') {
                ex.duracao = 30;
            } else if (ex.tipo === 'Handstand' || ex.nome.toLowerCase().includes('handstand')) {
                ex.duracao = 30;
            } else if (ex.tipo === 'Core' && (ex.nome.includes('Hold') || ex.nome.includes('Flag'))) {
                ex.duracao = 30;
            } else if (ex.tipo === 'Pernas' || ex.tipo === 'Push' || ex.tipo === 'Pull' || ex.tipo === 'Ombros' || ex.tipo === 'Tríceps') {
                ex.duracao = 45;
            } else if (ex.tipo === 'Corpo Inteiro') {
                ex.duracao = 60;
            } else {
                ex.duracao = 45;
            }
        }
    });

    // ============ STATE ============
    let currentWorkout = [];
    let savedWorkouts = safeGetJSON('calisthenicsBlue_workouts', []);
    let userXP = parseInt(localStorage.getItem('calisthenicsBlue_xp') || '0', 10);
    let totalExercisesDone = parseInt(localStorage.getItem('calisthenicsBlue_totalEx') || '0', 10);
    let trainingDays = safeGetJSON('calisthenicsBlue_days', []);
    let workoutHistory = safeGetJSON('calisthenicsBlue_history', []);
    let activeWorkoutIndex = -1;
    let currentExerciseIndex = 0;
    let timerInterval = null;
    let timerRemaining = 60;
    let timerRunning = false;
    let currentFilter = 'all';
    let iaGeneratedWorkout = [];
    let apiKey = localStorage.getItem('calisthenicsBlue_apiKey') || '';

    // ============ AUDIO (som do cronômetro) ============
    function playBeep(frequency = 880, duration = 0.3, type = 'sine') {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 0.3;
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // navegador sem suporte, silenciosamente ignora
        }
    }

    function playAlarm() {
        playBeep(880, 0.2);
        setTimeout(() => playBeep(880, 0.2), 300);
        setTimeout(() => playBeep(880, 0.3), 600);
    }

    // ============ API KEY MANAGEMENT ============
    function saveApiKey() {
        apiKey = document.getElementById('apiKey').value.trim();
        localStorage.setItem('calisthenicsBlue_apiKey', apiKey);
        showToast('🔑 Chave salva!', 'success');
    }

    // ============ GEMINI API CALL ============
   async function generateIATraining(lacunas = null) {
    const btn = document.querySelector('#page-ia .btn-primary'); // ou o botão de gerar
    if (btn) btn.disabled = true; // evita duplo clique

    if (apiKey) {
        try {
            const level = document.getElementById('iaLevel').value;
            const focus = document.getElementById('iaFocus').value;
            const num = parseInt(document.getElementById('iaNumExercises').value) || 5;
            
            let prompt = `Você é um treinador de calistenia. Gere um treino de ${num} exercícios para um atleta nível ${level} com foco em ${focus}.`;
            if (lacunas && lacunas.length > 0) {
                prompt += ` Priorize os seguintes grupos musculares pouco trabalhados: ${lacunas.join(', ')}.`;
            }
            prompt += `\nRetorne APENAS uma lista JSON com objetos { "nome": "...", "grupo_principal": "...", "xp": numero }. Escolha exercícios realistas de calistenia. Não use código markdown.`;
            
            const text = await callGemini(prompt);
            const jsonStr = text.replace(/```json|```/g, '').trim();
            const exercises = JSON.parse(jsonStr);
            
            iaGeneratedWorkout = exercises.map(ex => ({
                nome: ex.nome,
                grupo_principal: ex.grupo_principal || 'Corpo Inteiro',
                nivel: level,
                tipo: ex.grupo_principal,
                xp: ex.xp || 20
            }));
            
            document.getElementById('iaResult').innerHTML = iaGeneratedWorkout.map((e,i) => `
                <div class="exercise-item">
                    <div class="ex-info">
                        <div class="ex-name">${i+1}. ${e.nome}</div>
                        <div class="ex-meta">${e.grupo_principal} • ${e.xp} XP</div>
                    </div>
                </div>
            `).join('') + `<p class="mt-2"><strong>XP Total:</strong> ${iaGeneratedWorkout.reduce((s,e)=>s+e.xp,0)} XP</p>`;
            
            document.getElementById('iaResultCard').style.display = 'block';
            showToast('✨ Treino gerado pela IA com sucesso!', 'success');
            if (btn) btn.disabled = false;
            return;
        } catch (err) {
            console.error(err);
            // Silenciosamente cai para o fallback
        }
    }
    
    // Fallback (método tradicional) – executado se não houver chave ou se a IA falhar
    const level = document.getElementById('iaLevel').value;
    const focus = document.getElementById('iaFocus').value;
    const num = parseInt(document.getElementById('iaNumExercises').value) || 5;
    
    let pool = exerciseDB.filter(e => {
        const order = ['Iniciante','Intermediário','Avançado','Elite'];
        return order.indexOf(e.nivel) <= order.indexOf(level);
    });
    
    if (focus !== 'Full Body') {
        pool = pool.filter(e => e.grupo_principal === focus || e.tipo === focus || (e.grupos_secundarios || []).includes(focus));
    }
    
    if (!pool.length) pool = exerciseDB.filter(e => e.nivel === level || e.nivel === 'Iniciante');
    
    if (lacunas && lacunas.length > 0) {
        pool.sort((a, b) => {
            const aIsPriority = lacunas.includes(a.grupo_principal) ? 0 : 1;
            const bIsPriority = lacunas.includes(b.grupo_principal) ? 0 : 1;
            return aIsPriority - bIsPriority;
        });
    }
    
    iaGeneratedWorkout = [...pool].sort(() => Math.random() - 0.5).slice(0, num);
    
    document.getElementById('iaResult').innerHTML = iaGeneratedWorkout.map((e, i) => `
        <div class="exercise-item">
            <div class="ex-info">
                <div class="ex-name">${i+1}. ${e.nome}</div>
                <div class="ex-meta">${e.grupo_principal} • ${e.xp} XP</div>
            </div>
        </div>
    `).join('') + `<p class="mt-2"><strong>XP Total:</strong> ${iaGeneratedWorkout.reduce((s,e)=>s+e.xp,0)} XP</p>`;
    
    document.getElementById('iaResultCard').style.display = 'block';
    
    // Mensagem única de fallback
    if (apiKey) {
        showToast('⚠️ IA indisponível no momento. Treino gerado pelo método tradicional.', 'warning');
    } else {
        showToast('✨ Treino gerado com sucesso!', 'success');
    }
    
    if (btn) btn.disabled = false;
}

    // ============ FUNCTIONS ============
    function getUserLevel() {
        if (userXP >= 3000) return 'Elite';
        if (userXP >= 1500) return 'Avançado';
        if (userXP >= 500) return 'Intermediário';
        return 'Iniciante';
    }
    function getLevelNumber() {
        if (userXP >= 5000) return 5;
        if (userXP >= 3000) return 4;
        if (userXP >= 1500) return 3;
        if (userXP >= 500) return 2;
        return 1;
    }
    function getXPForNextLevel() {
        const thresholds = [0, 500, 1500, 3000, 5000, 10000];
        return thresholds[getLevelNumber()] || 10000;
    }
    function getXPProgress() {
        const thresholds = [0, 500, 1500, 3000, 5000, 10000];
        const level = getLevelNumber();
        const current = thresholds[level - 1] || 0;
        const next = thresholds[level] || 10000;
        return Math.min(100, Math.max(0, ((userXP - current) / (next - current)) * 100));
    }
    function updateXPDisplay() {
        document.getElementById('userXP').textContent = userXP;
        document.getElementById('userLevel').textContent = getLevelNumber();
        document.getElementById('xpBarFill').style.width = getXPProgress() + '%';
        document.getElementById('xpNext').textContent = getXPForNextLevel();
        document.getElementById('xpNextLevel').textContent = getLevelNumber() + 1;
        document.getElementById('athleteLevel').textContent = getUserLevel();
        document.getElementById('progressXP').textContent = userXP;
        document.getElementById('progressLevel').textContent = getLevelNumber();
        document.getElementById('progressDays').textContent = trainingDays.length;
        document.getElementById('progressTotalEx').textContent = totalExercisesDone;
        document.getElementById('totalExercisesDone').textContent = totalExercisesDone;
        document.getElementById('savedWorkoutsCount').textContent = savedWorkouts.length;
        updateStreak();
    }
    function updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        let streak = 0;
        const sorted = [...trainingDays].sort().reverse();
        for (let i = 0; i < sorted.length; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            if (sorted[i] === d.toISOString().split('T')[0]) streak++;
            else break;
        }
        document.getElementById('streakDays').textContent = streak;
    }
    function showToast(msg, type='info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.borderLeft = `4px solid ${type==='success'?'var(--success)':type==='error'?'var(--danger)':'var(--primary)'}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(()=>toast.remove(), 2800);
    }
    function saveAllState() {
        safeSetJSON('calisthenicsBlue_workouts', savedWorkouts);
        localStorage.setItem('calisthenicsBlue_xp', userXP.toString());
        localStorage.setItem('calisthenicsBlue_totalEx', totalExercisesDone.toString());
        safeSetJSON('calisthenicsBlue_days', trainingDays);
        safeSetJSON('calisthenicsBlue_history', workoutHistory);
    }
    function registerTrainingDay() {
        const today = new Date().toISOString().split('T')[0];
        if (!trainingDays.includes(today)) {
            trainingDays.push(today);
            saveAllState();
            updateXPDisplay();
            showToast('🔥 Dia registrado!', 'success');
        } else showToast('📅 Hoje já foi registrado.', 'info');
    }
    function awardXP(amount) {
        userXP += amount;
        totalExercisesDone += 1;
        const today = new Date().toISOString().split('T')[0];
        if (!trainingDays.includes(today)) trainingDays.push(today);
        saveAllState();
        updateXPDisplay();
        showToast(`+${amount} XP!`, 'success');
    }
    function getBadgeClass(nivel) {
        return { 'Iniciante':'badge-iniciante', 'Intermediário':'badge-intermediario', 'Avançado':'badge-avancado', 'Elite':'badge-elite' }[nivel] || 'badge-iniciante';
    }
    function renderExerciseLibrary(filter='all') {
        const container = document.getElementById('exerciseLibrary');
        let exs = exerciseDB;
        if (filter !== 'all') exs = exs.filter(e => e.tipo===filter || e.grupo_principal===filter || (e.grupos_secundarios||[]).includes(filter));
        container.innerHTML = exs.map((ex,i) => `
        <div class="exercise-item" draggable="true" data-exercise-index="${exerciseDB.indexOf(ex)}" ondragstart="handleDragStart(event,${exerciseDB.indexOf(ex)})" ondragend="handleDragEnd(event)">
          <div class="ex-info"><div class="ex-name">${ex.nome}</div><div class="ex-meta">${ex.grupo_principal} • <span class="badge ${getBadgeClass(ex.nivel)}">${ex.nivel}</span> • ${ex.xp} XP</div></div>
          <span style="font-size:1.2rem;">⋮⋮</span>
        </div>`).join('');
    }
    function renderChosenExercises() {
        const container = document.getElementById('chosenExercises');
        document.getElementById('dropPlaceholder').style.display = currentWorkout.length ? 'none' : 'block';
        container.innerHTML = currentWorkout.map((ex,i) => `
        <div class="exercise-item" style="cursor:default;border-color:var(--primary);">
          <div class="ex-info"><div class="ex-name">${i+1}. ${ex.nome}</div><div class="ex-meta">${ex.grupo_principal} • ${ex.xp} XP</div></div>
          <button class="btn btn-danger btn-sm" onclick="removeFromWorkout(${i})">✕</button>
        </div>`).join('');
        updateActiveWorkoutSelect();
    }
    function removeFromWorkout(i) { currentWorkout.splice(i,1); renderChosenExercises(); }
    function handleDragStart(e, idx) { e.dataTransfer.setData('text/plain', idx.toString()); e.target.classList.add('dragging'); }
    function handleDragEnd(e) { e.target.classList.remove('dragging'); }
    function handleDragOver(e) { e.preventDefault(); document.getElementById('dropZone').classList.add('drag-over'); }
    function handleDragLeave(e) { document.getElementById('dropZone').classList.remove('drag-over'); }
    function handleDrop(e) {
        e.preventDefault();
        document.getElementById('dropZone').classList.remove('drag-over');
        const idx = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(idx) && exerciseDB[idx]) { currentWorkout.push({...exerciseDB[idx]}); renderChosenExercises(); showToast(`➕ ${exerciseDB[idx].nome} adicionado!`,'success'); }
    }
    function clearWorkout() { currentWorkout=[]; renderChosenExercises(); document.getElementById('workoutName').value=''; showToast('Treino limpo!','info'); }
    function saveWorkout() {
        if (!currentWorkout.length) return showToast('⚠️ Adicione exercícios.','error');
        const name = document.getElementById('workoutName').value.trim() || 'Treino '+(savedWorkouts.length+1);
        savedWorkouts.push({ id: Date.now(), name, exercises: [...currentWorkout], createdAt: new Date().toISOString(), totalXP: currentWorkout.reduce((s,e)=>s+e.xp,0) });
        saveAllState(); currentWorkout=[]; document.getElementById('workoutName').value=''; renderChosenExercises(); renderSavedWorkouts(); updateXPDisplay();
        showToast(`💾 "${name}" salvo!`,'success');
    }
    function renderSavedWorkouts() {
        const c = document.getElementById('savedWorkoutsList');
        c.innerHTML = savedWorkouts.length ? savedWorkouts.map((w,i)=>`<div class="exercise-item" style="cursor:default;justify-content:space-between;"><div><strong>${w.name}</strong><div class="ex-meta">${w.exercises.length} ex. • ${w.totalXP} XP</div></div><div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick="loadWorkoutForEditing(${i})">📋</button><button class="btn btn-danger btn-sm" onclick="deleteWorkout(${i})">🗑️</button></div></div>`).join('') : '<p style="color:var(--text2);">Nenhum treino salvo.</p>';
        updateActiveWorkoutSelect(); updateUpcomingWorkouts();
    }
    function loadWorkoutForEditing(i) { currentWorkout=[...savedWorkouts[i].exercises]; document.getElementById('workoutName').value=savedWorkouts[i].name; renderChosenExercises(); navigateTo('build', document.querySelector('[data-page=build]')); }
    function deleteWorkout(i) { if(confirm(`Deletar "${savedWorkouts[i].name}"?`)) { savedWorkouts.splice(i,1); saveAllState(); renderSavedWorkouts(); updateXPDisplay(); } }
    function updateActiveWorkoutSelect() {
        document.getElementById('activeWorkoutSelect').innerHTML = '<option value="">-- Selecione --</option>' + savedWorkouts.map((w,i)=>`<option value="${i}">${w.name} (${w.exercises.length} ex.)</option>`).join('');
    }
    function updateUpcomingWorkouts() {
        document.getElementById('upcomingWorkouts').innerHTML = savedWorkouts.length ? savedWorkouts.slice(-3).reverse().map(w=>`<div style="padding:6px 0;border-bottom:1px solid var(--border);">📋 <strong>${w.name}</strong> - ${w.totalXP} XP</div>`).join('')+'<button class="btn btn-outline btn-sm mt-2" onclick="navigateTo(\'build\', document.querySelector(\'[data-page=build]\'))">Ver Todos</button>' : 'Nenhum treino agendado.';
    }
    function exportToGoogleCalendar() {
        if(!currentWorkout.length) return showToast('⚠️ Monte um treino antes.','error');
        const name = document.getElementById('workoutName').value.trim()||'Treino Calisthenics Blue';
        const desc = currentWorkout.map((e,i)=>`${i+1}. ${e.nome} (${e.xp} XP)`).join('\n');
        const now = new Date(); const start = new Date(now.getTime()+3600000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        const end = new Date(now.getTime()+7200000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&details=${encodeURIComponent(desc)}&dates=${start}/${end}`, '_blank');
        showToast('📅 Abrindo Google Agenda...','success');
    }
    function exportIAToCalendar() {
        if(!iaGeneratedWorkout.length) return showToast('⚠️ Gere um treino IA primeiro.','error');
        const desc = iaGeneratedWorkout.map((e,i)=>`${i+1}. ${e.nome} (${e.xp} XP)`).join('\n');
        const now = new Date(); const start = new Date(now.getTime()+3600000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        const end = new Date(now.getTime()+7200000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Treino IA Calisthenics')}&details=${encodeURIComponent(desc)}&dates=${start}/${end}`, '_blank');
        showToast('📅 Google Agenda IA!','success');
    }

    // NOVA VERSÃO: IA real com fallback
    async function generateIATraining(lacunas = null) {
        if (apiKey) {
            showToast('🤖 Consultando IA...', 'info');
            try {
                const level = document.getElementById('iaLevel').value;
                const focus = document.getElementById('iaFocus').value;
                const num = parseInt(document.getElementById('iaNumExercises').value) || 5;
                
                let prompt = `Você é um treinador de calistenia. Gere um treino de ${num} exercícios para um atleta nível ${level} com foco em ${focus}.`;
                if (lacunas && lacunas.length > 0) {
                    prompt += ` Priorize os seguintes grupos musculares pouco trabalhados: ${lacunas.join(', ')}.`;
                }
                prompt += `\nRetorne APENAS uma lista JSON com objetos { "nome": "...", "grupo_principal": "...", "xp": numero }. Escolha exercícios realistas de calistenia. Não use código markdown.`;
                
                const text = await callGemini(prompt);
                const jsonStr = text.replace(/```json|```/g, '').trim();
                const exercises = JSON.parse(jsonStr);
                
                iaGeneratedWorkout = exercises.map(ex => ({
                    nome: ex.nome,
                    grupo_principal: ex.grupo_principal || 'Corpo Inteiro',
                    nivel: level,
                    tipo: ex.grupo_principal,
                    xp: ex.xp || 20
                }));
                
                document.getElementById('iaResult').innerHTML = iaGeneratedWorkout.map((e,i) => `
                    <div class="exercise-item">
                        <div class="ex-info">
                            <div class="ex-name">${i+1}. ${e.nome}</div>
                            <div class="ex-meta">${e.grupo_principal} • ${e.xp} XP</div>
                        </div>
                    </div>
                `).join('') + `<p class="mt-2"><strong>XP Total:</strong> ${iaGeneratedWorkout.reduce((s,e)=>s+e.xp,0)} XP</p>`;
                
                document.getElementById('iaResultCard').style.display = 'block';
                showToast('✨ Treino IA gerado com sucesso!', 'success');
                return;
            } catch (err) {
                console.error(err);
                showToast('⚠️ Falha na IA. Usando método tradicional.', 'error');
            }
        }
        
        // Fallback: método tradicional
        const level = document.getElementById('iaLevel').value;
        const focus = document.getElementById('iaFocus').value;
        const num = parseInt(document.getElementById('iaNumExercises').value) || 5;
        
        let pool = exerciseDB.filter(e => {
            const order = ['Iniciante','Intermediário','Avançado','Elite'];
            return order.indexOf(e.nivel) <= order.indexOf(level);
        });
        
        if (focus !== 'Full Body') {
            pool = pool.filter(e => e.grupo_principal === focus || e.tipo === focus || (e.grupos_secundarios || []).includes(focus));
        }
        
        if (!pool.length) pool = exerciseDB.filter(e => e.nivel === level || e.nivel === 'Iniciante');
        
        if (lacunas && lacunas.length > 0) {
            pool.sort((a, b) => {
                const aIsPriority = lacunas.includes(a.grupo_principal) ? 0 : 1;
                const bIsPriority = lacunas.includes(b.grupo_principal) ? 0 : 1;
                return aIsPriority - bIsPriority;
            });
        }
        
        iaGeneratedWorkout = [...pool].sort(() => Math.random() - 0.5).slice(0, num);
        
        document.getElementById('iaResult').innerHTML = iaGeneratedWorkout.map((e, i) => `
            <div class="exercise-item">
                <div class="ex-info">
                    <div class="ex-name">${i+1}. ${e.nome}</div>
                    <div class="ex-meta">${e.grupo_principal} • ${e.xp} XP</div>
                </div>
            </div>
        `).join('') + `<p class="mt-2"><strong>XP Total:</strong> ${iaGeneratedWorkout.reduce((s,e)=>s+e.xp,0)} XP</p>`;
        
        document.getElementById('iaResultCard').style.display = 'block';
        showToast('✨ Treino IA gerado!', 'success');
    }

    function useIATraining() {
        if(!iaGeneratedWorkout.length) return showToast('⚠️ Gere um treino IA.','error');
        currentWorkout=[...iaGeneratedWorkout]; document.getElementById('workoutName').value='Treino IA'; renderChosenExercises(); navigateTo('build', document.querySelector('[data-page=build]'));
    }

    function loadActiveWorkout() {
        const idx = parseInt(document.getElementById('activeWorkoutSelect').value);
        if(isNaN(idx)||!savedWorkouts[idx]) { document.getElementById('activeWorkoutDisplay').innerHTML='<p style="color:var(--text2);">Selecione um treino.</p>'; document.getElementById('completeExerciseBtn').disabled=true; activeWorkoutIndex=-1; return; }
        activeWorkoutIndex=idx; currentExerciseIndex=0; renderActiveWorkout(); document.getElementById('completeExerciseBtn').disabled=false;
    }

    function renderActiveWorkout() {
        if(activeWorkoutIndex<0) return;
        const w = savedWorkouts[activeWorkoutIndex];
        document.getElementById('activeWorkoutDisplay').innerHTML = w.exercises.map((e,i)=>`<div class="exercise-item" style="cursor:default;${i===currentExerciseIndex?'border:2px solid var(--primary-light);background:var(--primary-dark);':''}"><div class="ex-info"><div class="ex-name">${i+1}. ${e.nome} ${i===currentExerciseIndex?'⬅️ ATUAL':''}</div><div class="ex-meta">${e.xp} XP</div></div>${i<currentExerciseIndex?'<span style="color:var(--success);">✅</span>':''}</div>`).join('');

        if (currentExerciseIndex < w.exercises.length) {
            const currentEx = w.exercises[currentExerciseIndex];
            const duracao = currentEx.duracao || 45;
            document.getElementById('timerSeconds').value = duracao;
            resetTimer();
        }

        if(currentExerciseIndex < w.exercises.length) {
            const cur = w.exercises[currentExerciseIndex];
            document.getElementById('currentExerciseHighlight').style.display='block';
            document.getElementById('currentExerciseHighlight').innerHTML = `<strong>🏋️ Executando:</strong> ${cur.nome} (${cur.xp} XP)`;
        } else {
            document.getElementById('currentExerciseHighlight').style.display='none';
            document.getElementById('completeExerciseBtn').disabled=true;
            showToast('🏆 Treino concluído!','success');
            awardXP(w.totalXP);
            const gruposTrabalhados = [...new Set(w.exercises.map(ex => ex.grupo_principal))];
            workoutHistory.push({
                name: w.name,
                date: new Date().toISOString(),
                exercises: w.exercises.length,
                xp: w.totalXP,
                groups: gruposTrabalhados
            });
            saveAllState();
            renderHistory();
        }
    }

    function completeCurrentExercise() {
        if(activeWorkoutIndex<0) return;
        const w = savedWorkouts[activeWorkoutIndex];
        if(currentExerciseIndex < w.exercises.length) { awardXP(w.exercises[currentExerciseIndex].xp); currentExerciseIndex++; renderActiveWorkout(); resetTimer(); }
    }

    function skipExercise() { if(activeWorkoutIndex>=0) { currentExerciseIndex++; renderActiveWorkout(); resetTimer(); } }

    function renderHistory() {
        const container = document.getElementById('historyList');
        if (!workoutHistory.length) {
            container.innerHTML = '<p style="color:var(--text2);">Nenhum treino concluído ainda.</p>';
            return;
        }
        container.innerHTML = workoutHistory.slice(-10).reverse().map(h => {
            const gruposStr = (h.groups || []).join(', ');
            return `<div style="padding:6px 0;border-bottom:1px solid var(--border);">
                ✅ <strong>${h.name}</strong> - ${h.xp} XP - ${new Date(h.date).toLocaleDateString('pt-BR')}
                <div style="font-size:0.7rem;color:var(--text2);">Grupos: ${gruposStr || 'N/A'}</div>
            </div>`;
        }).join('');
    }

    function updateTimerDisplay() { const m=Math.floor(timerRemaining/60), s=timerRemaining%60; document.getElementById('timerDisplay').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); }
    function startTimer() {
        if(timerRunning) return;
        if(timerRemaining<=0) timerRemaining=parseInt(document.getElementById('timerSeconds').value)||60;
        timerRunning=true; document.getElementById('timerStartBtn').disabled=true; document.getElementById('timerStartBtn').textContent='⏳ Rodando...';
        timerInterval=setInterval(()=>{ 
            if(timerRemaining>0){ 
                timerRemaining--; 
                updateTimerDisplay(); 
            } 
            if(timerRemaining<=0){ 
                clearInterval(timerInterval); 
                timerRunning=false; 
                document.getElementById('timerStartBtn').disabled=false; 
                document.getElementById('timerStartBtn').textContent='▶️ Iniciar'; 
                showToast('⏰ Tempo esgotado!','info'); 
                playAlarm();
            } 
        },1000);
    }
    function pauseTimer() { clearInterval(timerInterval); timerRunning=false; document.getElementById('timerStartBtn').disabled=false; document.getElementById('timerStartBtn').textContent='▶️ Iniciar'; }
    function resetTimer() { clearInterval(timerInterval); timerRunning=false; timerRemaining=parseInt(document.getElementById('timerSeconds').value)||60; updateTimerDisplay(); document.getElementById('timerStartBtn').disabled=false; document.getElementById('timerStartBtn').textContent='▶️ Iniciar'; }

    // ============ MÚSICA UNIFICADA ============
    function loadMusic() {
        const url = document.getElementById('musicUrl').value.trim();
        const container = document.getElementById('musicPlayerContainer');
        if (!url) { container.innerHTML = ''; return; }

        if (url.includes('soundcloud.com')) {
            fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => { container.innerHTML = data.html; })
                .catch(() => showFallback(url, container));
            return;
        }

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let id = null;
            try {
                const u = new URL(url);
                if (u.searchParams.has('v')) id = u.searchParams.get('v');
                else if (u.hostname === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
                else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2];
                else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2];
            } catch (e) {}
            if (id) {
                container.innerHTML = `
                    <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;">
                        <iframe style="position:absolute; top:0; left:0; width:100%; height:100%;"
                            src="https://www.youtube.com/embed/${id}?rel=0"
                            allowfullscreen></iframe>
                    </div>
                `;
                return;
            }
        }

        if (url.includes('open.spotify.com')) {
            try {
                const u = new URL(url);
                const parts = u.pathname.split('/').filter(Boolean);
                if (parts.length >= 2 && ['track','album','playlist'].includes(parts[0])) {
                    container.innerHTML = `
                        <iframe style="border-radius:12px;" src="https://open.spotify.com/embed/${parts[0]}/${parts[1]}"
                            width="100%" height="152" allowfullscreen allow="autoplay; encrypted-media"></iframe>
                    `;
                    return;
                }
            } catch (e) {}
        }

        const audioExts = ['.mp3','.wav','.ogg','.m4a','.aac','.flac'];
        const videoExts = ['.mp4','.webm','.mov'];
        const isDirectMedia = [...audioExts, ...videoExts].some(ext => url.toLowerCase().endsWith(ext));
        if (isDirectMedia) {
            const isVideo = videoExts.some(ext => url.toLowerCase().endsWith(ext));
            if (isVideo) {
                container.innerHTML = `<video controls style="width:100%; border-radius:var(--radius-sm);"><source src="${url}">Seu navegador não suporta vídeo.</video>`;
            } else {
                container.innerHTML = `<audio controls style="width:100%;"><source src="${url}" type="audio/mpeg">Seu navegador não suporta áudio.</audio>`;
            }
            return;
        }

        showFallback(url, container);
    }

    function showFallback(url, container) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px; background:var(--surface2); border-radius:var(--radius-sm);">
                <p style="color:var(--text2);">Não foi possível incorporar este link.</p>
                <a href="${url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:8px;">
                    ▶️ Ouvir no site original
                </a>
            </div>
        `;
    }

    // ============ ANÁLISE DE LACUNAS ============
    function analyzeAndGenerate() {
        if (workoutHistory.length === 0) {
            showToast('⚠️ Nenhum histórico encontrado. Faça alguns treinos primeiro.', 'error');
            return;
        }
        
        const diasAnalise = 14;
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - diasAnalise);
        
        const frequencia = {};
        let totalTreinos = 0;
        
        workoutHistory.forEach(h => {
            const treinoDate = new Date(h.date);
            if (treinoDate >= dataLimite) {
                totalTreinos++;
                (h.groups || []).forEach(grupo => {
                    frequencia[grupo] = (frequencia[grupo] || 0) + 1;
                });
            }
        });
        
        const todosGrupos = [...new Set(exerciseDB.map(ex => ex.grupo_principal))];
        const media = totalTreinos > 0 ? Object.values(frequencia).reduce((a,b)=>a+b,0) / todosGrupos.length : 0;
        const lacunas = todosGrupos.filter(grupo => !frequencia[grupo] || frequencia[grupo] < Math.max(1, Math.floor(media * 0.5)));
        
        if (lacunas.length === 0) {
            showToast('✅ Seus treinos estão bem equilibrados! Gerando treino normal.', 'info');
            generateIATraining();
            return;
        }
        
        const mensagem = lacunas.length === 1 
            ? `🔍 Grupo mais negligenciado: ${lacunas[0]}.` 
            : `🔍 Grupos pouco trabalhados: ${lacunas.join(', ')}.`;
        showToast(mensagem, 'info');
        
        generateIATraining(lacunas);
    }

    function navigateTo(page, btn) {
        document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
        const p = document.getElementById('page-'+page); if(p) p.classList.add('active');
        if(btn) btn.classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
        if(page==='build'){ renderExerciseLibrary(currentFilter); renderChosenExercises(); renderSavedWorkouts(); }
        if(page==='workout'){ updateActiveWorkoutSelect(); loadActiveWorkout(); }
        if(page==='progress'){ updateXPDisplay(); renderHistory(); }
        if(page==='home'){ updateXPDisplay(); updateUpcomingWorkouts(); }
    }

    function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

    function resetAllProgress() {
        if(confirm('⚠️ Apagar TODO progresso?')) {
            localStorage.clear(); userXP=0; totalExercisesDone=0; trainingDays=[]; workoutHistory=[]; savedWorkouts=[]; currentWorkout=[]; iaGeneratedWorkout=[];
            activeWorkoutIndex=-1; currentExerciseIndex=0; saveAllState(); updateXPDisplay(); renderExerciseLibrary('all'); renderChosenExercises(); renderSavedWorkouts(); renderHistory(); updateActiveWorkoutSelect(); updateUpcomingWorkouts();
            document.getElementById('iaResultCard').style.display='none'; showToast('🔄 Progresso resetado.','info');
        }
    }

    // Expose to global scope
    window.navigateTo = navigateTo;
    window.toggleSidebar = toggleSidebar;
    window.registerTrainingDay = registerTrainingDay;
    window.saveWorkout = saveWorkout;
    window.exportToGoogleCalendar = exportToGoogleCalendar;
    window.clearWorkout = clearWorkout;
    window.handleDragStart = handleDragStart;
    window.handleDragEnd = handleDragEnd;
    window.handleDragOver = handleDragOver;
    window.handleDragLeave = handleDragLeave;
    window.handleDrop = handleDrop;
    window.removeFromWorkout = removeFromWorkout;
    window.loadWorkoutForEditing = loadWorkoutForEditing;
    window.deleteWorkout = deleteWorkout;
    window.generateIATraining = generateIATraining;
    window.useIATraining = useIATraining;
    window.exportIAToCalendar = exportIAToCalendar;
    window.loadActiveWorkout = loadActiveWorkout;
    window.completeCurrentExercise = completeCurrentExercise;
    window.skipExercise = skipExercise;
    window.startTimer = startTimer;
    window.pauseTimer = pauseTimer;
    window.resetTimer = resetTimer;
    window.loadMusic = loadMusic;
    window.analyzeAndGenerate = analyzeAndGenerate;
    window.resetAllProgress = resetAllProgress;
    window.saveApiKey = saveApiKey;

    // Init
    document.getElementById('filterTags').addEventListener('click', e => {
        if(e.target.classList.contains('filter-tag')) {
            document.querySelectorAll('#filterTags .filter-tag').forEach(t=>t.classList.remove('active'));
            e.target.classList.add('active'); currentFilter = e.target.dataset.filter; renderExerciseLibrary(currentFilter);
        }
    });
    document.getElementById('timerSeconds').addEventListener('change', function(){ if(!timerRunning){ timerRemaining=parseInt(this.value)||60; updateTimerDisplay(); } });
    const apiKeyField = document.getElementById('apiKey');
if (apiKeyField && apiKey) {
    apiKeyField.value = apiKey;
}eXPDisplay(); renderExerciseLibrary('all'); renderChosenExercises(); renderSavedWorkouts(); renderHistory(); updateActiveWorkoutSelect(); updateUpcomingWorkouts(); updateTimerDisplay();
    console.log('💪 Calisthenics Blue pronto!');
})();