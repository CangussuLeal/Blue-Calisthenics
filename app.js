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

    // ============ DATABASE EXPANDIDO ============
    const exerciseDB = [
        // ========== FORÇA ==========
        { nome: "Australian Pull Up", nivel: "Iniciante", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Core"], tipo: "Pull", xp: 15, duracao: 45 },
        { nome: "Pull Up", nivel: "Iniciante", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Antebraço"], tipo: "Pull", xp: 20, duracao: 45 },
        { nome: "Chin Up", nivel: "Iniciante", grupo_principal: "Bíceps", grupos_secundarios: ["Dorsal", "Core"], tipo: "Pull", xp: 20, duracao: 45 },
        { nome: "Archer Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Ombro"], tipo: "Pull", xp: 35, duracao: 45 },
        { nome: "Typewriter Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Core"], tipo: "Pull", xp: 35, duracao: 45 },
        { nome: "Chest-to-Bar Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Trapézio"], tipo: "Pull", xp: 35, duracao: 45 },
        { nome: "Explosive Pull Up", nivel: "Intermediário", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Ombro"], tipo: "Pull", xp: 40, duracao: 45 },
        { nome: "Muscle Up", nivel: "Avançado", grupo_principal: "Costas", grupos_secundarios: ["Peitoral", "Tríceps", "Core"], tipo: "Pull", xp: 70, duracao: 45 },
        { nome: "One Arm Pull Up", nivel: "Avançado", grupo_principal: "Costas", grupos_secundarios: ["Bíceps", "Core"], tipo: "Pull", xp: 80, duracao: 45 },
        { nome: "Incline Push Up", nivel: "Iniciante", grupo_principal: "Peitoral", grupos_secundarios: ["Ombro", "Tríceps"], tipo: "Push", xp: 10, duracao: 45 },
        { nome: "Push Up", nivel: "Iniciante", grupo_principal: "Peitoral", grupos_secundarios: ["Ombro", "Tríceps"], tipo: "Push", xp: 12, duracao: 45 },
        { nome: "Diamond Push Up", nivel: "Iniciante", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Push", xp: 15, duracao: 45 },
        { nome: "Decline Push Up", nivel: "Intermediário", grupo_principal: "Peitoral Superior", grupos_secundarios: ["Ombro"], tipo: "Push", xp: 25, duracao: 45 },
        { nome: "Archer Push Up", nivel: "Intermediário", grupo_principal: "Peitoral", grupos_secundarios: ["Ombro", "Core"], tipo: "Push", xp: 30, duracao: 45 },
        { nome: "Ring Push Up", nivel: "Intermediário", grupo_principal: "Peitoral", grupos_secundarios: ["Core", "Ombro"], tipo: "Push", xp: 30, duracao: 45 },
        { nome: "Pseudo Planche Push Up", nivel: "Avançado", grupo_principal: "Ombro", grupos_secundarios: ["Peitoral", "Core"], tipo: "Push", xp: 55, duracao: 45 },
        { nome: "Planche Push Up", nivel: "Avançado", grupo_principal: "Ombro", grupos_secundarios: ["Peitoral", "Core"], tipo: "Push", xp: 75, duracao: 45 },
        { nome: "Pike Hold", nivel: "Iniciante", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 12, duracao: 30 },
        { nome: "Pike Push Up", nivel: "Iniciante", grupo_principal: "Ombros", grupos_secundarios: ["Tríceps"], tipo: "Ombros", xp: 18, duracao: 45 },
        { nome: "Elevated Pike Push Up", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 28, duracao: 45 },
        { nome: "Wall Handstand Hold", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 25, duracao: 30 },
        { nome: "Handstand Push Up Negativa", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: ["Tríceps"], tipo: "Ombros", xp: 32, duracao: 45 },
        { nome: "Handstand Push Up", nivel: "Avançado", grupo_principal: "Ombros", grupos_secundarios: ["Core", "Tríceps"], tipo: "Ombros", xp: 60, duracao: 45 },
        { nome: "Freestanding HSPU", nivel: "Avançado", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Ombros", xp: 70, duracao: 45 },
        { nome: "Bench Dip", nivel: "Iniciante", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Tríceps", xp: 10, duracao: 45 },
        { nome: "Parallel Bar Dip", nivel: "Intermediário", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Tríceps", xp: 28, duracao: 45 },
        { nome: "Korean Dip", nivel: "Intermediário", grupo_principal: "Tríceps", grupos_secundarios: ["Ombro"], tipo: "Tríceps", xp: 32, duracao: 45 },
        { nome: "Ring Dip", nivel: "Avançado", grupo_principal: "Tríceps", grupos_secundarios: ["Core"], tipo: "Tríceps", xp: 50, duracao: 45 },
        { nome: "Straight Bar Dip", nivel: "Avançado", grupo_principal: "Tríceps", grupos_secundarios: ["Peitoral"], tipo: "Tríceps", xp: 55, duracao: 45 },
        { nome: "Hollow Body Hold", nivel: "Iniciante", grupo_principal: "Abdômen", grupos_secundarios: ["Lombar"], tipo: "Core", xp: 10, duracao: 30 },
        { nome: "Dead Bug", nivel: "Iniciante", grupo_principal: "Abdômen", grupos_secundarios: ["Lombar"], tipo: "Core", xp: 10, duracao: 45 },
        { nome: "Knee Raise", nivel: "Iniciante", grupo_principal: "Abdômen", grupos_secundarios: ["Flexores do Quadril"], tipo: "Core", xp: 12, duracao: 45 },
        { nome: "Leg Raise", nivel: "Intermediário", grupo_principal: "Abdômen", grupos_secundarios: ["Core"], tipo: "Core", xp: 22, duracao: 45 },
        { nome: "Toes to Bar", nivel: "Intermediário", grupo_principal: "Abdômen", grupos_secundarios: ["Costas"], tipo: "Core", xp: 28, duracao: 45 },
        { nome: "Dragon Flag", nivel: "Avançado", grupo_principal: "Core", grupos_secundarios: ["Lombar"], tipo: "Core", xp: 55, duracao: 30 },
        { nome: "Windshield Wiper", nivel: "Avançado", grupo_principal: "Core", grupos_secundarios: ["Ombros"], tipo: "Core", xp: 60, duracao: 30 },
        { nome: "Agachamento Livre", nivel: "Iniciante", grupo_principal: "Quadríceps", grupos_secundarios: ["Glúteos"], tipo: "Pernas", xp: 12, duracao: 45 },
        { nome: "Afundo", nivel: "Iniciante", grupo_principal: "Quadríceps", grupos_secundarios: ["Glúteos"], tipo: "Pernas", xp: 12, duracao: 45 },
        { nome: "Step Up", nivel: "Iniciante", grupo_principal: "Quadríceps", grupos_secundarios: ["Panturrilha"], tipo: "Pernas", xp: 10, duracao: 45 },
        { nome: "Bulgarian Split Squat", nivel: "Intermediário", grupo_principal: "Quadríceps", grupos_secundarios: ["Glúteos"], tipo: "Pernas", xp: 25, duracao: 45 },
        { nome: "Jump Squat", nivel: "Intermediário", grupo_principal: "Quadríceps", grupos_secundarios: ["Panturrilha"], tipo: "Pernas", xp: 22, duracao: 45 },
        { nome: "Pistol Squat Assistido", nivel: "Intermediário", grupo_principal: "Quadríceps", grupos_secundarios: ["Core"], tipo: "Pernas", xp: 28, duracao: 45 },
        { nome: "Pistol Squat", nivel: "Avançado", grupo_principal: "Quadríceps", grupos_secundarios: ["Core"], tipo: "Pernas", xp: 50, duracao: 45 },
        { nome: "Shrimp Squat", nivel: "Avançado", grupo_principal: "Quadríceps", grupos_secundarios: ["Core"], tipo: "Pernas", xp: 52, duracao: 45 },
        { nome: "Scapula Pull", nivel: "Iniciante", grupo_principal: "Front Lever", grupos_secundarios: ["Costas"], tipo: "Front Lever", xp: 15, duracao: 45 },
        { nome: "Tuck Front Lever Hold", nivel: "Iniciante", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 20, duracao: 30 },
        { nome: "Advanced Tuck Front Lever", nivel: "Intermediário", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 35, duracao: 30 },
        { nome: "One Leg Front Lever", nivel: "Intermediário", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 40, duracao: 30 },
        { nome: "Straddle Front Lever", nivel: "Avançado", grupo_principal: "Front Lever", grupos_secundarios: ["Core"], tipo: "Front Lever", xp: 60, duracao: 30 },
        { nome: "Full Front Lever", nivel: "Avançado", grupo_principal: "Front Lever", grupos_secundarios: ["Corpo inteiro"], tipo: "Front Lever", xp: 75, duracao: 30 },
        { nome: "Front Lever Pull Up", nivel: "Elite", grupo_principal: "Front Lever", grupos_secundarios: ["Bíceps", "Core"], tipo: "Front Lever", xp: 100, duracao: 45 },
        { nome: "Frog Stand", nivel: "Iniciante", grupo_principal: "Planche", grupos_secundarios: ["Ombros"], tipo: "Planche", xp: 15, duracao: 30 },
        { nome: "Planche Lean", nivel: "Iniciante", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 18, duracao: 30 },
        { nome: "Tuck Planche", nivel: "Intermediário", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 35, duracao: 30 },
        { nome: "Advanced Tuck Planche", nivel: "Intermediário", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 40, duracao: 30 },
        { nome: "Straddle Planche", nivel: "Avançado", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Core"], tipo: "Planche", xp: 65, duracao: 30 },
        { nome: "Full Planche", nivel: "Avançado", grupo_principal: "Planche", grupos_secundarios: ["Corpo inteiro"], tipo: "Planche", xp: 85, duracao: 30 },
        { nome: "Planche Push Up (Elite)", nivel: "Elite", grupo_principal: "Planche", grupos_secundarios: ["Ombros", "Peitoral", "Core"], tipo: "Planche", xp: 110, duracao: 45 },
        { nome: "Wall Walk", nivel: "Iniciante", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 15, duracao: 45 },
        { nome: "Wall Handstand", nivel: "Iniciante", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 18, duracao: 30 },
        { nome: "Shoulder Tap", nivel: "Intermediário", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 30, duracao: 45 },
        { nome: "Freestanding Handstand", nivel: "Intermediário", grupo_principal: "Handstand", grupos_secundarios: ["Core"], tipo: "Handstand", xp: 40, duracao: 30 },
        { nome: "Handstand Press", nivel: "Avançado", grupo_principal: "Handstand", grupos_secundarios: ["Ombros", "Core"], tipo: "Handstand", xp: 65, duracao: 45 },
        { nome: "One Arm Handstand", nivel: "Elite", grupo_principal: "Handstand", grupos_secundarios: ["Core", "Ombros"], tipo: "Handstand", xp: 120, duracao: 30 },
        { nome: "Vertical Flag Hold", nivel: "Iniciante", grupo_principal: "Human Flag", grupos_secundarios: ["Ombros", "Core"], tipo: "Human Flag", xp: 20, duracao: 30 },
        { nome: "Tuck Flag", nivel: "Intermediário", grupo_principal: "Human Flag", grupos_secundarios: ["Core", "Ombros"], tipo: "Human Flag", xp: 35, duracao: 30 },
        { nome: "Advanced Tuck Flag", nivel: "Intermediário", grupo_principal: "Human Flag", grupos_secundarios: ["Core", "Ombros"], tipo: "Human Flag", xp: 40, duracao: 30 },
        { nome: "Straddle Flag", nivel: "Avançado", grupo_principal: "Human Flag", grupos_secundarios: ["Core", "Ombros"], tipo: "Human Flag", xp: 60, duracao: 30 },
        { nome: "Full Human Flag", nivel: "Avançado", grupo_principal: "Human Flag", grupos_secundarios: ["Corpo inteiro"], tipo: "Human Flag", xp: 80, duracao: 30 },
        { nome: "Human Flag Pull Up", nivel: "Elite", grupo_principal: "Human Flag", grupos_secundarios: ["Costas", "Core", "Ombros"], tipo: "Human Flag", xp: 130, duracao: 45 },
        { nome: "Muscle Up (Full Body)", nivel: "Avançado", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Costas","Peitoral","Ombros","Tríceps","Core"], tipo: "Corpo Inteiro", xp: 70, duracao: 45 },
        { nome: "Front Lever Pull Up (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Costas","Bíceps","Core"], tipo: "Corpo Inteiro", xp: 100, duracao: 45 },
        { nome: "Planche Push Up (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Ombros","Peitoral","Core","Tríceps"], tipo: "Corpo Inteiro", xp: 110, duracao: 45 },
        { nome: "Human Flag (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Ombros","Costas","Core"], tipo: "Corpo Inteiro", xp: 80, duracao: 30 },
        { nome: "One Arm Pull Up (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Costas","Bíceps","Core"], tipo: "Corpo Inteiro", xp: 80, duracao: 45 },
        { nome: "Full Planche (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Corpo inteiro"], tipo: "Corpo Inteiro", xp: 85, duracao: 30 },
        { nome: "Full Front Lever (Full)", nivel: "Elite", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Corpo inteiro"], tipo: "Corpo Inteiro", xp: 75, duracao: 30 },

        // ========== ALONGAMENTOS ==========
        { nome: "Alongamento de Pescoço", nivel: "Iniciante", grupo_principal: "Cervical", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento de Trapézio", nivel: "Iniciante", grupo_principal: "Pescoço/Ombros", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento de Ombros Cruzado", nivel: "Iniciante", grupo_principal: "Ombros", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento de Tríceps", nivel: "Iniciante", grupo_principal: "Braços", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento de Punhos", nivel: "Iniciante", grupo_principal: "Punhos", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento de Peitoral na Parede", nivel: "Iniciante", grupo_principal: "Peitoral", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento de Panturrilha", nivel: "Iniciante", grupo_principal: "Panturrilhas", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento de Quadríceps em Pé", nivel: "Iniciante", grupo_principal: "Coxas", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento Borboleta", nivel: "Iniciante", grupo_principal: "Adutores", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Alongamento Sentado para Isquiotibiais", nivel: "Iniciante", grupo_principal: "Posterior da Coxa", grupos_secundarios: [], tipo: "Alongamento", xp: 10, duracao: 30 },
        { nome: "Pancake Stretch", nivel: "Intermediário", grupo_principal: "Adutores", grupos_secundarios: ["Quadril"], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Alongamento de Flexores do Quadril", nivel: "Intermediário", grupo_principal: "Quadril", grupos_secundarios: [], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Alongamento de Costas Sentado", nivel: "Intermediário", grupo_principal: "Lombar", grupos_secundarios: [], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Jefferson Curl Leve", nivel: "Intermediário", grupo_principal: "Cadeia Posterior", grupos_secundarios: [], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Alongamento de Ombros com Bastão", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: [], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Frog Stretch", nivel: "Intermediário", grupo_principal: "Quadril", grupos_secundarios: ["Adutores"], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Couch Stretch", nivel: "Intermediário", grupo_principal: "Quadríceps", grupos_secundarios: [], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Alongamento de Pulso Avançado", nivel: "Intermediário", grupo_principal: "Punhos", grupos_secundarios: [], tipo: "Alongamento", xp: 20, duracao: 45 },
        { nome: "Middle Split", nivel: "Avançado", grupo_principal: "Adutores", grupos_secundarios: ["Quadril"], tipo: "Alongamento", xp: 40, duracao: 60 },
        { nome: "Front Split", nivel: "Avançado", grupo_principal: "Pernas", grupos_secundarios: ["Quadril"], tipo: "Alongamento", xp: 40, duracao: 60 },
        { nome: "Ponte Completa", nivel: "Avançado", grupo_principal: "Ombros e Coluna", grupos_secundarios: ["Peitoral"], tipo: "Alongamento", xp: 40, duracao: 60 },
        { nome: "German Hang", nivel: "Avançado", grupo_principal: "Ombros", grupos_secundarios: ["Costas"], tipo: "Alongamento", xp: 40, duracao: 45 },
        { nome: "Pancake Avançado", nivel: "Avançado", grupo_principal: "Quadril", grupos_secundarios: ["Adutores"], tipo: "Alongamento", xp: 40, duracao: 60 },
        { nome: "Oversplit", nivel: "Elite", grupo_principal: "Flexibilidade Extrema", grupos_secundarios: ["Pernas"], tipo: "Alongamento", xp: 60, duracao: 60 },

        // ========== YOGA ==========
        { nome: "Mountain Pose", nivel: "Iniciante", grupo_principal: "Postura", grupos_secundarios: [], tipo: "Yoga", xp: 10, duracao: 30 },
        { nome: "Child's Pose", nivel: "Iniciante", grupo_principal: "Costas", grupos_secundarios: ["Quadril"], tipo: "Yoga", xp: 10, duracao: 30 },
        { nome: "Cat-Cow", nivel: "Iniciante", grupo_principal: "Coluna", grupos_secundarios: [], tipo: "Yoga", xp: 10, duracao: 30 },
        { nome: "Cobra Pose", nivel: "Iniciante", grupo_principal: "Lombar", grupos_secundarios: ["Abdômen"], tipo: "Yoga", xp: 10, duracao: 30 },
        { nome: "Downward Dog", nivel: "Iniciante", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Ombros", "Posterior da Coxa"], tipo: "Yoga", xp: 15, duracao: 45 },
        { nome: "Seated Forward Fold", nivel: "Iniciante", grupo_principal: "Posterior da Coxa", grupos_secundarios: ["Lombar"], tipo: "Yoga", xp: 10, duracao: 30 },
        { nome: "Happy Baby", nivel: "Iniciante", grupo_principal: "Quadril", grupos_secundarios: [], tipo: "Yoga", xp: 10, duracao: 30 },
        { nome: "Warrior I", nivel: "Intermediário", grupo_principal: "Pernas", grupos_secundarios: ["Quadril"], tipo: "Yoga", xp: 20, duracao: 45 },
        { nome: "Warrior II", nivel: "Intermediário", grupo_principal: "Pernas e Core", grupos_secundarios: ["Quadril"], tipo: "Yoga", xp: 20, duracao: 45 },
        { nome: "Triangle Pose", nivel: "Intermediário", grupo_principal: "Pernas e Quadril", grupos_secundarios: ["Ombros"], tipo: "Yoga", xp: 20, duracao: 45 },
        { nome: "Crow Pose", nivel: "Intermediário", grupo_principal: "Core e Braços", grupos_secundarios: ["Ombros", "Punhos"], tipo: "Yoga", xp: 30, duracao: 30 },
        { nome: "Dolphin Pose", nivel: "Intermediário", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Yoga", xp: 25, duracao: 45 },
        { nome: "Half Moon Pose", nivel: "Intermediário", grupo_principal: "Equilíbrio", grupos_secundarios: ["Pernas"], tipo: "Yoga", xp: 25, duracao: 45 },
        { nome: "Boat Pose", nivel: "Intermediário", grupo_principal: "Core", grupos_secundarios: ["Flexores do Quadril"], tipo: "Yoga", xp: 25, duracao: 30 },
        { nome: "Headstand", nivel: "Avançado", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Ombros", "Core"], tipo: "Yoga", xp: 50, duracao: 60 },
        { nome: "Forearm Stand", nivel: "Avançado", grupo_principal: "Ombros", grupos_secundarios: ["Core"], tipo: "Yoga", xp: 50, duracao: 60 },
        { nome: "Scorpion Pose", nivel: "Avançado", grupo_principal: "Ombros e Coluna", grupos_secundarios: ["Core"], tipo: "Yoga", xp: 50, duracao: 60 },
        { nome: "Wheel Pose", nivel: "Avançado", grupo_principal: "Coluna", grupos_secundarios: ["Ombros", "Peitoral"], tipo: "Yoga", xp: 50, duracao: 60 },
        { nome: "Firefly Pose", nivel: "Avançado", grupo_principal: "Core e Braços", grupos_secundarios: ["Ombros"], tipo: "Yoga", xp: 50, duracao: 60 },
        { nome: "Eight-Angle Pose", nivel: "Avançado", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Core", "Braços"], tipo: "Yoga", xp: 50, duracao: 60 },

        // ========== AQUECIMENTO ==========
        { nome: "Polichinelo", nivel: "Iniciante", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Pernas", "Ombros"], tipo: "Aquecimento", xp: 5, duracao: 30 },
        { nome: "Rotação de Ombros", nivel: "Iniciante", grupo_principal: "Ombros", grupos_secundarios: [], tipo: "Aquecimento", xp: 5, duracao: 20 },
        { nome: "Agachamento Livre (sem carga)", nivel: "Iniciante", grupo_principal: "Pernas", grupos_secundarios: ["Core"], tipo: "Aquecimento", xp: 5, duracao: 30 },
        { nome: "Mobilidade de Quadril", nivel: "Iniciante", grupo_principal: "Quadril", grupos_secundarios: ["Core"], tipo: "Aquecimento", xp: 5, duracao: 25 },
        { nome: "Alongamento Dinâmico", nivel: "Iniciante", grupo_principal: "Corpo Inteiro", grupos_secundarios: [], tipo: "Aquecimento", xp: 5, duracao: 20 },
        { nome: "Jumping Jack", nivel: "Iniciante", grupo_principal: "Corpo Inteiro", grupos_secundarios: ["Pernas"], tipo: "Aquecimento", xp: 5, duracao: 30 },
        { nome: "High Knees", nivel: "Iniciante", grupo_principal: "Pernas", grupos_secundarios: ["Core"], tipo: "Aquecimento", xp: 5, duracao: 30 },

        // ========== RESFRIAMENTO ==========
        { nome: "Respiração Diafragmática", nivel: "Iniciante", grupo_principal: "Core", grupos_secundarios: [], tipo: "Resfriamento", xp: 5, duracao: 60 },
        { nome: "Alongamento de Corpo Inteiro", nivel: "Iniciante", grupo_principal: "Corpo Inteiro", grupos_secundarios: [], tipo: "Resfriamento", xp: 5, duracao: 45 },
        { nome: "Savasana (Relaxamento)", nivel: "Iniciante", grupo_principal: "Corpo Inteiro", grupos_secundarios: [], tipo: "Resfriamento", xp: 5, duracao: 60 }
    ];

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
    let timerStartedAt = null;
    let timerTargetValue = null;
    let stopwatchInterval = null;
    let stopwatchSeconds = 0;
    let stopwatchRunning = false;
    let stopwatchStartedAt = null;
    let currentFilter = 'all';
    let currentSearch = '';
    let iaGeneratedWorkout = [];
    let editingWorkoutIndex = -1;
    // Playlist de música
    let musicPlaylist = [];
    let currentMusicIndex = 0;

    // ============ AUDIO (ALARME MAIS ALTO) ============
    function playBeep(frequency = 880, duration = 0.3, type = 'sine') {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 0.7; // volume aumentado
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    function playAlarm() {
        playBeep(880, 0.2);
        setTimeout(() => playBeep(880, 0.2), 300);
        setTimeout(() => playBeep(880, 0.3), 600);
    }

    // ============ UTILITÁRIOS ============
    function getUserLevel() { /* ... igual ... */ }
    function getLevelNumber() { /* ... igual ... */ }
    function getXPForNextLevel() { /* ... igual ... */ }
    function getXPProgress() { /* ... igual ... */ }
    function updateXPDisplay() { /* ... igual ... */ }
    function updateStreak() { /* ... igual ... */ }
    function showToast(msg, type='info') { /* ... igual ... */ }
    function saveAllState() { /* ... igual ... */ }
    function registerTrainingDay() { /* ... igual ... */ }
    function awardXP(amount) { /* ... igual ... */ }
    function getBadgeClass(nivel) { /* ... igual ... */ }

    // ============ RENDERIZAÇÃO ============
    function renderExerciseLibrary(filter = 'all', search = '') { /* ... igual ... */ }
    function filterExercises() { /* ... igual ... */ }
    function addExerciseByClick(idx) { /* ... igual ... */ }
    function renderChosenExercises() { /* ... igual ... */ }
    function removeFromWorkout(i) { /* ... igual ... */ }
    function handleDragStart(e, idx) { /* ... igual ... */ }
    function handleDragEnd(e) { /* ... igual ... */ }
    function handleDragOver(e) { /* ... igual ... */ }
    function handleDragLeave(e) { /* ... igual ... */ }
    function handleDrop(e) { /* ... igual ... */ }
    function clearWorkout() { /* ... igual ... */ }

    // ============ GERENCIAMENTO DE TREINOS ============
    function saveWorkout() { /* ... igual ... */ }
    function loadWorkoutForEditing(i) { /* ... igual ... */ }
    function cancelEditWorkout() { /* ... igual ... */ }
    function renameWorkout(index) { /* ... igual ... */ }
    function deleteWorkout(i) { /* ... igual ... */ }
    function renderSavedWorkouts() { /* ... igual ... */ }
    function updateActiveWorkoutSelect() { /* ... igual ... */ }
    function updateUpcomingWorkouts() { /* ... igual ... */ }
    function exportToGoogleCalendar() { /* ... igual ... */ }
    function exportIAToCalendar() { /* ... igual ... */ }

    // ============ GERADOR INTELIGENTE (ATUALIZADO) ============
    function foiFeitoRecentemente(exercise, ultimos = 2) { /* ... igual ... */ }

    function calcularScore(ex, nivel, foco, lacunas) { /* ... igual ... */ }

    function getAquecimento() {
        // Busca apenas exercícios com tipo "Aquecimento"
        const pool = exerciseDB.filter(ex => ex.tipo === 'Aquecimento');
        if (pool.length === 0) {
            return [
                { nome: "Polichinelo", nivel: "Iniciante", grupo_principal: "Corpo Inteiro", tipo: "Aquecimento", xp: 5, duracao: 30 },
                { nome: "Rotação de Ombros", nivel: "Iniciante", grupo_principal: "Ombros", tipo: "Aquecimento", xp: 5, duracao: 20 }
            ];
        }
        const selecionados = pool.sort(() => Math.random() - 0.5).slice(0, 2 + (Math.random() > 0.5 ? 1 : 0));
        return selecionados.map(ex => ({...ex}));
    }

    function getResfriamento(gruposTrabalhados) {
        const pool = exerciseDB.filter(ex => ex.tipo === 'Resfriamento');
        if (pool.length === 0) {
            return [
                { nome: "Respiração Diafragmática", nivel: "Iniciante", grupo_principal: "Core", tipo: "Resfriamento", xp: 5, duracao: 60 }
            ];
        }
        const relevantes = pool.filter(ex => 
            gruposTrabalhados.some(g => 
                g === ex.grupo_principal || (ex.grupos_secundarios && ex.grupos_secundarios.includes(g))
            )
        );
        const fonte = relevantes.length >= 1 ? relevantes : pool;
        const selecionados = fonte.sort(() => Math.random() - 0.5).slice(0, 2);
        return selecionados.map(ex => ({...ex}));
    }

    function generateIATraining(lacunas = null) { /* ... igual mas chamando as funções novas ... */ }
    function useIATraining() { /* ... igual ... */ }
    function analyzeAndGenerate() { /* ... igual ... */ }

    // ============ TREINO ATIVO ============
    function loadActiveWorkout() { /* ... igual ... */ }
    function renderActiveWorkout() { /* ... igual ... */ }
    function completeCurrentExercise() { /* ... igual ... */ }
    function skipExercise() { /* ... igual ... */ }
    function renderHistory() { /* ... igual ... */ }

    // ============ CRONÔMETROS ============
    function updateTimerDisplay() { /* ... igual ... */ }
    function startTimer() { /* ... igual ... */ }
    function regressiveTick() { /* ... igual ... */ }
    function progressiveTick() { /* ... igual ... */ }
    function pauseTimer() { /* ... igual ... */ }
    function resetTimer() { /* ... igual ... */ }
    function toggleTimerMode() { /* ... igual ... */ }
    function updateStopwatchDisplay() { /* ... igual ... */ }
    function startStopwatch() { /* ... igual ... */ }
    function pauseStopwatch() { /* ... igual ... */ }
    function resetStopwatch() { /* ... igual ... */ }

    // ============ MÚSICA COM PLAYLIST ============
    function parseMusicUrls(input) {
        return input.split(/[\n,]+/).map(s => s.trim()).filter(url => url.length > 0);
    }

    function loadMusic() {
        const rawInput = document.getElementById('musicUrl').value.trim();
        const container = document.getElementById('musicPlayerContainer');
        if (!rawInput) {
            container.innerHTML = '';
            musicPlaylist = [];
            currentMusicIndex = 0;
            return;
        }
        musicPlaylist = parseMusicUrls(rawInput);
        currentMusicIndex = 0;
        playMusicAtIndex(0);
    }

    function playMusicAtIndex(index) {
        if (musicPlaylist.length === 0) return;
        currentMusicIndex = (index + musicPlaylist.length) % musicPlaylist.length;
        const url = musicPlaylist[currentMusicIndex];
        const container = document.getElementById('musicPlayerContainer');
        container.innerHTML = ''; // limpa

        if (url.includes('soundcloud.com')) {
            fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
                .then(res => res.ok ? res.json() : Promise.reject())
                .then(data => { container.innerHTML = data.html; })
                .catch(() => showFallback(url, container));
        } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let id = null;
            try {
                const u = new URL(url);
                if (u.searchParams.has('v')) id = u.searchParams.get('v');
                else if (u.hostname === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
                else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2];
                else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2];
            } catch (e) {}
            if (id) {
                container.innerHTML = `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;"><iframe style="position:absolute; top:0; left:0; width:100%; height:100%;" src="https://www.youtube.com/embed/${id}?rel=0&autoplay=1" allowfullscreen></iframe></div>`;
            }
        } else if (url.includes('open.spotify.com')) {
            try {
                const u = new URL(url);
                const parts = u.pathname.split('/').filter(Boolean);
                if (parts.length >= 2 && ['track','album','playlist'].includes(parts[0])) {
                    container.innerHTML = `<iframe style="border-radius:12px;" src="https://open.spotify.com/embed/${parts[0]}/${parts[1]}" width="100%" height="152" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
                }
            } catch (e) {}
        } else {
            showFallback(url, container);
        }
        updateMusicControls();
    }

    function nextMusic() {
        if (musicPlaylist.length === 0) return;
        playMusicAtIndex(currentMusicIndex + 1);
    }

    function prevMusic() {
        if (musicPlaylist.length === 0) return;
        playMusicAtIndex(currentMusicIndex - 1);
    }

    function updateMusicControls() {
        const container = document.getElementById('musicPlayerContainer');
        if (!container) return;
        const controlsDiv = document.createElement('div');
        controlsDiv.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:10px;';
        controlsDiv.innerHTML = `
            <button class="btn btn-sm btn-outline" onclick="prevMusic()">⏮️ Anterior</button>
            <span style="color:var(--text2);align-self:center;">${currentMusicIndex+1}/${musicPlaylist.length}</span>
            <button class="btn btn-sm btn-outline" onclick="nextMusic()">Próximo ⏭️</button>
        `;
        container.appendChild(controlsDiv);
    }

    function showFallback(url, container) {
        container.innerHTML = `<div style="text-align:center; padding:20px; background:var(--surface2); border-radius:var(--radius-sm);"><p style="color:var(--text2);">Não foi possível incorporar este link.</p><a href="${url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:8px;">▶️ Ouvir no site original</a></div>`;
    }

    // ============ ANÁLISE DO TREINO ============
    function analisarWorkout(workout) { /* ... igual ... */ }
    function atualizarAnalise() { /* ... igual ... */ }

    // ============ CARROSSEL ============
    let carrosselIndex = 0;
    let carrosselTimer = null;
    const totalSlides = 4;
    function slideAtual(index) { /* ... igual ... */ }
    function mudarSlide(direcao) { /* ... igual ... */ }
    function atualizarCarrossel() { /* ... igual ... */ }
    function autoPlay() { /* ... igual ... */ }
    function resetarAutoPlay() { /* ... igual ... */ }
    autoPlay();

    // ============ NAVEGAÇÃO ============
    function navigateTo(page, btn) { /* ... igual ... */ }
    function toggleSidebar() { /* ... igual ... */ }
    function resetAllProgress() { /* ... igual ... */ }

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
    window.loadMusic = loadMusic;
    window.prevMusic = prevMusic;
    window.nextMusic = nextMusic;
    window.analyzeAndGenerate = analyzeAndGenerate;
    window.resetAllProgress = resetAllProgress;
    window.slideAtual = slideAtual;
    window.mudarSlide = mudarSlide;
    window.filterExercises = filterExercises;

    // ============ INIT ============
    document.getElementById('filterTags').addEventListener('click', e => { /* ... igual ... */ });
    document.getElementById('timerSeconds').addEventListener('change', function() { /* ... igual ... */ });
    updateXPDisplay();
    renderExerciseLibrary('all', currentSearch);
    renderChosenExercises();
    renderSavedWorkouts();
    renderHistory();
    updateActiveWorkoutSelect();
    updateUpcomingWorkouts();
    updateTimerDisplay();
    updateStopwatchDisplay();
    console.log('💪 Calisthenics Blue pronto!');
})();