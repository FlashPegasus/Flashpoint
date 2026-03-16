import { leagueService } from '../features/leagues/leagueService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { useAuthStore } from '../features/auth/authStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

export const runE2ESimulation = async () => {
    const { user: currentUser } = useAuthStore.getState();
    if (!currentUser) {
        toast.error('Você precisa estar logado como Organizador para rodar o E2E.');
        return;
    }

    const testerEmails = [
        'alfa@tester.com',
        'bravo@tester.com',
        'charlie@tester.com',
        'delta@tester.com',
        'echo@tester.com'
    ];

    try {
        const usersMap: Record<string, { id: string, name: string }> = {};
        
        // Adiciona o usuário atual no mapa
        usersMap[currentUser.email || ''] = { id: currentUser.id, name: currentUser.name };

        try {
            toast.loading('Descobrindo outros testers...', { id: 'e2e' });
            for (const email of testerEmails) {
                if (email === currentUser.email) continue;
                const q = query(collection(db, 'users'), where('email', '==', email));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    const data = snap.docs[0].data();
                    usersMap[email] = { id: snap.docs[0].id, name: data.name };
                }
            }
        } catch (e: any) {
            console.warn('Permissão insuficiente para listar usuários. Usando fallbacks para os bots.', e);
        }

        // Mapeia os emails para os bots reais encontrados ou usa fallback
        const bots: {id: string, name: string}[] = [];
        for (const email of testerEmails) {
            if (email === currentUser.email) continue;
            const found = usersMap[email];
            if (found) {
                bots.push(found);
            } else {
                const namePrefix = email.split('@')[0];
                const cleanName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1);
                bots.push({ 
                    id: `bot_${namePrefix}_${Math.random().toString(36).substr(2, 5)}`, 
                    name: `Bot ${cleanName}` 
                });
            }
        }

        // 1. Criar Liga (O organizador é o usuário LOGADO)
        toast.loading(`Criando Liga (Organizador: ${currentUser.name})...`, { id: 'e2e' });
        const league = await leagueService.createLeague({
            name: `E2E League (${currentUser.name}) ${new Date().toLocaleTimeString()}`,
            description: 'Liga gerada para teste de ciclo completo.',
            organizerId: currentUser.id,
            visibility: 'public'
        });

        // 2. Criar 2 Torneios
        toast.loading('Criando Torneios...', { id: 'e2e' });
        const t1 = await tournamentService.createTournament({
            name: `FC T1 (Vencedor: ${bots[0].name})`,
            organizerId: currentUser.id,
            leagueId: league.id,
            format: 'multiplayer',
            status: 'registration',
            minPlayersPerTable: 4,
            maxPlayersPerTable: 4
        });

        const t2 = await tournamentService.createTournament({
            name: `FC T2 (Vencedor: ${bots[1].name})`,
            organizerId: currentUser.id,
            leagueId: league.id,
            format: 'multiplayer',
            status: 'registration',
            minPlayersPerTable: 4,
            maxPlayersPerTable: 4
        });

        // 3. Entrar nos Torneios e Liga
        toast.loading('Bots entrando na Liga e Torneios...', { id: 'e2e' });
        for (const bot of bots) {
            // Silenciamos erros aqui caso alguma regra de permissão de notificação falhe
            try { 
                await leagueService.joinLeague(league.id, bot.id, bot.name);
                await leagueService.approveMember(league.id, bot.id, currentUser.id);
            } catch (e) { console.warn(`Falha ao injetar ${bot.name} na liga (provavelmente notificação)`, e); }
            
            try {
                await tournamentService.addParticipant(t1.id, { playerId: bot.id, name: bot.name });
            } catch (e) { console.warn(`Falha ao injetar ${bot.name} no T1`, e); }

            try {
                await tournamentService.addParticipant(t2.id, { playerId: bot.id, name: bot.name });
            } catch (e) { console.warn(`Falha ao injetar ${bot.name} no T2`, e); }
        }
        
        // O criador também entra
        try { await tournamentService.addParticipant(t1.id, { playerId: currentUser.id, name: currentUser.name }); } catch(e){}
        try { await tournamentService.addParticipant(t2.id, { playerId: currentUser.id, name: currentUser.name }); } catch(e){}

        // 4. Simular T1
        toast.loading(`Simulando T1 (${bots[0].name} vence)...`, { id: 'e2e' });
        for (let i = 0; i < 3; i++) {
            const round = await tournamentService.generateNextRound(t1.id);
            const rNum = round.number;
            const tableId = round.tables[0].id;
            const results = round.tables[0].playerIds.map(pid => ({
                playerId: pid,
                status: pid === bots[0].id ? 'WINNER' : 'ELIMINATED',
                points: pid === bots[0].id ? 5 : 0
            })) as any;
            await tournamentService.recordTableResult(t1.id, rNum, tableId, results);
        }
        await tournamentService.completeTournament(t1.id);

        // 5. Simular T2
        toast.loading(`Simulando T2 (${bots[1].name} vence)...`, { id: 'e2e' });
        for (let i = 0; i < 3; i++) {
            const round = await tournamentService.generateNextRound(t2.id);
            const rNum = round.number;
            const tableId = round.tables[0].id;
            const results = round.tables[0].playerIds.map(pid => ({
                playerId: pid,
                status: pid === bots[1].id ? 'WINNER' : 'ELIMINATED',
                points: pid === bots[1].id ? 5 : 0
            })) as any;
            await tournamentService.recordTableResult(t2.id, rNum, tableId, results);
        }
        await tournamentService.completeTournament(t2.id);

        // 6. Recalcular
        toast.loading('Finalizando ciclo e recalculando ranking...', { id: 'e2e' });
        await leagueService.recalculateStandings(league.id);

        toast.success(`E2E Concluído! Liga: ${league.name}`, { id: 'e2e', duration: 10000 });
        console.log('E2E SIMULATION SUCCESS', { leagueId: league.id, t1: t1.id, t2: t2.id });

    } catch (err: any) {
        console.error('E2E SIMULATION ERROR:', err);
        toast.error('Erro no E2E: ' + err.message, { id: 'e2e' });
    }
};
