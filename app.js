// ============================================
// APP PRINCIPAL - CALISTHENICS BLUE
// ============================================
// Este arquivo contém toda a lógica do aplicativo
// Depende de: exercises-db.js (exerciseDB)

(function() {
    "use strict";
    
    // Verifica se a biblioteca foi carregada
    if (typeof exerciseDB === 'undefined') {
        console.error('❌ exerciseDB não encontrado! Carregue exercises-db.js primeiro.');
        return;
    }
    
    // ============ SAFE LOCAL STORAGE ============
    function safeGetJSON(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            const parsed = JSON.parse(item);
            if (typeof defaultValue === 'object' && defaultValue !== null) {
                if (Array.isArray(defaultValue)) {
                    return Array.isArray(parsed) ? parsed : defaultValue;
                }
                return (typeof parsed === 'object' && parsed !== null) ? parsed : defaultValue;
            }
            return parsed;
        } catch (e) {
            console.warn(`Erro ao ler ${key}:`, e);
            return defaultValue;
        }
    }
    
    function safeSetJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Erro ao salvar ${key}:`, e);
        }
    }

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
    let timerMode = 'regressivo';
    let stopwatchInterval = null;
    let stopwatchSeconds = 0;
    let stopwatchRunning = false;
    let currentFilter = 'all';
    let currentSearch = '';
    let iaGeneratedWorkout = null;
    let editingWorkoutIndex = -1;
    let planoSemanalGerado = [];

    // ============ UTILITÁRIOS ============
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
    
    function updateAllDisplays() {
        const els = {
            'userXP': userXP,
            'userLevel': getLevelNumber(),
            'xpNext': getXPForNextLevel(),
            'xpNextLevel': getLevelNumber() + 1,
            'athleteLevel': getUserLevel(),
            'progressXP': userXP,
            'progressLevel': getLevelNumber(),
            'progressDays': trainingDays.length,
            'progressTotalEx': totalExercisesDone,
            'totalExercisesDone': totalExercisesDone,
            'savedWorkoutsCount': savedWorkouts.length
        };
        
        for (const [id, value] of Object.entries(els)) {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        }
        
        const xpBar = document.getElementById('xpBarFill');
        if (xpBar) xpBar.style.width = getXPProgress() + '%';
        
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
        const el = document.getElementById('streakDays');
        if (el) el.textContent = streak;
    }
    
    function showToast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        const borderColor = type === 'success' ? '#2ECC71' : type === 'error' ? '#E74C3C' : '#333';
        toast.style.borderLeft = `4px solid ${borderColor}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    function saveAllState() {
        safeSetJSON('calisthenicsBlue_workouts', savedWorkouts);
        localStorage.setItem('calisthenicsBlue_xp', userXP.toString());
        localStorage.setItem('calisthenicsBlue_totalEx', totalExercisesDone.toString());
        safeSetJSON('calisthenicsBlue_days', trainingDays);
        safeSetJSON('calisthenicsBlue_history', workoutHistory);
    }
    
    function awardXP(amount) {
        userXP += amount;
        totalExercisesDone += 1;
        const today = new Date().toISOString().split('T')[0];
        if (!trainingDays.includes(today)) trainingDays.push(today);
        saveAllState();
        updateAllDisplays();
        showToast(`+${amount} XP!`, 'success');
    }
    
    function getBadgeClass(nivel) {
        const badges = {
            'Iniciante': 'badge-iniciante',
            'Intermediário': 'badge-intermediario',
            'Avançado': 'badge-avancado',
            'Elite': 'badge-elite'
        };
        return badges[nivel] || 'badge-iniciante';
    }

    // ============ PERFIL DO USUÁRIO ============
    function updateProfilePic(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const pic = document.getElementById('profilePic');
            if (pic) pic.src = e.target.result;
            localStorage.setItem('calisthenicsBlue_profilePic', e.target.result);
            showToast('📷 Foto atualizada!', 'success');
        };
        reader.readAsDataURL(file);
    }

    function editProfileName() {
        const nameEl = document.getElementById('profileName');
        if (!nameEl) return;
        const currentName = nameEl.textContent;
        const newName = prompt('Seu nome de guerreiro(a):', currentName);
        if (newName && newName.trim() !== '') {
            nameEl.textContent = newName.trim();
            localStorage.setItem('calisthenicsBlue_profileName', newName.trim());
            showToast('✨ Nome atualizado!', 'success');
        }
    }

    function loadUserProfile() {
        const savedPic = localStorage.getItem('calisthenicsBlue_profilePic');
        const savedName = localStorage.getItem('calisthenicsBlue_profileName');
        if (savedPic) {
            const pic = document.getElementById('profilePic');
            if (pic) pic.src = savedPic;
        }
        if (savedName) {
            const nameEl = document.getElementById('profileName');
            if (nameEl) nameEl.textContent = savedName;
        }
    }

    // ============ RENDERIZAÇÃO ============
    function renderExerciseLibrary(filter = 'all', search = '') {
        const container = document.getElementById('exerciseLibrary');
        if (!container) return;
        
        let exercises = exerciseDB;
        if (filter !== 'all') {
            exercises = exercises.filter(e => 
                e.tipo === filter || 
                e.grupo_principal === filter || 
                (e.grupos_secundarios || []).includes(filter)
            );
        }
        if (search.trim() !== '') {
            const term = search.trim().toLowerCase();
            exercises = exercises.filter(e => e.nome.toLowerCase().includes(term));
        }
        
        container.innerHTML = exercises.map((ex) => {
            const realIndex = exerciseDB.indexOf(ex);
            return `
                <div class="exercise-item" draggable="true" data-exercise-index="${realIndex}" 
                     ondragstart="handleDragStart(event,${realIndex})" ondragend="handleDragEnd(event)">
                    <div class="ex-info">
                        <div class="ex-name" onclick="event.stopPropagation(); openExerciseTutorial(${realIndex})" 
                             style="cursor:pointer; text-decoration:underline;">
                            ${ex.nome}
                        </div>
                        <div class="ex-meta">
                            ${ex.grupo_principal} • 
                            <span class="badge ${getBadgeClass(ex.nivel)}">${ex.nivel}</span> • 
                            ${ex.xp} XP
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" 
                            onclick="event.stopPropagation(); addExerciseByClick(${realIndex})" 
                            title="Adicionar ao treino">➕</button>
                </div>`;
        }).join('');
    }

    function filterExercises() {
        currentSearch = document.getElementById('exerciseSearch')?.value || '';
        renderExerciseLibrary(currentFilter, currentSearch);
    }

    // ============ GERENCIAMENTO DO TREINO ATUAL ============
    function addExerciseByClick(idx) {
        if (exerciseDB[idx]) {
            currentWorkout.push({...exerciseDB[idx], series: 3, reps: '8-12'});
            renderChosenExercises();
            showToast(`➕ ${exerciseDB[idx].nome} adicionado!`, 'success');
        }
    }

    function renderChosenExercises() {
        const container = document.getElementById('chosenExercises');
        const placeholder = document.getElementById('dropPlaceholder');
        
        if (placeholder) placeholder.style.display = currentWorkout.length ? 'none' : 'block';
        if (!container) return;
        
        container.innerHTML = currentWorkout.map((ex, i) => {
            const dbIndex = exerciseDB.findIndex(e => e.nome === ex.nome);
            return `
                <div class="exercise-item" style="cursor:default;border-color:var(--text);">
                    <div class="ex-info">
                        <div class="ex-name" onclick="event.stopPropagation(); openExerciseTutorial(${dbIndex})" 
                             style="cursor:pointer; text-decoration:underline;">
                            ${i+1}. ${ex.nome}
                        </div>
                        <div class="ex-meta">${ex.grupo_principal} • ${ex.xp} XP</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:4px; margin-right:8px;">
                        <button class="btn btn-sm btn-outline" onclick="decreaseSeries(${i})" style="padding:2px 8px;">−</button>
                        <span style="min-width:24px; text-align:center; font-weight:600;">${ex.series || 3}</span>
                        <button class="btn btn-sm btn-outline" onclick="increaseSeries(${i})" style="padding:2px 8px;">+</button>
                        <span style="font-size:0.7rem;color:var(--text2);">sér.</span>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="removeFromWorkout(${i})">✕</button>
                </div>`;
        }).join('');
        
        updateActiveWorkoutSelect();
    }

    function increaseSeries(index) {
        if (index >= 0 && index < currentWorkout.length) {
            currentWorkout[index].series = (currentWorkout[index].series || 3) + 1;
            renderChosenExercises();
        }
    }

    function decreaseSeries(index) {
        if (index >= 0 && index < currentWorkout.length) {
            currentWorkout[index].series = Math.max(1, (currentWorkout[index].series || 3) - 1);
            renderChosenExercises();
        }
    }

    function removeFromWorkout(i) {
        currentWorkout.splice(i, 1);
        renderChosenExercises();
    }

    function clearWorkout() {
        editingWorkoutIndex = -1;
        currentWorkout = [];
        renderChosenExercises();
        const nameInput = document.getElementById('workoutName');
        if (nameInput) nameInput.value = '';
        const saveBtn = document.getElementById('saveWorkoutBtn');
        if (saveBtn) saveBtn.textContent = '💾 Salvar Treino';
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) cancelBtn.style.display = 'none';
        showToast('Treino limpo!', 'info');
    }

    // Drag and Drop
    function handleDragStart(e, idx) {
        e.dataTransfer.setData('text/plain', idx.toString());
        e.target.classList.add('dragging');
    }
    function handleDragEnd(e) { e.target.classList.remove('dragging'); }
    function handleDragOver(e) {
        e.preventDefault();
        const dropZone = document.getElementById('dropZone');
        if (dropZone) dropZone.classList.add('drag-over');
    }
    function handleDragLeave(e) {
        const dropZone = document.getElementById('dropZone');
        if (dropZone) dropZone.classList.remove('drag-over');
    }
    function handleDrop(e) {
        e.preventDefault();
        const dropZone = document.getElementById('dropZone');
        if (dropZone) dropZone.classList.remove('drag-over');
        const idx = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(idx) && exerciseDB[idx]) {
            currentWorkout.push({...exerciseDB[idx], series: 3, reps: '8-12'});
            renderChosenExercises();
            showToast(`➕ ${exerciseDB[idx].nome} adicionado!`, 'success');
        }
    }

    // ============ SALVAR/CARREGAR TREINOS ============
    function saveWorkout() {
        if (!currentWorkout.length) return showToast('⚠️ Adicione exercícios.', 'error');
        
        const nameInput = document.getElementById('workoutName');
        const name = (nameInput?.value?.trim()) || 'Treino ' + (savedWorkouts.length + 1);
        
        if (editingWorkoutIndex >= 0 && editingWorkoutIndex < savedWorkouts.length) {
            savedWorkouts[editingWorkoutIndex] = {
                ...savedWorkouts[editingWorkoutIndex],
                name: name,
                exercises: [...currentWorkout],
                totalXP: currentWorkout.reduce((s, e) => s + (e.xp || 0), 0)
            };
            showToast(`✏️ "${name}" atualizado!`, 'success');
            editingWorkoutIndex = -1;
            const saveBtn = document.getElementById('saveWorkoutBtn');
            if (saveBtn) saveBtn.textContent = '💾 Salvar Treino';
            const cancelBtn = document.getElementById('cancelEditBtn');
            if (cancelBtn) cancelBtn.style.display = 'none';
        } else {
            savedWorkouts.push({
                id: Date.now(),
                name,
                exercises: [...currentWorkout],
                createdAt: new Date().toISOString(),
                totalXP: currentWorkout.reduce((s, e) => s + (e.xp || 0), 0)
            });
            showToast(`💾 "${name}" salvo!`, 'success');
        }
        
        saveAllState();
        currentWorkout = [];
        if (nameInput) nameInput.value = '';
        renderChosenExercises();
        renderSavedWorkouts();
        updateAllDisplays();
        updateAllTrainingLists();
    }

    function loadWorkoutForEditing(i) {
        if (!savedWorkouts[i]) return;
        editingWorkoutIndex = i;
        currentWorkout = [...savedWorkouts[i].exercises];
        const nameInput = document.getElementById('workoutName');
        if (nameInput) nameInput.value = savedWorkouts[i].name;
        renderChosenExercises();
        const saveBtn = document.getElementById('saveWorkoutBtn');
        if (saveBtn) saveBtn.textContent = '💾 Atualizar Treino';
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) cancelBtn.style.display = 'inline-flex';
        navigateTo('build', document.querySelector('[data-page="build"]'));
    }

    function cancelEditWorkout() {
        editingWorkoutIndex = -1;
        currentWorkout = [];
        const nameInput = document.getElementById('workoutName');
        if (nameInput) nameInput.value = '';
        renderChosenExercises();
        const saveBtn = document.getElementById('saveWorkoutBtn');
        if (saveBtn) saveBtn.textContent = '💾 Salvar Treino';
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) cancelBtn.style.display = 'none';
        showToast('Edição cancelada.', 'info');
    }

    function renameWorkout(index) {
        if (!savedWorkouts[index]) return;
        const oldName = savedWorkouts[index].name || 'Treino';
        const newName = prompt('Renomear treino:', oldName);
        if (newName && newName.trim() !== '') {
            savedWorkouts[index].name = newName.trim();
            saveAllState();
            renderSavedWorkouts();
            updateAllTrainingLists();
            showToast(`✏️ Renomeado para "${newName.trim()}"`, 'success');
        }
    }

    function deleteWorkout(i) {
        if (confirm(`Deletar "${savedWorkouts[i]?.name || 'este treino'}"?`)) {
            savedWorkouts.splice(i, 1);
            saveAllState();
            renderSavedWorkouts();
            updateAllDisplays();
            updateAllTrainingLists();
        }
    }

    function renderSavedWorkouts() {
        const container = document.getElementById('savedWorkoutsList');
        if (!container) return;
        
        if (!savedWorkouts.length) {
            container.innerHTML = '<p style="color:var(--text2);">Nenhum treino salvo ainda.</p>';
            return;
        }
        
        container.innerHTML = savedWorkouts.map((w, i) => `
            <div class="exercise-item" style="cursor:default;justify-content:space-between;">
                <div>
                    <strong>${w.name}</strong>
                    <div class="ex-meta">${w.exercises?.length || 0} ex. • ${w.totalXP || 0} XP</div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-outline btn-sm" onclick="loadWorkoutForEditing(${i})" title="Editar">📋</button>
                    <button class="btn btn-outline btn-sm" onclick="renameWorkout(${i})" title="Renomear">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteWorkout(${i})" title="Deletar">🗑️</button>
                </div>
            </div>`).join('');
        
        updateActiveWorkoutSelect();
        updateUpcomingWorkouts();
    }

    function updateActiveWorkoutSelect() {
        const select = document.getElementById('activeWorkoutSelect');
        if (!select) return;
        select.innerHTML = '<option value="">-- Selecione um treino --</option>' + 
            savedWorkouts.map((w, i) => `<option value="${i}">${w.name} (${w.exercises?.length || 0} ex.)</option>`).join('');
    }

    function updateUpcomingWorkouts() {
        const container = document.getElementById('upcomingWorkouts');
        if (!container) return;
        if (!savedWorkouts.length) {
            container.innerHTML = 'Nenhum treino agendado.';
            return;
        }
        container.innerHTML = savedWorkouts.slice(-3).reverse().map(w => 
            `<div style="padding:6px 0;border-bottom:1px solid var(--border);">📋 <strong>${w.name}</strong> - ${w.totalXP || 0} XP</div>`
        ).join('') + '<button class="btn btn-outline btn-sm mt-2" onclick="navigateTo(\'build\', document.querySelector(\'[data-page=build]\'))">Ver Todos</button>';
    }

    // ============ GERADOR IA ============
    function generateIATraining(lacunas = null) {
        const level = document.getElementById('iaLevel')?.value || 'Intermediário';
        const focus = document.getElementById('iaFocus')?.value || 'Full Body';
        const num = parseInt(document.getElementById('iaNumExercises')?.value) || 5;
        
        let pool = exerciseDB.filter(e => {
            const order = ['Iniciante', 'Intermediário', 'Avançado', 'Elite'];
            return order.indexOf(e.nivel) <= order.indexOf(level);
        });
        
        if (focus === 'Flexibilidade') {
            pool = pool.filter(e => e.tipo === 'Alongamento' || e.tipo === 'Yoga');
        } else if (focus !== 'Full Body') {
            pool = pool.filter(e => 
                e.grupo_principal === focus || 
                e.tipo === focus || 
                (e.grupos_secundarios || []).includes(focus)
            );
        }
        
        if (!pool.length) pool = exerciseDB.filter(e => e.nivel === level || e.nivel === 'Iniciante');
        
        pool.forEach(ex => {
            ex._score = calcularScore(ex, level, focus, lacunas);
        });
        pool.sort((a, b) => b._score - a._score);
        
        let selecionados = [];
        for (let ex of pool) {
            if (selecionados.length >= num) break;
            const countNoGrupo = selecionados.filter(s => s.grupo_principal === ex.grupo_principal).length;
            if (countNoGrupo < 2) selecionados.push({...ex, series: 3, reps: '8-12'});
        }
        
        const aquecimento = getAquecimento();
        const resfriamento = getResfriamento([...new Set(selecionados.map(e => e.grupo_principal))]);
        
        iaGeneratedWorkout = {
            exercises: [...aquecimento, ...selecionados, ...resfriamento],
            focus,
            level,
            totalXP: [...aquecimento, ...selecionados, ...resfriamento].reduce((s, e) => s + (e.xp || 0), 0)
        };
        
        const resultEl = document.getElementById('iaResult');
        if (resultEl) {
            resultEl.innerHTML = iaGeneratedWorkout.exercises.map((e, i) => {
                const dbIndex = exerciseDB.findIndex(db => db.nome === e.nome);
                return `
                    <div class="exercise-item">
                        <div class="ex-info">
                            <div class="ex-name" onclick="event.stopPropagation(); openExerciseTutorial(${dbIndex})" 
                                 style="cursor:pointer; text-decoration:underline;">
                                ${i+1}. ${e.nome}${e.tipo === 'Aquecimento' ? ' 🔥' : ''}${e.tipo === 'Resfriamento' ? ' ❄️' : ''}
                            </div>
                            <div class="ex-meta">${e.grupo_principal} • ${e.xp} XP • ${e.series || 3} séries</div>
                        </div>
                    </div>`;
            }).join('') + `<p class="mt-2"><strong>XP Total:</strong> ${iaGeneratedWorkout.totalXP} XP</p>`;
        }
        
        const card = document.getElementById('iaResultCard');
        if (card) card.style.display = 'block';
        showToast('✨ Treino gerado com sucesso!', 'success');
    }

    function calcularScore(ex, nivel, foco, lacunas) {
        let score = 0;
        const niveis = ['Iniciante', 'Intermediário', 'Avançado', 'Elite'];
        const idxEx = niveis.indexOf(ex.nivel);
        const idxAtleta = niveis.indexOf(nivel);
        
        if (idxEx === idxAtleta) score += 3;
        else if (Math.abs(idxEx - idxAtleta) === 1) score += 1;
        else score -= 5;
        
        if (lacunas && lacunas.includes(ex.grupo_principal)) score += 5;
        if (foco === 'Full Body' && ex.grupos_secundarios && ex.grupos_secundarios.length >= 3) score += 2;
        
        if (foco !== 'Full Body') {
            if (ex.grupo_principal === foco) score += 4;
            else if (ex.grupos_secundarios && ex.grupos_secundarios.includes(foco)) score += 2;
        }
        
        return score;
    }

    function getAquecimento() {
        const pool = exerciseDB.filter(ex => ex.tipo === 'Aquecimento');
        const selecionados = pool.sort(() => Math.random() - 0.5).slice(0, 2 + (Math.random() > 0.5 ? 1 : 0));
        return selecionados.map(ex => ({...ex, series: 1, reps: '10-15'}));
    }

    function getResfriamento(gruposTrabalhados) {
        const pool = exerciseDB.filter(ex => ex.tipo === 'Resfriamento');
        const selecionados = pool.sort(() => Math.random() - 0.5).slice(0, 2);
        return selecionados.map(ex => ({...ex, series: 1, reps: '30s'}));
    }

    function useIATraining() {
        if (!iaGeneratedWorkout || !iaGeneratedWorkout.exercises || !iaGeneratedWorkout.exercises.length) {
            return showToast('⚠️ Gere um treino primeiro!', 'error');
        }
        
        currentWorkout = iaGeneratedWorkout.exercises.map(ex => ({...ex}));
        const nameInput = document.getElementById('workoutName');
        if (nameInput) nameInput.value = `Treino ${iaGeneratedWorkout.focus} (${iaGeneratedWorkout.level} - IA)`;
        renderChosenExercises();
        navigateTo('build', document.querySelector('[data-page="build"]'));
        showToast('✅ Treino carregado! Revise e clique em Salvar.', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function analyzeAndGenerate() {
        if (workoutHistory.length === 0) {
            showToast('⚠️ Nenhum histórico. Faça alguns treinos primeiro.', 'error');
            return;
        }
        const diasAnalise = 14;
        const dataLimite = new Date();
        dataLimite.setDate(dataLimite.getDate() - diasAnalise);
        const frequencia = {};
        workoutHistory.forEach(h => {
            const treinoDate = new Date(h.date);
            if (treinoDate >= dataLimite) {
                (h.groups || []).forEach(grupo => {
                    frequencia[grupo] = (frequencia[grupo] || 0) + 1;
                });
            }
        });
        const todosGrupos = [...new Set(exerciseDB.map(ex => ex.grupo_principal))];
        const lacunas = todosGrupos.filter(grupo => !frequencia[grupo] || frequencia[grupo] < 1);
        
        if (lacunas.length === 0) {
            showToast('✅ Treinos equilibrados! Gerando treino normal.', 'info');
        } else {
            showToast(`🔍 Grupos pouco trabalhados: ${lacunas.join(', ')}.`, 'info');
        }
        generateIATraining(lacunas);
    }

    // ============ PLANEJAMENTO SEMANAL ============
    function toggleDiaConfig(checkbox) {
        const diaCard = checkbox.closest('.day-card');
        if (!diaCard) return;
        const configDiv = diaCard.querySelector('.day-config');
        if (!configDiv) return;
        
        if (checkbox.checked) {
            configDiv.style.display = 'block';
            loadTrainingListForDay(checkbox.dataset.dia);
        } else {
            configDiv.style.display = 'none';
            diaCard.querySelectorAll('.foco-checkbox, .treino-checkbox').forEach(cb => cb.checked = false);
        }
    }

    function toggleModoDia(modoSelect) {
        const diaCard = modoSelect.closest('.day-card');
        if (!diaCard) return;
        const focoContainer = diaCard.querySelector('.foco-container');
        const treinoContainer = diaCard.querySelector('.treino-container');
        const modo = modoSelect.value;
        
        if (focoContainer) focoContainer.style.display = (modo === 'foco' || modo === 'ambos') ? 'block' : 'none';
        if (treinoContainer) treinoContainer.style.display = (modo === 'treino' || modo === 'ambos') ? 'block' : 'none';
    }

    function loadTrainingListForDay(dia) {
        const listaContainer = document.querySelector(`.treinos-saved-list[data-dia="${dia}"]`);
        if (!listaContainer) return;
        
        if (!savedWorkouts.length) {
            listaContainer.innerHTML = '<p style="color:var(--text2); font-size:0.8rem;">Nenhum treino salvo.</p>';
            return;
        }
        
        listaContainer.innerHTML = savedWorkouts.map((w, i) => `
            <label class="treino-chip">
                <input type="checkbox" class="treino-checkbox" data-dia="${dia}" value="${i}">
                <span>${w.name}</span>
                <span class="treino-xp">${w.totalXP || 0} XP • ${w.exercises?.length || 0} ex.</span>
            </label>
        `).join('');
    }

    function updateAllTrainingLists() {
        document.querySelectorAll('.treinos-saved-list').forEach(lista => {
            const dia = lista.dataset.dia;
            if (dia) loadTrainingListForDay(dia);
        });
    }

    function gerarPlanoSemanal() {
        const nivel = document.getElementById('planLevel')?.value || 'Intermediário';
        const exerciciosPorDia = parseInt(document.getElementById('planExerciciosPorDia')?.value) || 5;
        
        const diasNomes = {
            'seg': 'Segunda-feira', 'ter': 'Terça-feira', 'qua': 'Quarta-feira',
            'qui': 'Quinta-feira', 'sex': 'Sexta-feira', 'sab': 'Sábado', 'dom': 'Domingo'
        };
        
        const diasSelecionados = [];
        let hasError = false;
        
        document.querySelectorAll('.day-checkbox:checked').forEach(checkbox => {
            const dia = checkbox.dataset.dia;
            const diaCard = checkbox.closest('.day-card');
            if (!diaCard) return;
            
            const modoSelect = diaCard.querySelector('.mode-select');
            const timeInput = diaCard.querySelector('.time-input');
            const modo = modoSelect?.value || 'foco';
            const horario = timeInput?.value || '07:00';
            
            const focos = [];
            diaCard.querySelectorAll('.foco-checkbox:checked').forEach(cb => {
                focos.push(cb.value);
            });
            
            const treinosSelecionados = [];
            diaCard.querySelectorAll('.treino-checkbox:checked').forEach(cb => {
                const idx = parseInt(cb.value);
                if (!isNaN(idx) && savedWorkouts[idx]) {
                    treinosSelecionados.push(idx);
                }
            });
            
            if ((modo === 'foco' || modo === 'ambos') && focos.length === 0) {
                showToast(`⚠️ Selecione um foco para ${diasNomes[dia] || dia}.`, 'error');
                hasError = true;
                return;
            }
            if ((modo === 'treino' || modo === 'ambos') && treinosSelecionados.length === 0) {
                showToast(`⚠️ Selecione um treino para ${diasNomes[dia] || dia}.`, 'error');
                hasError = true;
                return;
            }
            
            diasSelecionados.push({
                dia: diasNomes[dia] || dia,
                diaKey: dia,
                modo,
                horario,
                focos,
                treinosSelecionados
            });
        });
        
        if (hasError) return;
        
        if (diasSelecionados.length === 0) {
            showToast('⚠️ Selecione pelo menos um dia.', 'error');
            return;
        }
        
        planoSemanalGerado = [];
        
        diasSelecionados.forEach(diaInfo => {
            let exerciciosDoDia = [];
            
            diaInfo.treinosSelecionados.forEach(idx => {
                if (savedWorkouts[idx]?.exercises) {
                    exerciciosDoDia = [...exerciciosDoDia, ...savedWorkouts[idx].exercises];
                }
            });
            
            diaInfo.focos.forEach(foco => {
                exerciciosDoDia = [...exerciciosDoDia, ...generateWorkoutForDay(nivel, foco, exerciciosPorDia)];
            });
            
            const exerciciosUnicos = [];
            const nomesVistos = new Set();
            exerciciosDoDia.forEach(ex => {
                if (ex && ex.nome && !nomesVistos.has(ex.nome)) {
                    nomesVistos.add(ex.nome);
                    exerciciosUnicos.push(ex);
                }
            });
            
            if (exerciciosUnicos.length > 0) {
                planoSemanalGerado.push({
                    dia: diaInfo.dia,
                    horario: diaInfo.horario,
                    modo: diaInfo.modo,
                    exercicios: exerciciosUnicos,
                    totalXP: exerciciosUnicos.reduce((s, e) => s + (e.xp || 0), 0)
                });
            }
        });
        
        if (planoSemanalGerado.length === 0) {
            showToast('⚠️ Não foi possível gerar nenhum treino.', 'error');
            return;
        }
        
        renderizarPlanoSemanal();
        const card = document.getElementById('planoSemanalCard');
        if (card) {
            card.style.display = 'block';
            card.scrollIntoView({ behavior: 'smooth' });
        }
        showToast(`✅ Plano gerado para ${planoSemanalGerado.length} dias!`, 'success');
    }

    function generateWorkoutForDay(nivel, foco, numExercicios) {
        let pool = exerciseDB.filter(e => {
            const order = ['Iniciante', 'Intermediário', 'Avançado', 'Elite'];
            return order.indexOf(e.nivel) <= order.indexOf(nivel);
        });
        
        if (foco !== 'Full Body') {
            pool = pool.filter(e =>
                e.grupo_principal === foco || 
                e.tipo === foco || 
                (e.grupos_secundarios || []).includes(foco)
            );
        }
        
        if (!pool.length) pool = exerciseDB.filter(e => e.nivel === nivel || e.nivel === 'Iniciante');
        
        pool.forEach(ex => { ex._score = calcularScore(ex, nivel, foco, null); });
        pool.sort((a, b) => b._score - a._score);
        
        let selecionados = [];
        for (let ex of pool) {
            if (selecionados.length >= numExercicios) break;
            const countNoGrupo = selecionados.filter(s => s.grupo_principal === ex.grupo_principal).length;
            if (countNoGrupo < 2) selecionados.push({...ex, series: 3, reps: '8-12'});
        }
        
        return [...getAquecimento(), ...selecionados, ...getResfriamento([...new Set(selecionados.map(e => e.grupo_principal))])];
    }

    function renderizarPlanoSemanal() {
        const container = document.getElementById('planoSemanalResult');
        if (!container) return;
        
        container.innerHTML = planoSemanalGerado.map(diaInfo => `
            <div class="plano-dia-card">
                <h4>📅 ${diaInfo.dia} • ⏰ ${diaInfo.horario} • ${diaInfo.modo === 'foco' ? '🎯 Automático' : diaInfo.modo === 'treino' ? '💾 Treino Salvo' : '🔀 Misto'}</h4>
                <div style="margin-top:8px;">
                    ${diaInfo.exercicios.map((ex, i) => `
                        <div class="plano-exercicio-item">
                            <span>${i + 1}. ${ex.nome} ${ex.tipo === 'Aquecimento' ? '🔥' : ex.tipo === 'Resfriamento' ? '❄️' : ''}</span>
                            <span style="color:var(--text2); font-size:0.8rem;">${ex.xp || 0} XP • ${ex.series || 3}x</span>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top:8px; font-weight:600;">
                    Total: ${diaInfo.totalXP} XP • ${diaInfo.exercicios.length} exercícios
                </div>
            </div>
        `).join('');
    }

    function salvarPlanoSemanal() {
        if (!planoSemanalGerado.length) return showToast('⚠️ Gere um plano primeiro.', 'error');
        
        let salvos = 0;
        planoSemanalGerado.forEach(diaInfo => {
            const workoutName = `Treino de ${diaInfo.dia} (${diaInfo.horario})`;
            const existe = savedWorkouts.some(w => w.name === workoutName);
            
            savedWorkouts.push({
                id: Date.now() + Math.random(),
                name: existe ? `${workoutName} - ${Date.now().toString().slice(-4)}` : workoutName,
                exercises: [...diaInfo.exercicios],
                createdAt: new Date().toISOString(),
                totalXP: diaInfo.totalXP
            });
            salvos++;
        });
        
        saveAllState();
        renderSavedWorkouts();
        updateAllDisplays();
        updateAllTrainingLists();
        showToast(`💾 ${salvos} treinos salvos!`, 'success');
    }

    function setHorarioPreset(btn, dia, horario) {
        const timeInput = document.querySelector(`.time-input[data-dia="${dia}"]`);
        if (timeInput) {
            timeInput.value = horario;
        }
        
        const presetsContainer = btn.parentElement;
        if (presetsContainer) {
            presetsContainer.querySelectorAll('.horario-preset').forEach(b => {
                b.classList.remove('active');
            });
        }
        btn.classList.add('active');
    }

    // ============ GERAR DIAS DA SEMANA ============
    function gerarDiasDaSemana() {
        const semanaGrid = document.getElementById('semanaGrid');
        if (!semanaGrid) return;
        
        const dias = [
            { key: 'seg', nome: 'Segunda-feira', horario: '07:00' },
            { key: 'ter', nome: 'Terça-feira', horario: '07:00' },
            { key: 'qua', nome: 'Quarta-feira', horario: '07:00' },
            { key: 'qui', nome: 'Quinta-feira', horario: '07:00' },
            { key: 'sex', nome: 'Sexta-feira', horario: '07:00' },
            { key: 'sab', nome: 'Sábado', horario: '09:00' },
            { key: 'dom', nome: 'Domingo', horario: '09:00' }
        ];
        
        const gruposMusculares = [
            'Costas', 'Peitoral', 'Ombros', 'Tríceps', 'Core', 'Pernas',
            'Full Body', 'Flexibilidade', 'Front Lever', 'Planche', 'Handstand', 'Human Flag'
        ];
        
        semanaGrid.innerHTML = dias.map(dia => `
            <div class="day-card">
                <div class="day-header">
                    <label class="day-checkbox-label">
                        <input type="checkbox" id="dia-${dia.key}" class="day-checkbox" data-dia="${dia.key}" onchange="toggleDiaConfig(this)">
                        <span class="day-name">${dia.nome}</span>
                    </label>
                </div>
                <div class="day-config" data-dia="${dia.key}" style="display:none;">
                    <select class="mode-select" data-dia="${dia.key}" onchange="toggleModoDia(this)">
                        <option value="foco">🎯 Por Foco Muscular (Automático)</option>
                        <option value="treino">💾 Usar Treino Salvo</option>
                        <option value="ambos">🔀 Foco + Treino Salvo</option>
                    </select>
                    
                    <div class="foco-container" data-dia="${dia.key}">
                        <label class="mini-label">Grupos Musculares (selecione um ou mais):</label>
                        <div class="chips-container">
                            ${gruposMusculares.map(grupo => `
                                <label class="chip">
                                    <input type="checkbox" class="foco-checkbox" data-dia="${dia.key}" value="${grupo}"> ${grupo}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="treino-container" data-dia="${dia.key}" style="display:none;">
                        <label class="mini-label">Treinos Salvos (selecione um ou mais):</label>
                        <div class="treinos-saved-list" data-dia="${dia.key}">
                            <p style="color:var(--text3); font-size:0.8rem;">Carregando treinos salvos...</p>
                        </div>
                    </div>
                    
                    <div class="time-wrapper">
                        <label class="mini-label" style="margin-top:12px;">⏰ Horário:</label>
                        <input type="time" class="time-input" data-dia="${dia.key}" value="${dia.horario}">
                        
                        <div class="horario-presets">
                            <button type="button" class="horario-preset ${dia.horario === '06:00' ? 'active' : ''}" onclick="setHorarioPreset(this, '${dia.key}', '06:00')">🌅 06:00</button>
                            <button type="button" class="horario-preset ${dia.horario === '07:00' ? 'active' : ''}" onclick="setHorarioPreset(this, '${dia.key}', '07:00')">🌅 07:00</button>
                            <button type="button" class="horario-preset ${dia.horario === '08:00' ? 'active' : ''}" onclick="setHorarioPreset(this, '${dia.key}', '08:00')">☀️ 08:00</button>
                            <button type="button" class="horario-preset ${dia.horario === '12:00' ? 'active' : ''}" onclick="setHorarioPreset(this, '${dia.key}', '12:00')">🌤️ 12:00</button>
                            <button type="button" class="horario-preset ${dia.horario === '17:00' ? 'active' : ''}" onclick="setHorarioPreset(this, '${dia.key}', '17:00')">🌆 17:00</button>
                            <button type="button" class="horario-preset ${dia.horario === '19:00' ? 'active' : ''}" onclick="setHorarioPreset(this, '${dia.key}', '19:00')">🌙 19:00</button>
                            <button type="button" class="horario-preset ${dia.horario === '21:00' ? 'active' : ''}" onclick="setHorarioPreset(this, '${dia.key}', '21:00')">🌃 21:00</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ============ TUTORIAL DO EXERCÍCIO ============
    // ============ TUTORIAL COMPLETO DO EXERCÍCIO ============
function openExerciseTutorial(idx) {
    const ex = exerciseDB[idx];
    if (!ex) return;
    
    // Determina o tipo de exercício para criar os passos
    const isPull = ex.tipo === 'Pull' || ex.tipo === 'Front Lever';
    const isPush = ex.tipo === 'Push' || ex.tipo === 'Planche' || ex.tipo === 'Ombros' || ex.tipo === 'Tríceps';
    const isCore = ex.tipo === 'Core';
    const isLegs = ex.tipo === 'Pernas';
    const isHandstand = ex.tipo === 'Handstand';
    const isFlag = ex.tipo === 'Human Flag';
    const isStretch = ex.tipo === 'Alongamento' || ex.tipo === 'Resfriamento';
    const isYoga = ex.tipo === 'Yoga';
    const isWarmup = ex.tipo === 'Aquecimento';
    const isFullBody = ex.tipo === 'Corpo Inteiro';
    
    let steps = [];
    
    if (isPull) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Segure a barra com pegada firme, mãos na largura dos ombros. Braços completamente estendidos. Escápulas relaxadas.' },
            { title: '2. Ativação', desc: 'Contraia as escápulas (puxe os ombros para baixo e para trás). Ative o core e os glúteos. Respire fundo.' },
            { title: '3. Execução', desc: 'Puxe o corpo para cima de forma controlada até o queixo ultrapassar a barra. Cotovelos próximos ao corpo. Expire durante a subida.' },
            { title: '4. Finalização', desc: 'Desça lentamente até os braços ficarem totalmente estendidos. Mantenha a tensão nas costas. Inspire na descida.' }
        ];
    } else if (isPush) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Apoie as mãos no chão alinhadas com os ombros. Corpo reto como uma prancha. Pés juntos ou levemente afastados.' },
            { title: '2. Ativação', desc: 'Contraia abdômen, glúteos e pernas. Mantenha o corpo totalmente alinhado. Olhe para o chão à frente.' },
            { title: '3. Execução', desc: 'Desça o corpo flexionando os cotovelos a 45°. Mantenha os cotovelos próximos ao tronco. Inspire na descida.' },
            { title: '4. Finalização', desc: 'Empurre o chão para voltar à posição inicial. Estenda completamente os braços. Expire na subida.' }
        ];
    } else if (isCore) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Deite-se ou posicione-se conforme o exercício. Mantenha a lombar apoiada (ou neutra). Alinhe a coluna.' },
            { title: '2. Ativação', desc: 'Contraia profundamente o abdômen (como se fosse levar o umbigo às costas). Ative também o assoalho pélvico.' },
            { title: '3. Execução', desc: 'Realize o movimento de forma controlada, sem usar impulso. Foco na contração abdominal. Expire na contração.' },
            { title: '4. Finalização', desc: 'Retorne à posição inicial mantendo a tensão no core. Não relaxe completamente. Inspire no retorno.' }
        ];
    } else if (isLegs) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Fique em pé com os pés alinhados aos ombros. Coluna neutra, olhar para frente. Braços estendidos à frente.' },
            { title: '2. Ativação', desc: 'Contraia o core e mantenha o peito aberto. Distribua o peso uniformemente nos pés. Respire fundo.' },
            { title: '3. Execução', desc: 'Realize o movimento de forma controlada. Joelhos alinhados com os pés. Inspire na descida, expire na subida.' },
            { title: '4. Finalização', desc: 'Volte à posição inicial empurrando o chão. Mantenha o controle durante todo o movimento.' }
        ];
    } else if (isHandstand) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Apoie as mãos no chão a 30 cm da parede. Dedos bem abertos e braços estendidos. Olhe para as mãos.' },
            { title: '2. Ativação', desc: 'Empurre o chão ativamente. Ative ombros, core e glúteos. Mantenha os braços travados.' },
            { title: '3. Execução', desc: 'Eleve as pernas com controle, mantendo o corpo alinhado. Use a parede como apoio se necessário.' },
            { title: '4. Finalização', desc: 'Mantenha a posição com respiração controlada. Desça com controle absoluto. Não desabe.' }
        ];
    } else if (isFlag) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Segure a barra vertical: mão de cima pronada, mão de baixo supinada. Afaste os pés.' },
            { title: '2. Ativação', desc: 'Contraia intensamente ombros, costas e core. Empurre com a mão de baixo, puxe com a de cima.' },
            { title: '3. Execução', desc: 'Eleve o corpo lateralmente até ficar paralelo ao chão. Mantenha o corpo totalmente reto.' },
            { title: '4. Finalização', desc: 'Desça controladamente. Alterne os lados para equilibrar o treino.' }
        ];
    } else if (isStretch || isYoga) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Sente-se ou posicione-se confortavelmente. Respire profundamente. Relaxe os ombros.' },
            { title: '2. Alongamento', desc: 'Avance no alongamento até sentir tensão moderada (não dor). Mantenha a respiração calma.' },
            { title: '3. Manutenção', desc: 'Permaneça na posição por 20-30 segundos. Relaxe os músculos gradualmente. Respire.' },
            { title: '4. Finalização', desc: 'Solte lentamente. Repita se necessário. Nunca force além do limite.' }
        ];
    } else if (isWarmup) {
        steps = [
            { title: '1. Posição Inicial', desc: 'Fique em pé, respire fundo. Prepare o corpo para o exercício.' },
            { title: '2. Ativação', desc: 'Movimente as articulações suavemente. Aumente a circulação gradualmente.' },
            { title: '3. Execução', desc: 'Realize o movimento de forma dinâmica, aumentando a amplitude aos poucos.' },
            { title: '4. Finalização', desc: 'Repita por 30 segundos. Sinta o corpo aquecido e preparado.' }
        ];
    } else {
        steps = [
            { title: '1. Posição Inicial', desc: 'Posicione-se corretamente para o exercício. Mantenha a postura alinhada.' },
            { title: '2. Ativação', desc: 'Ative os músculos principais antes de iniciar o movimento.' },
            { title: '3. Execução', desc: 'Realize o movimento completo com controle e amplitude.' },
            { title: '4. Finalização', desc: 'Retorne à posição inicial mantendo a tensão muscular.' }
        ];
    }
    
    // Dicas e erros específicos
    let dicas = [];
    let erros = [];
    
    if (ex.nivel === 'Iniciante') {
        dicas = ['Comece devagar e foque na forma', 'Faça pausas quando necessário', 'Priorize a qualidade sobre quantidade'];
        erros = ['Não tente progredir rápido demais', 'Evite usar impulso', 'Não prenda a respiração'];
    } else if (ex.nivel === 'Intermediário') {
        dicas = ['Aumente o volume gradualmente', 'Varie os ângulos do exercício', 'Grave seus movimentos para análise'];
        erros = ['Não sacrificar a forma por repetições', 'Evite treinar o mesmo grupo em dias seguidos', 'Não pule o aquecimento'];
    } else if (ex.nivel === 'Avançado' || ex.nivel === 'Elite') {
        dicas = ['Treine com periodização', 'Trabalhe nos pontos fracos', 'Priorize a recuperação'];
        erros = ['Não treinar até a falha sempre', 'Evite negligenciar a mobilidade', 'Não ignore dores articulares'];
    } else {
        dicas = ['Mantenha a postura correta', 'Respire durante o movimento', 'Progrida gradualmente'];
        erros = ['Não use impulso excessivo', 'Evite arquear as costas', 'Não prenda a respiração'];
    }
    
    // Busca progressões
    const progressoes = exerciseDB
        .filter(e => e.grupo_principal === ex.grupo_principal && e.nome !== ex.nome)
        .sort((a, b) => a.xp - b.xp)
        .slice(0, 4);
    
    // Monta o HTML do tutorial
    const tutorialHTML = `
        <div class="tutorial-container">
            <div class="tutorial-header">
                <button class="btn btn-outline btn-sm" onclick="navigateTo('ia', document.querySelector('[data-page=ia]'))">← Voltar</button>
                <h2>${ex.nome}</h2>
                <div class="tutorial-badges">
                    <span class="badge ${getBadgeClass(ex.nivel)}">${ex.nivel}</span>
                    <span class="badge" style="background:rgba(0,0,0,0.05);">${ex.xp} XP</span>
                    <span class="badge" style="background:rgba(0,0,0,0.05);">⏱️ ${ex.duracao || 45}s</span>
                </div>
                <p style="color:var(--text2);">${ex.grupo_principal}${ex.grupos_secundarios && ex.grupos_secundarios.length ? ' • ' + ex.grupos_secundarios.join(' • ') : ''}</p>
            </div>
            
            <div class="tutorial-media">
                ${ex.video ? `
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/${ex.video}?rel=0&showinfo=0&modestbranding=1"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                loading="lazy">
                        </iframe>
                    </div>
                ` : ex.gif ? `
                    <div class="gif-container">
                        <img src="${ex.gif}" alt="${ex.nome}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'media-fallback\\'>⚠️ Imagem/GIF não encontrado</div>';">
                    </div>
                ` : `
                    <div class="media-fallback">
                        <p>📷 Sem demonstração disponível</p>
                    </div>
                `}
            </div>
            
            <div class="tutorial-steps">
                <h3>📋 Passos de Execução</h3>
                <div class="steps-list">
                    ${steps.map(step => `
                        <div class="step-item">
                            <div class="step-marker">${step.title.charAt(0)}</div>
                            <div class="step-content">
                                <h4>${step.title}</h4>
                                <p>${step.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="tutorial-tips">
                <div class="tips-column">
                    <h3 style="color:var(--success);">✅ Dicas</h3>
                    <ul>
                        ${dicas.map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
                <div class="tips-column">
                    <h3 style="color:var(--danger);">❌ Erros Comuns</h3>
                    <ul>
                        ${erros.map(e => `<li>${e}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="tutorial-progressions">
                <h3>📈 Progressões Relacionadas</h3>
                <div class="progressions-list">
                    ${progressoes.length ? progressoes.map(p => {
                        const pIdx = exerciseDB.indexOf(p);
                        return `<span class="badge ${getBadgeClass(p.nivel)}" style="cursor:pointer; margin:4px;" onclick="openExerciseTutorial(${pIdx})">${p.nome} (${p.xp} XP)</span>`;
                    }).join('') : '<p style="color:var(--text2);">Nenhuma progressão encontrada.</p>'}
                </div>
            </div>
            
            <div class="tutorial-action">
                <button class="btn btn-primary btn-lg" onclick="addExerciseByClick(${idx}); navigateTo('build', document.querySelector('[data-page=build]'))">
                    ➕ Adicionar ao Treino
                </button>
            </div>
        </div>
    `;
    
    // Cria ou atualiza a página de tutorial
    let tutorialPage = document.getElementById('page-exercise');
    if (!tutorialPage) {
        tutorialPage = document.createElement('section');
        tutorialPage.className = 'page';
        tutorialPage.id = 'page-exercise';
        document.getElementById('mainContent').appendChild(tutorialPage);
    }
    
    tutorialPage.innerHTML = tutorialHTML;
    navigateTo('exercise', null);
}

    // ============ EXPORTAÇÃO ============
    function exportToGoogleCalendar() {
        if (!currentWorkout.length) return showToast('⚠️ Monte um treino antes.', 'error');
        
        const nameInput = document.getElementById('workoutName');
        const name = nameInput?.value?.trim() || 'Treino Calisthenics Blue';
        const desc = currentWorkout.map((e, i) => `${i+1}. ${e.nome} (${e.xp} XP)`).join('\n');
        const now = new Date();
        const start = new Date(now.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(now.getTime() + 7200000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&details=${encodeURIComponent(desc)}&dates=${start}/${end}`, '_blank');
        showToast('📅 Abrindo Google Agenda...', 'success');
    }

    function exportIAToCalendar() {
        if (!iaGeneratedWorkout?.exercises?.length) return showToast('⚠️ Gere um treino primeiro.', 'error');
        
        const desc = iaGeneratedWorkout.exercises.map((e, i) => `${i+1}. ${e.nome} (${e.xp} XP)`).join('\n');
        const now = new Date();
        const start = new Date(now.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(now.getTime() + 7200000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Treino Automático')}&details=${encodeURIComponent(desc)}&dates=${start}/${end}`, '_blank');
        showToast('📅 Google Agenda!', 'success');
    }

    function exportarPlanoGoogleCalendar() {
        if (!planoSemanalGerado.length) return showToast('⚠️ Gere um plano primeiro.', 'error');
        showToast('📅 Funcionalidade em desenvolvimento.', 'info');
    }

    function baixarPlanoCalendario() {
        if (!planoSemanalGerado.length) return showToast('⚠️ Gere um plano primeiro.', 'error');
        showToast('📥 Funcionalidade em desenvolvimento.', 'info');
    }

    // ============ TREINO ATIVO ============
    function loadActiveWorkout() {
        const select = document.getElementById('activeWorkoutSelect');
        const idx = parseInt(select?.value);
        
        if (isNaN(idx) || !savedWorkouts[idx]) {
            const display = document.getElementById('activeWorkoutDisplay');
            if (display) display.innerHTML = '<p style="color:var(--text2);">Selecione um treino.</p>';
            const btn = document.getElementById('completeExerciseBtn');
            if (btn) btn.disabled = true;
            const highlight = document.getElementById('currentExerciseHighlight');
            if (highlight) highlight.style.display = 'none';
            activeWorkoutIndex = -1;
            return;
        }
        
        activeWorkoutIndex = idx;
        currentExerciseIndex = 0;
        renderActiveWorkout();
        const btn = document.getElementById('completeExerciseBtn');
        if (btn) btn.disabled = false;
    }

    function renderActiveWorkout() {
        if (activeWorkoutIndex < 0) return;
        const w = savedWorkouts[activeWorkoutIndex];
        if (!w) return;
        
        const display = document.getElementById('activeWorkoutDisplay');
        if (display) {
            display.innerHTML = w.exercises.map((e, i) => {
                const dbIndex = exerciseDB.findIndex(db => db.nome === e.nome);
                return `
                    <div class="exercise-item" style="cursor:default;${i === currentExerciseIndex ? 'border:2px solid var(--text);background:var(--surface2);' : ''}">
                        <div class="ex-info">
                            <div class="ex-name" onclick="event.stopPropagation(); openExerciseTutorial(${dbIndex})" 
                                 style="cursor:pointer; text-decoration:underline;">
                                ${i+1}. ${e.nome} (${e.series || 3}x)
                            </div>
                            <div class="ex-meta">${e.xp} XP</div>
                        </div>
                        ${i < currentExerciseIndex ? '<span style="color:var(--success);">✅</span>' : ''}
                    </div>`;
            }).join('');
        }

        if (currentExerciseIndex < w.exercises.length) {
            const currentEx = w.exercises[currentExerciseIndex];
            const timerInput = document.getElementById('timerSeconds');
            if (timerInput) timerInput.value = currentEx.duracao || 45;
            resetTimer();
            const highlight = document.getElementById('currentExerciseHighlight');
            if (highlight) {
                highlight.style.display = 'block';
                highlight.innerHTML = `<strong>🏋️ Executando:</strong> ${currentEx.nome} (${currentEx.xp} XP)`;
            }
        } else {
            const highlight = document.getElementById('currentExerciseHighlight');
            if (highlight) highlight.style.display = 'none';
            const btn = document.getElementById('completeExerciseBtn');
            if (btn) btn.disabled = true;
            showToast('🏆 Treino concluído!', 'success');
            
            if (w.totalXP) awardXP(w.totalXP);
            
            workoutHistory.push({
                name: w.name,
                date: new Date().toISOString(),
                exercises: w.exercises.length,
                xp: w.totalXP,
                groups: [...new Set(w.exercises.map(ex => ex.grupo_principal))]
            });
            saveAllState();
            renderHistory();
        }
    }

    function completeCurrentExercise() {
        if (activeWorkoutIndex < 0) return;
        const w = savedWorkouts[activeWorkoutIndex];
        if (w && currentExerciseIndex < w.exercises.length) {
            awardXP(w.exercises[currentExerciseIndex].xp);
            currentExerciseIndex++;
            renderActiveWorkout();
            resetTimer();
        }
    }

    function skipExercise() {
        if (activeWorkoutIndex >= 0) {
            currentExerciseIndex++;
            renderActiveWorkout();
            resetTimer();
        }
    }

    function renderHistory() {
        const container = document.getElementById('historyList');
        if (!container) return;
        
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

    // ============ CRONÔMETROS ============
    function updateTimerDisplay() {
        const totalSeconds = Math.round(timerRemaining);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        const display = document.getElementById('timerDisplay');
        if (display) display.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function startTimer() {
        if (timerRunning) return;
        if (timerMode === 'regressivo' && timerRemaining <= 0) {
            timerRemaining = parseInt(document.getElementById('timerSeconds')?.value) || 60;
        }
        
        timerRunning = true;
        const startBtn = document.getElementById('timerStartBtn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = '⏳ Rodando...';
        }
        
        timerInterval = setInterval(() => {
            if (timerMode === 'regressivo') {
                timerRemaining--;
                if (timerRemaining <= 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    const btn = document.getElementById('timerStartBtn');
                    if (btn) {
                        btn.disabled = false;
                        btn.textContent = '▶️ Iniciar';
                    }
                    showToast('⏰ Tempo esgotado!', 'info');
                }
            } else {
                timerRemaining++;
            }
            updateTimerDisplay();
        }, 1000);
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        const btn = document.getElementById('timerStartBtn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '▶️ Iniciar';
        }
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerRemaining = timerMode === 'regressivo' ? (parseInt(document.getElementById('timerSeconds')?.value) || 60) : 0;
        updateTimerDisplay();
        const btn = document.getElementById('timerStartBtn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '▶️ Iniciar';
        }
    }

    function toggleTimerMode() {
        timerMode = timerMode === 'regressivo' ? 'progressivo' : 'regressivo';
        const toggle = document.getElementById('timerModeToggle');
        if (toggle) toggle.textContent = timerMode === 'progressivo' ? '⬆️ Progressivo' : '⬇️ Regressivo';
        const secondsInput = document.getElementById('timerSeconds');
        if (secondsInput) secondsInput.style.display = timerMode === 'regressivo' ? 'inline-block' : 'none';
        resetTimer();
    }

    function updateStopwatchDisplay() {
        const h = Math.floor(stopwatchSeconds / 3600);
        const m = Math.floor((stopwatchSeconds % 3600) / 60);
        const s = stopwatchSeconds % 60;
        const display = document.getElementById('stopwatchDisplay');
        if (display) {
            display.textContent = (h > 0 ? String(h).padStart(2, '0') + ':' : '') + 
                                 String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
        }
    }

    function startStopwatch() {
        if (stopwatchRunning) return;
        stopwatchRunning = true;
        const btn = document.getElementById('stopwatchStartBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Rodando...';
        }
        stopwatchInterval = setInterval(() => {
            stopwatchSeconds++;
            updateStopwatchDisplay();
        }, 1000);
    }

    function pauseStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
        const btn = document.getElementById('stopwatchStartBtn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '▶️ Iniciar';
        }
    }

    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchRunning = false;
        stopwatchSeconds = 0;
        updateStopwatchDisplay();
        const btn = document.getElementById('stopwatchStartBtn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '▶️ Iniciar';
        }
    }

    // ============ CARROSSEL ============
    let carrosselIndex = 0;
    let carrosselTimer = null;
    const totalSlides = 4;

    function slideAtual(index) { carrosselIndex = index; atualizarCarrossel(); resetarAutoPlay(); }
    function mudarSlide(direcao) { carrosselIndex = (carrosselIndex + direcao + totalSlides) % totalSlides; atualizarCarrossel(); resetarAutoPlay(); }

    function atualizarCarrossel() {
        document.querySelectorAll('.hero-slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === carrosselIndex);
        });
        document.querySelectorAll('.hero-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === carrosselIndex);
        });
        const counter = document.getElementById('carrosselCounter');
        if (counter) counter.textContent = `${carrosselIndex + 1} / ${totalSlides}`;
    }

    function autoPlay() { 
        carrosselTimer = setInterval(() => { 
            carrosselIndex = (carrosselIndex + 1) % totalSlides; 
            atualizarCarrossel(); 
        }, 5000); 
    }
    function resetarAutoPlay() { clearInterval(carrosselTimer); autoPlay(); }

    // ============ TEMA ============
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('calisthenicsBlue_theme', isDark ? 'dark' : 'light');
        const btn = document.getElementById('themeToggleBtn');
        if (btn) btn.textContent = isDark ? '☀️ Tema Claro' : '🌙 Tema Escuro';
    }

    function loadTheme() {
        if (localStorage.getItem('calisthenicsBlue_theme') === 'dark') {
            document.body.classList.add('dark-theme');
            const btn = document.getElementById('themeToggleBtn');
            if (btn) btn.textContent = '☀️ Tema Claro';
        }
    }

    // ============ NAVEGAÇÃO ============
    function navigateTo(page, btn) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        const targetPage = document.getElementById('page-' + page);
        if (targetPage) targetPage.classList.add('active');
        if (btn) btn.classList.add('active');
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
        
        if (page === 'build') { renderExerciseLibrary(currentFilter, currentSearch); renderChosenExercises(); renderSavedWorkouts(); }
        if (page === 'workout') updateActiveWorkoutSelect();
        if (page === 'progress') { updateAllDisplays(); renderHistory(); }
        if (page === 'home') { updateAllDisplays(); updateUpcomingWorkouts(); }
        if (page === 'ia') { updateAllTrainingLists(); }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function toggleSidebar() { 
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('open'); 
    }

    function registerTrainingDay() {
        const today = new Date().toISOString().split('T')[0];
        if (!trainingDays.includes(today)) {
            trainingDays.push(today);
            saveAllState();
            updateAllDisplays();
            showToast('🔥 Dia registrado!', 'success');
        } else showToast('📅 Hoje já foi registrado.', 'info');
    }

    function resetAllProgress() {
        if (confirm('⚠️ Apagar TODO progresso?')) {
            localStorage.clear();
            userXP = 0; totalExercisesDone = 0; trainingDays = []; workoutHistory = [];
            savedWorkouts = []; currentWorkout = []; iaGeneratedWorkout = null;
            planoSemanalGerado = []; activeWorkoutIndex = -1; currentExerciseIndex = 0;
            editingWorkoutIndex = -1; stopwatchSeconds = 0;
            clearInterval(stopwatchInterval); stopwatchRunning = false;
            clearInterval(timerInterval); timerRunning = false;
            timerRemaining = 60; timerMode = 'regressivo';
            currentSearch = ''; currentFilter = 'all';
            
            saveAllState();
            updateAllDisplays();
            renderExerciseLibrary('all', '');
            renderChosenExercises();
            renderSavedWorkouts();
            renderHistory();
            updateActiveWorkoutSelect();
            updateUpcomingWorkouts();
            updateTimerDisplay();
            updateStopwatchDisplay();
            
            const iaCard = document.getElementById('iaResultCard');
            if (iaCard) iaCard.style.display = 'none';
            const planCard = document.getElementById('planoSemanalCard');
            if (planCard) planCard.style.display = 'none';
            const toggle = document.getElementById('timerModeToggle');
            if (toggle) toggle.textContent = '⬇️ Regressivo';
            const secInput = document.getElementById('timerSeconds');
            if (secInput) secInput.style.display = 'inline-block';
            const searchInput = document.getElementById('exerciseSearch');
            if (searchInput) searchInput.value = '';
            
            showToast('🔄 Progresso resetado.', 'info');
        }
        function navigateTo(page, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) targetPage.classList.add('active');
    if (btn) btn.classList.add('active');
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
    
    // Não esconder a página de exercício quando navegar para ela
    if (page === 'build') { renderExerciseLibrary(currentFilter, currentSearch); renderChosenExercises(); renderSavedWorkouts(); }
    if (page === 'workout') updateActiveWorkoutSelect();
    if (page === 'progress') { updateAllDisplays(); renderHistory(); }
    if (page === 'home') { updateAllDisplays(); updateUpcomingWorkouts(); }
    if (page === 'ia') { updateAllTrainingLists(); }
    // A página exercise é criada dinamicamente, então não precisa de lógica adicional
    
    
}
    }

    // ============ INICIALIZAÇÃO ============
    function init() {
        // Gerar dias da semana dinamicamente
        gerarDiasDaSemana();
        
        // Configurar filtros
        const filterTags = document.getElementById('filterTags');
        if (filterTags) {
            filterTags.addEventListener('click', e => {
                if (e.target.classList.contains('filter-tag')) {
                    filterTags.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    currentFilter = e.target.dataset.filter;
                    renderExerciseLibrary(currentFilter, currentSearch);
                }
            });
        }
        
        // Configurar timer input
        const timerInput = document.getElementById('timerSeconds');
        if (timerInput) {
            timerInput.addEventListener('change', function() {
                if (!timerRunning && timerMode === 'regressivo') {
                    timerRemaining = parseInt(this.value) || 60;
                    updateTimerDisplay();
                }
            });
        }
        
        updateAllDisplays();
        renderExerciseLibrary('all', currentSearch);
        renderChosenExercises();
        renderSavedWorkouts();
        renderHistory();
        updateActiveWorkoutSelect();
        updateUpcomingWorkouts();
        updateTimerDisplay();
        updateStopwatchDisplay();
        loadUserProfile();
        loadTheme();
        autoPlay();
        
        console.log('💪 Calisthenics Blue pronto!');
    }

    // ============ EXPOSIÇÃO GLOBAL ============
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
    window.addExerciseByClick = addExerciseByClick;
    window.removeFromWorkout = removeFromWorkout;
    window.increaseSeries = increaseSeries;
    window.decreaseSeries = decreaseSeries;
    window.loadWorkoutForEditing = loadWorkoutForEditing;
    window.cancelEditWorkout = cancelEditWorkout;
    window.renameWorkout = renameWorkout;
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
    window.toggleTimerMode = toggleTimerMode;
    window.startStopwatch = startStopwatch;
    window.pauseStopwatch = pauseStopwatch;
    window.resetStopwatch = resetStopwatch;
    window.analyzeAndGenerate = analyzeAndGenerate;
    window.resetAllProgress = resetAllProgress;
    window.slideAtual = slideAtual;
    window.mudarSlide = mudarSlide;
    window.filterExercises = filterExercises;
    window.updateProfilePic = updateProfilePic;
    window.editProfileName = editProfileName;
    window.toggleTheme = toggleTheme;
    window.toggleDiaConfig = toggleDiaConfig;
    window.toggleModoDia = toggleModoDia;
    window.gerarPlanoSemanal = gerarPlanoSemanal;
    window.salvarPlanoSemanal = salvarPlanoSemanal;
    window.setHorarioPreset = setHorarioPreset;
    window.exportarPlanoGoogleCalendar = exportarPlanoGoogleCalendar;
    window.baixarPlanoCalendario = baixarPlanoCalendario;
    window.openExerciseTutorial = openExerciseTutorial;
    window.gerarDiasDaSemana = gerarDiasDaSemana;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Iniciar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();