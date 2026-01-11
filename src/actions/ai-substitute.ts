"use server"

import { createClient } from "@/lib/supabase/server"
import { Profile } from "@/types"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface SuggestionResult {
    candidates: Profile[]
    reasoning: string
}

export async function suggestSubstitutes(scheduleId: string, ministryId: string): Promise<SuggestionResult> {
    const supabase = await createClient()

    // 1. Get schedule details
    const { data: schedule } = await supabase.from('schedules').select('*').eq('id', scheduleId).single()
    if (!schedule) throw new Error("Escala não encontrada")

    // 2. Find volunteers in the same ministry
    const { data: allVolunteers } = await supabase
        .from('profiles')
        .select('*')
        .contains('ministry_ids', [ministryId])
        .eq('role', 'volunteer')

    if (!allVolunteers || allVolunteers.length === 0) {
        return { candidates: [], reasoning: "Nenhum voluntário encontrado neste ministério." }
    }

    // 3. Check availability for that date
    // Note: 'date' in DB is YYYY-MM-DD string roughly.
    const { data: availabilities } = await supabase
        .from('availability')
        .select('*')
        .eq('date', schedule.date)

    // 4. Check existing assignments
    const { data: existingAssignments } = await supabase
        .from('assignments')
        .select('profile_id')
        .eq('schedule_id', scheduleId)

    const assignedIds = new Set(existingAssignments?.map(a => a.profile_id))

    // Filter candidates
    const candidates = allVolunteers.filter(vol => {
        if (assignedIds.has(vol.id)) return false

        const av = availabilities?.find(a => a.profile_id === vol.id)
        // If explicitly unavailable, skip. If available or uninformed, keep.
        if (av && av.status === 'unavailable') return false

        return true
    })

    // 5. AI Ranking
    let reasoning = "Sugestões baseadas na disponibilidade e ministério (padrão)."
    let rankedCandidates = candidates.slice(0, 3)

    const apiKey = process.env.GOOGLE_AI_API_KEY // key fix
    if (apiKey && candidates.length > 0) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-pro" })

            const prompt = `
            Atue como um coordenador de voluntários de igreja.
            Tarefa: Sugerir os 3 melhores substitutos para uma escala.
            
            Contexto:
            - Data da Escala: ${schedule.date}
            - Ministério ID: ${ministryId}
            
            Lista de Candidatos Disponíveis (JSON):
            ${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, ministries: c.ministry_ids })))}
            
            Critérios:
            - Priorize quem serve neste ministério.
            - Considere rotação (num cenário real).
            
            SAÍDA ESPERADA:
            Apenas um JSON Array de strings com os IDs dos escolhidos, ex: ["uuid-1", "uuid-2"].
            `

            const result = await model.generateContent(prompt)
            const response = result.response
            const text = response.text()

            // Robust JSON extraction
            const match = text.match(/\[[\s\S]*\]/)
            if (match) {
                const ids = JSON.parse(match[0])
                const aiRanked = candidates.filter(c => ids.includes(c.id))
                const others = candidates.filter(c => !ids.includes(c.id))
                rankedCandidates = [...aiRanked, ...others].slice(0, 3)
                reasoning = "Sugestões analisadas e ranqueadas pela IA Gemini."
            }
        } catch (e) {
            console.error("AI Error:", e)
            reasoning += " (Falha na conexão com AI, exibindo ordem padrão)"
        }
    }

    return {
        candidates: rankedCandidates,
        reasoning
    }
}
