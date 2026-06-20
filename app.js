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
    let musicPlaylist = [];
    let currentMusicIndex = 0;
    let musicPaused = false;

    // ============ AUDIO (ALARME MAIS ALTO) ============
    function playBeep(frequency = 880, duration = 0.3, type = 'square') {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.value = 1.0;
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            oscillator.stop(audioCtx.currentTime + duration);
            if (navigator.vibrate) navigator.vibrate(1000);
        } catch (e) {}
    }

    function playAlarm() {
        playBeep(880, 0.25);
        setTimeout(() => playBeep(880, 0.25), 300);
        setTimeout(() => playBeep(1100, 0.35), 600);
    }

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

    // ============ RENDERIZAÇÃO ============
    function renderExerciseLibrary(filter = 'all', search = '') {
        const container = document.getElementById('exerciseLibrary');
        let exs = exerciseDB;
        if (filter !== 'all') {
            exs = exs.filter(e => e.tipo === filter || e.grupo_principal === filter || (e.grupos_secundarios || []).includes(filter));
        }
        if (search.trim() !== '') {
            const term = search.trim().toLowerCase();
            exs = exs.filter(e => e.nome.toLowerCase().includes(term));
        }
        container.innerHTML = exs.map((ex, i) => {
            const realIndex = exerciseDB.indexOf(ex);
            return `
            <div class="exercise-item" draggable="true" data-exercise-index="${realIndex}" 
                 ondragstart="handleDragStart(event,${realIndex})" ondragend="handleDragEnd(event)"
                 onclick="addExerciseByClick(${realIndex})">
              <div class="ex-info"><div class="ex-name">${ex.nome}</div><div class="ex-meta">${ex.grupo_principal} • <span class="badge ${getBadgeClass(ex.nivel)}">${ex.nivel}</span> • ${ex.xp} XP</div></div>
              <span style="font-size:1.2rem;">⋮⋮</span>
            </div>`;
        }).join('');
    }

    function filterExercises() {
        currentSearch = document.getElementById('exerciseSearch').value;
        renderExerciseLibrary(currentFilter, currentSearch);
    }

    function addExerciseByClick(idx) {
        if (exerciseDB[idx]) {
            currentWorkout.push({...exerciseDB[idx], series: 3});
            renderChosenExercises();
            showToast(`➕ ${exerciseDB[idx].nome} adicionado!`, 'success');
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        document.getElementById('dropZone').classList.remove('drag-over');
        const idx = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(idx) && exerciseDB[idx]) {
            currentWorkout.push({...exerciseDB[idx], series: 3});
            renderChosenExercises();
            showToast(`➕ ${exerciseDB[idx].nome} adicionado!`, 'success');
        }
    }

    function renderChosenExercises() {
        const container = document.getElementById('chosenExercises');
        document.getElementById('dropPlaceholder').style.display = currentWorkout.length ? 'none' : 'block';
        container.innerHTML = currentWorkout.map((ex, i) => `
        <div class="exercise-item" style="cursor:default;border-color:var(--primary);">
          <div class="ex-info">
            <div class="ex-name">${i+1}. ${ex.nome}</div>
            <div class="ex-meta">${ex.grupo_principal} • ${ex.xp} XP</div>
          </div>
          <div style="display:flex; align-items:center; gap:4px; margin-right: 8px;">
            <button class="btn btn-sm btn-outline" onclick="decreaseSeries(${i})" style="padding:2px 8px;">−</button>
            <span style="min-width:24px; text-align:center; font-weight:600;">${ex.series || 3}</span>
            <button class="btn btn-sm btn-outline" onclick="increaseSeries(${i})" style="padding:2px 8px;">+</button>
            <span style="font-size:0.7rem;color:var(--text2);">sér.</span>
          </div>
          <button class="btn btn-danger btn-sm" onclick="removeFromWorkout(${i})">✕</button>
        </div>`).join('');
        updateActiveWorkoutSelect();
        if (typeof atualizarAnalise === 'function') atualizarAnalise();
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

    function removeFromWorkout(i) { currentWorkout.splice(i,1); renderChosenExercises(); }
    function handleDragStart(e, idx) { e.dataTransfer.setData('text/plain', idx.toString()); e.target.classList.add('dragging'); }
    function handleDragEnd(e) { e.target.classList.remove('dragging'); }
    function handleDragOver(e) { e.preventDefault(); document.getElementById('dropZone').classList.add('drag-over'); }
    function handleDragLeave(e) { document.getElementById('dropZone').classList.remove('drag-over'); }
    function clearWorkout() {
        editingWorkoutIndex = -1;
        currentWorkout = [];
        renderChosenExercises();
        document.getElementById('workoutName').value = '';
        document.getElementById('saveWorkoutBtn').textContent = '💾 Salvar Treino';
        document.getElementById('cancelEditBtn').style.display = 'none';
        showToast('Treino limpo!','info');
    }

    // ============ GERENCIAMENTO DE TREINOS ============
    function saveWorkout() {
        if (!currentWorkout.length) return showToast('⚠️ Adicione exercícios.','error');
        const name = document.getElementById('workoutName').value.trim() || 'Treino ' + (savedWorkouts.length + 1);
        if (editingWorkoutIndex >= 0) {
            savedWorkouts[editingWorkoutIndex] = {
                ...savedWorkouts[editingWorkoutIndex],
                name: name,
                exercises: [...currentWorkout],
                totalXP: currentWorkout.reduce((s, e) => s + e.xp, 0)
            };
            showToast(`✏️ "${name}" atualizado!`, 'success');
            editingWorkoutIndex = -1;
            document.getElementById('saveWorkoutBtn').textContent = '💾 Salvar Treino';
            document.getElementById('cancelEditBtn').style.display = 'none';
        } else {
            savedWorkouts.push({ id: Date.now(), name, exercises: [...currentWorkout], createdAt: new Date().toISOString(), totalXP: currentWorkout.reduce((s, e) => s + e.xp, 0) });
            showToast(`💾 "${name}" salvo!`, 'success');
        }
        saveAllState();
        currentWorkout = [];
        document.getElementById('workoutName').value = '';
        renderChosenExercises();
        renderSavedWorkouts();
        updateXPDisplay();
    }

    function loadWorkoutForEditing(i) {
        editingWorkoutIndex = i;
        currentWorkout = [...savedWorkouts[i].exercises];
        document.getElementById('workoutName').value = savedWorkouts[i].name;
        renderChosenExercises();
        document.getElementById('saveWorkoutBtn').textContent = '💾 Atualizar Treino';
        document.getElementById('cancelEditBtn').style.display = 'inline-flex';
        navigateTo('build', document.querySelector('[data-page=build]'));
    }

    function cancelEditWorkout() {
        editingWorkoutIndex = -1;
        currentWorkout = [];
        document.getElementById('workoutName').value = '';
        renderChosenExercises();
        document.getElementById('saveWorkoutBtn').textContent = '💾 Salvar Treino';
        document.getElementById('cancelEditBtn').style.display = 'none';
        showToast('Edição cancelada.', 'info');
    }

    function renameWorkout(index) {
        const oldName = savedWorkouts[index].name;
        const newName = prompt('Renomear treino:', oldName);
        if (newName && newName.trim() !== '') {
            savedWorkouts[index].name = newName.trim();
            saveAllState();
            renderSavedWorkouts();
            updateActiveWorkoutSelect();
            updateUpcomingWorkouts();
            showToast(`✏️ Treino renomeado para "${newName.trim()}"`, 'success');
        }
    }

    function deleteWorkout(i) {
        if (confirm(`Deletar "${savedWorkouts[i].name}"?`)) {
            savedWorkouts.splice(i, 1);
            saveAllState();
            renderSavedWorkouts();
            updateXPDisplay();
        }
    }

    function renderSavedWorkouts() {
        const c = document.getElementById('savedWorkoutsList');
        c.innerHTML = savedWorkouts.length ? savedWorkouts.map((w,i) => `
        <div class="exercise-item" style="cursor:default;justify-content:space-between;">
            <div><strong>${w.name}</strong><div class="ex-meta">${w.exercises.length} ex. • ${w.totalXP} XP</div></div>
            <div class="flex gap-2">
                <button class="btn btn-outline btn-sm" onclick="loadWorkoutForEditing(${i})">📋</button>
                <button class="btn btn-outline btn-sm" onclick="renameWorkout(${i})">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteWorkout(${i})">🗑️</button>
            </div>
        </div>`).join('') : '<p style="color:var(--text2);">Nenhum treino salvo.</p>';
        updateActiveWorkoutSelect();
        updateUpcomingWorkouts();
    }

    function updateActiveWorkoutSelect() {
        document.getElementById('activeWorkoutSelect').innerHTML = '<option value="">-- Selecione --</option>' + savedWorkouts.map((w,i) => `<option value="${i}">${w.name} (${w.exercises.length} ex.)</option>`).join('');
    }
    function updateUpcomingWorkouts() {
        document.getElementById('upcomingWorkouts').innerHTML = savedWorkouts.length ? savedWorkouts.slice(-3).reverse().map(w => `<div style="padding:6px 0;border-bottom:1px solid var(--border);">📋 <strong>${w.name}</strong> - ${w.totalXP} XP</div>`).join('') + '<button class="btn btn-outline btn-sm mt-2" onclick="navigateTo(\'build\', document.querySelector(\'[data-page=build]\'))">Ver Todos</button>' : 'Nenhum treino agendado.';
    }
    function exportToGoogleCalendar() {
        if (!currentWorkout.length) return showToast('⚠️ Monte um treino antes.','error');
        const name = document.getElementById('workoutName').value.trim() || 'Treino Calisthenics Blue';
        const desc = currentWorkout.map((e,i) => `${i+1}. ${e.nome} (${e.xp} XP)`).join('\n');
        const now = new Date(); const start = new Date(now.getTime()+3600000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        const end = new Date(now.getTime()+7200000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(name)}&details=${encodeURIComponent(desc)}&dates=${start}/${end}`, '_blank');
        showToast('📅 Abrindo Google Agenda...','success');
    }
    function exportIAToCalendar() {
        if (!iaGeneratedWorkout.length) return showToast('⚠️ Gere um treino primeiro.','error');
        const desc = iaGeneratedWorkout.map((e,i) => `${i+1}. ${e.nome} (${e.xp} XP)`).join('\n');
        const now = new Date(); const start = new Date(now.getTime()+3600000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        const end = new Date(now.getTime()+7200000).toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
        window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Treino Automático Calisthenics')}&details=${encodeURIComponent(desc)}&dates=${start}/${end}`, '_blank');
        showToast('📅 Google Agenda!','success');
    }

    // ============ GERADOR INTELIGENTE ============
    function foiFeitoRecentemente(exercise, ultimos = 2) {
        const recentes = workoutHistory.slice(-ultimos);
        return recentes.some(h => (h.groups || []).includes(exercise.grupo_principal));
    }

    function calcularScore(ex, nivel, foco, lacunas) {
        let score = 0;
        const niveis = ['Iniciante','Intermediário','Avançado','Elite'];
        const idxEx = niveis.indexOf(ex.nivel);
        const idxAtleta = niveis.indexOf(nivel);
        if (idxEx === idxAtleta) score += 3;
        else if (Math.abs(idxEx - idxAtleta) === 1) score += 1;
        else score -= 5;
        if (lacunas && lacunas.includes(ex.grupo_principal)) score += 5;
        if (!foiFeitoRecentemente(ex, 2)) score += 2;
        else score -= 10;
        if (foco === 'Full Body' && ex.grupos_secundarios && ex.grupos_secundarios.length >= 3) score += 2;
        if (foco === 'Flexibilidade') {
            if (ex.tipo === 'Alongamento' || ex.tipo === 'Yoga') score += 4;
        } else if (foco !== 'Full Body') {
            if (ex.grupo_principal === foco) score += 4;
            else if (ex.grupos_secundarios && ex.grupos_secundarios.includes(foco)) score += 2;
        }
        return score;
    }

    function getAquecimento() {
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

    function generateIATraining(lacunas = null) {
        const level = document.getElementById('iaLevel').value;
        const focus = document.getElementById('iaFocus').value;
        const num = parseInt(document.getElementById('iaNumExercises').value) || 5;
        
        let pool = exerciseDB.filter(e => {
            const order = ['Iniciante','Intermediário','Avançado','Elite'];
            return order.indexOf(e.nivel) <= order.indexOf(level);
        });
        
        if (focus === 'Flexibilidade') {
            pool = pool.filter(e => e.tipo === 'Alongamento' || e.tipo === 'Yoga');
        } else if (focus !== 'Full Body') {
            pool = pool.filter(e => e.grupo_principal === focus || e.tipo === focus || (e.grupos_secundarios || []).includes(focus));
        }
        if (!pool.length) pool = exerciseDB.filter(e => e.nivel === level || e.nivel === 'Iniciante');
        
        pool.forEach(ex => { ex.score = calcularScore(ex, level, focus, lacunas); });
        pool.sort((a,b) => b.score - a.score);
        
        let selecionados = [];
        for (let ex of pool) {
            if (selecionados.length >= num) break;
            const countNoGrupo = selecionados.filter(s => s.grupo_principal === ex.grupo_principal).length;
            if (countNoGrupo < 2) selecionados.push(ex);
        }
        
        const aquecimento = getAquecimento();
        const resfriamento = getResfriamento([...new Set(selecionados.map(e => e.grupo_principal))]);
        iaGeneratedWorkout = [...aquecimento, ...selecionados, ...resfriamento].map(ex => ({
            ...ex,
            series: ex.tipo === 'Aquecimento' || ex.tipo === 'Resfriamento' ? 1 : 3
        }));
        
        document.getElementById('iaResult').innerHTML = iaGeneratedWorkout.map((e,i) => `
            <div class="exercise-item">
                <div class="ex-info">
                    <div class="ex-name">${i+1}. ${e.nome}${e.tipo==='Aquecimento'?' 🔥':''}${e.tipo==='Resfriamento'?' ❄️':''}</div>
                    <div class="ex-meta">${e.grupo_principal} • ${e.xp} XP • ${e.series || 3} séries</div>
                </div>
            </div>
        `).join('') + `<p class="mt-2"><strong>XP Total:</strong> ${iaGeneratedWorkout.reduce((s,e)=>s+e.xp,0)} XP</p>`;
        document.getElementById('iaResultCard').style.display = 'block';
        showToast('✨ Treino automático gerado com aquecimento e resfriamento!', 'success');
    }

    function useIATraining() {
        if (!iaGeneratedWorkout.length) return showToast('⚠️ Gere um treino primeiro.','error');
        currentWorkout = [...iaGeneratedWorkout];
        document.getElementById('workoutName').value = 'Treino Automático';
        renderChosenExercises();
        navigateTo('build', document.querySelector('[data-page=build]'));
    }

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

    // ============ TREINO ATIVO ============
    function loadActiveWorkout() {
        const idx = parseInt(document.getElementById('activeWorkoutSelect').value);
        if (isNaN(idx) || !savedWorkouts[idx]) {
            document.getElementById('activeWorkoutDisplay').innerHTML = '<p style="color:var(--text2);">Selecione um treino.</p>';
            document.getElementById('completeExerciseBtn').disabled = true;
            activeWorkoutIndex = -1;
            return;
        }
        activeWorkoutIndex = idx;
        currentExerciseIndex = 0;
        renderActiveWorkout();
        document.getElementById('completeExerciseBtn').disabled = false;
    }

    function renderActiveWorkout() {
        if (activeWorkoutIndex < 0) return;
        const w = savedWorkouts[activeWorkoutIndex];
        document.getElementById('activeWorkoutDisplay').innerHTML = w.exercises.map((e,i) => `
            <div class="exercise-item" style="cursor:default;${i===currentExerciseIndex?'border:2px solid var(--primary-light);background:var(--primary-dark);':''}">
                <div class="ex-info"><div class="ex-name">${i+1}. ${e.nome} (${e.series || 3}x)</div><div class="ex-meta">${e.xp} XP</div></div>
                ${i<currentExerciseIndex?'<span style="color:var(--success);">✅</span>':''}
            </div>`).join('');

        if (currentExerciseIndex < w.exercises.length) {
            const currentEx = w.exercises[currentExerciseIndex];
            document.getElementById('timerSeconds').value = currentEx.duracao || 45;
            resetTimer();
            document.getElementById('currentExerciseHighlight').style.display = 'block';
            document.getElementById('currentExerciseHighlight').innerHTML = `<strong>🏋️ Executando:</strong> ${currentEx.nome} (${currentEx.xp} XP)`;
        } else {
            document.getElementById('currentExerciseHighlight').style.display = 'none';
            document.getElementById('completeExerciseBtn').disabled = true;
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
        if (activeWorkoutIndex < 0) return;
        const w = savedWorkouts[activeWorkoutIndex];
        if (currentExerciseIndex < w.exercises.length) {
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
        document.getElementById('timerDisplay').textContent = 
            String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }

    function startTimer() {
        if (timerRunning) return;
        timerStartedAt = Date.now();
        if (timerMode === 'regressivo') {
            if (timerRemaining <= 0) timerRemaining = parseInt(document.getElementById('timerSeconds').value) || 60;
            timerTargetValue = timerRemaining;
            timerInterval = setInterval(regressiveTick, 200);
        } else {
            timerTargetValue = timerRemaining;
            timerInterval = setInterval(progressiveTick, 200);
        }
        timerRunning = true;
        document.getElementById('timerStartBtn').disabled = true;
        document.getElementById('timerStartBtn').textContent = '⏳ Rodando...';
    }

    function regressiveTick() {
        const now = Date.now();
        const elapsed = (now - timerStartedAt) / 1000;
        timerRemaining = Math.max(0, timerTargetValue - elapsed);
        updateTimerDisplay();
        if (timerRemaining <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById('timerStartBtn').disabled = false;
            document.getElementById('timerStartBtn').textContent = '▶️ Iniciar';
            showToast('⏰ Tempo esgotado!', 'info');
            playAlarm();
        }
    }

    function progressiveTick() {
        const now = Date.now();
        const elapsed = (now - timerStartedAt) / 1000;
        timerRemaining = timerTargetValue + elapsed;
        updateTimerDisplay();
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        document.getElementById('timerStartBtn').disabled = false;
        document.getElementById('timerStartBtn').textContent = '▶️ Iniciar';
    }

    function resetTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        if (timerMode === 'regressivo') {
            timerRemaining = parseInt(document.getElementById('timerSeconds').value) || 60;
        } else {
            timerRemaining = 0;
        }
        updateTimerDisplay();
        document.getElementById('timerStartBtn').disabled = false;
        document.getElementById('timerStartBtn').textContent = '▶️ Iniciar';
    }

    function toggleTimerMode() {
        if (timerMode === 'regressivo') {
            timerMode = 'progressivo';
            document.getElementById('timerModeToggle').textContent = '⬆️ Progressivo';
            document.getElementById('timerSeconds').style.display = 'none';
        } else {
            timerMode = 'regressivo';
            document.getElementById('timerModeToggle').textContent = '⬇️ Regressivo';
            document.getElementById('timerSeconds').style.display = 'inline-block';
        }
        resetTimer();
    }

    function updateStopwatchDisplay() {
        const h = Math.floor(stopwatchSeconds / 3600);
        const m = Math.floor((stopwatchSeconds % 3600) / 60);
        const s = stopwatchSeconds % 60;
        const display = document.getElementById('stopwatchDisplay');
        if (display) {
            display.textContent = 
                (h > 0 ? String(h).padStart(2,'0') + ':' : '') +
                String(m).padStart(2,'0') + ':' +
                String(s).padStart(2,'0');
        }
    }

    function startStopwatch() {
        if (stopwatchRunning) return;
        stopwatchStartedAt = Date.now();
        stopwatchRunning = true;
        document.getElementById('stopwatchStartBtn').disabled = true;
        document.getElementById('stopwatchStartBtn').textContent = '⏳ Rodando...';
        stopwatchInterval = setInterval(() => {
            const elapsed = (Date.now() - stopwatchStartedAt) / 1000;
            stopwatchSeconds = Math.floor(elapsed);
            updateStopwatchDisplay();
        }, 200);
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
        musicPaused = false;
        playMusicAtIndex(0);
    }

    function playMusicAtIndex(index) {
        if (musicPlaylist.length === 0) return;
        currentMusicIndex = (index + musicPlaylist.length) % musicPlaylist.length;
        const url = musicPlaylist[currentMusicIndex];
        const container = document.getElementById('musicPlayerContainer');
        container.innerHTML = '';

        if (musicPaused) {
            showPausedPlaceholder(container);
            return;
        }

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

    function prevMusic() {
        if (musicPlaylist.length === 0) return;
        playMusicAtIndex(currentMusicIndex - 1);
    }

    function nextMusic() {
        if (musicPlaylist.length === 0) return;
        playMusicAtIndex(currentMusicIndex + 1);
    }

    function toggleMusicPause() {
        musicPaused = !musicPaused;
        if (musicPaused) {
            const container = document.getElementById('musicPlayerContainer');
            showPausedPlaceholder(container);
            updateMusicControls();
        } else {
            playMusicAtIndex(currentMusicIndex);
        }
    }

    function showPausedPlaceholder(container) {
        container.innerHTML = `
            <div style="text-align:center; padding:30px; background:var(--surface2); border-radius:var(--radius-sm);">
                <p style="color:var(--text2); font-size:1.2rem;">⏸️ Música pausada</p>
                <p style="color:var(--text2); font-size:0.8rem;">${musicPlaylist.length} faixa(s) na playlist</p>
            </div>
        `;
    }

    function updateMusicControls() {
        const container = document.getElementById('musicPlayerContainer');
        if (!container || musicPlaylist.length === 0) return;
        const oldControls = container.querySelector('.music-controls');
        if (oldControls) oldControls.remove();

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'music-controls';
        controlsDiv.style.cssText = 'display:flex; gap:8px; justify-content:center; margin-top:12px;';
        controlsDiv.innerHTML = `
            <button class="btn btn-sm btn-outline" onclick="prevMusic()">⏮️</button>
            <button class="btn btn-sm btn-outline" onclick="toggleMusicPause()">${musicPaused ? '▶️' : '⏸️'}</button>
            <button class="btn btn-sm btn-outline" onclick="nextMusic()">⏭️</button>
            <span style="color:var(--text2); align-self:center; font-size:0.8rem;">${currentMusicIndex+1}/${musicPlaylist.length}</span>
        `;
        container.appendChild(controlsDiv);
    }

    function showFallback(url, container) {
        container.innerHTML = `<div style="text-align:center; padding:20px; background:var(--surface2); border-radius:var(--radius-sm);"><p style="color:var(--text2);">Não foi possível incorporar este link.</p><a href="${url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:8px;">▶️ Ouvir no site original</a></div>`;
    }

    // ============ ANÁLISE DO TREINO ============
    function analisarWorkout(workout) {
        if (!workout.length) return null;
        const aquecimento = workout.filter(ex => ex.tipo === 'Aquecimento').length;
        const resfriamento = workout.filter(ex => ex.tipo === 'Resfriamento').length;
        const numExercicios = workout.length;
        const grupos = workout.map(ex => ex.grupo_principal);
        const repeticoes = grupos.reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {});
        const maxRep = Math.max(...Object.values(repeticoes), 0);
        const historicoRecente = workoutHistory.slice(-2).flatMap(h => h.exercises?.map(e => e.nome) || []);
        const nivelAtleta = getUserLevel();
        const scoresNivel = workout.map(ex => {
            const idx = ['Iniciante','Intermediário','Avançado','Elite'].indexOf(ex.nivel);
            const idxAtleta = ['Iniciante','Intermediário','Avançado','Elite'].indexOf(nivelAtleta);
            const diff = idxAtleta - idx;
            if (diff === 0) return 3;
            else if (diff === 1) return 2;
            else if (diff >= 2) return 1;
            else if (diff === -1) return 1;
            else return 0;
        });
        const mediaNivel = scoresNivel.reduce((a,b)=>a+b,0) / scoresNivel.length;
        const scoreAquecimento = Math.min(15, aquecimento >= 2 ? 15 : aquecimento * 7);
        const scoreResfriamento = Math.min(10, resfriamento >= 1 ? 10 : 0);
        const scoreNivel = Math.round((mediaNivel / 3) * 20);
        let scoreEquilibrio = 25;
        if (maxRep > 3) scoreEquilibrio = 0;
        else if (maxRep === 3) scoreEquilibrio = 10;
        else if (maxRep === 2) scoreEquilibrio = 20;
        const repetidosRecentes = workout.filter(ex => historicoRecente.includes(ex.nome)).length;
        const scoreVariedade = Math.max(0, 15 - repetidosRecentes * 5);
        let scoreVolume = 15;
        if (numExercicios < 3) scoreVolume = 5;
        else if (numExercicios < 4) scoreVolume = 10;
        else if (numExercicios > 10) scoreVolume = 5;
        const total = Math.min(100, scoreAquecimento + scoreResfriamento + scoreNivel + scoreEquilibrio + scoreVariedade + scoreVolume);
        const feedback = [];
        if (aquecimento < 2) feedback.push('🔥 Adicione mais aquecimento (2-3 exercícios).');
        if (resfriamento < 1) feedback.push('❄️ Inclua um alongamento no final.');
        if (maxRep > 3) feedback.push('⚖️ Muitos exercícios do mesmo grupo.');
        if (repetidosRecentes > 0) feedback.push('🔄 Alguns exercícios foram feitos recentemente.');
        if (numExercicios < 3) feedback.push('📉 Volume muito baixo.');
        if (total >= 80) feedback.push('💪 Treino excelente!');
        return { total, feedback };
    }

    function atualizarAnalise() {
        const card = document.getElementById('workoutAnalysisCard');
        if (!card) return;
        if (!currentWorkout.length) {
            card.style.display = 'none';
            return;
        }
        card.style.display = 'block';
        const analise = analisarWorkout(currentWorkout);
        if (!analise) return;
        const canvas = document.getElementById('gaugeCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height;
            ctx.clearRect(0,0,w,h);
            ctx.beginPath();
            ctx.arc(60,60,50,0.75*Math.PI, 2.25*Math.PI);
            ctx.strokeStyle = 'var(--surface2)';
            ctx.lineWidth = 12;
            ctx.stroke();
            const angulo = (analise.total / 100) * 1.5 * Math.PI + 0.75*Math.PI;
            const cor = analise.total >= 80 ? 'var(--success)' : analise.total >= 50 ? 'var(--gold)' : 'var(--danger)';
            ctx.beginPath();
            ctx.arc(60,60,50,0.75*Math.PI, angulo);
            ctx.strokeStyle = cor;
            ctx.stroke();
        }
        document.getElementById('gaugeScore').textContent = analise.total;
        document.getElementById('gaugeScore').style.color = analise.total >= 80 ? 'var(--success)' : analise.total >= 50 ? 'var(--gold)' : 'var(--danger)';
        const fbDiv = document.getElementById('analysisFeedback');
        fbDiv.innerHTML = analise.feedback.map(msg => `<div style="font-size:0.9rem; color:var(--text2); margin-bottom:4px;">${msg}</div>`).join('');
    }

    // ============ CARROSSEL ============
    let carrosselIndex = 0;
    let carrosselTimer = null;
    const totalSlides = 4;
    function slideAtual(index) { carrosselIndex = index; atualizarCarrossel(); resetarAutoPlay(); }
    function mudarSlide(direcao) { carrosselIndex = (carrosselIndex + direcao + totalSlides) % totalSlides; atualizarCarrossel(); resetarAutoPlay(); }
    function atualizarCarrossel() {
        const slidesContainer = document.querySelector('.carrossel-slides');
        if (slidesContainer) slidesContainer.style.transform = `translateX(-${carrosselIndex * 100}%)`;
        document.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === carrosselIndex));
    }
    function autoPlay() { carrosselTimer = setInterval(() => { carrosselIndex = (carrosselIndex + 1) % totalSlides; atualizarCarrossel(); }, 5000); }
    function resetarAutoPlay() { clearInterval(carrosselTimer); autoPlay(); }
    autoPlay();

    // ============ NAVEGAÇÃO ============
    function navigateTo(page, btn) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        const p = document.getElementById('page-' + page);
        if (p) p.classList.add('active');
        if (btn) btn.classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
        if (page === 'build') { renderExerciseLibrary(currentFilter, currentSearch); renderChosenExercises(); renderSavedWorkouts(); }
        if (page === 'workout') { updateActiveWorkoutSelect(); loadActiveWorkout(); }
        if (page === 'progress') { updateXPDisplay(); renderHistory(); }
        if (page === 'home') { updateXPDisplay(); updateUpcomingWorkouts(); }
    }
    function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

    function resetAllProgress() {
        if (confirm('⚠️ Apagar TODO progresso?')) {
            localStorage.clear();
            userXP = 0; totalExercisesDone = 0; trainingDays = []; workoutHistory = []; savedWorkouts = []; currentWorkout = []; iaGeneratedWorkout = [];
            activeWorkoutIndex = -1; currentExerciseIndex = 0; editingWorkoutIndex = -1;
            stopwatchSeconds = 0; clearInterval(stopwatchInterval); stopwatchRunning = false;
            clearInterval(timerInterval); timerRunning = false; timerRemaining = 60; timerMode = 'regressivo';
            currentSearch = ''; currentFilter = 'all';
            saveAllState();
            updateXPDisplay();
            renderExerciseLibrary('all', '');
            renderChosenExercises();
            renderSavedWorkouts();
            renderHistory();
            updateActiveWorkoutSelect();
            updateUpcomingWorkouts();
            updateTimerDisplay();
            updateStopwatchDisplay();
            document.getElementById('iaResultCard').style.display = 'none';
            const toggleBtn = document.getElementById('timerModeToggle');
            if (toggleBtn) toggleBtn.textContent = '⬇️ Regressivo';
            document.getElementById('timerSeconds').style.display = 'inline-block';
            document.getElementById('exerciseSearch').value = '';
            showToast('🔄 Progresso resetado.', 'info');
        }
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
    window.toggleMusicPause = toggleMusicPause;
    window.analyzeAndGenerate = analyzeAndGenerate;
    window.resetAllProgress = resetAllProgress;
    window.slideAtual = slideAtual;
    window.mudarSlide = mudarSlide;
    window.filterExercises = filterExercises;
    window.increaseSeries = increaseSeries;
    window.decreaseSeries = decreaseSeries;

    // ============ INIT ============
    document.getElementById('filterTags').addEventListener('click', e => {
        if (e.target.classList.contains('filter-tag')) {
            document.querySelectorAll('#filterTags .filter-tag').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderExerciseLibrary(currentFilter, currentSearch);
        }
    });
    document.getElementById('timerSeconds').addEventListener('change', function() {
        if (!timerRunning && timerMode === 'regressivo') { timerRemaining = parseInt(this.value) || 60; updateTimerDisplay(); }
    });
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