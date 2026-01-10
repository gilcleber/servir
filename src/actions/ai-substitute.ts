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
    // Need to filter profiles where ministry_ids contains ministryId. 
    // Supabase array column: ministry_ids @> {id}
    const { data: allVolunteers } = await supabase
        .from('profiles')
        .select('*')
        .contains('ministry_ids', [ministryId])
        .eq('role', 'volunteer')

    if (!allVolunteers || allVolunteers.length === 0) {
        return { candidates: [], reasoning: "Nenhum voluntário encontrado neste ministério." }
    }

    // 3. Check availability for that date
    const { data: availabilities } = await supabase
        .from('availability')
        .select('*')
        .eq('date', schedule.date) // Assuming text match YYYY-MM-DD

    // 4. Check who is ALREADY assigned to this schedule (to exclude)
    const { data: existingAssignments } = await supabase
        .from('assignments')
        .select('profile_id')
        .eq('schedule_id', scheduleId)

    const assignedIds = new Set(existingAssignments?.map(a => a.profile_id))

    // Filter candidates
    const candidates = allVolunteers.filter(vol => {
        if (assignedIds.has(vol.id)) return false // Already assigned

        const av = availabilities?.find(a => a.profile_id === vol.id)
        if (av && av.status === 'unavailable') return false // marked unavailable

        return true // Include available or uninformed
    })

    // 5. AI Ranking/Reasoning
    let reasoning = "Sugestões baseadas na disponibilidade e ministério."
    let rankedCandidates = candidates.slice(0, 3) // Default top 3

    const apiKey = process.env.GOOGLE_AI_KEY
    if (apiKey && candidates.length > 0) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-pro" })

            const prompt = `
            Eu preciso de um substituto para uma escala de igreja.
            Data: ${schedule.date}. Ministério ID: ${ministryId}.
            
            Candidatos disponíveis:
            ${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, ministries: c.ministry_ids })))}
            
            Analise e retorne os top 3 candidatos ideais. 
            Retorne APENAS um JSON array com os IDs dos 3 melhores, exemplo: ["id1", "id2"].
          `
            // Note: In real app, we would include "Last served date" to make AI smarter.

            const result = await model.generateContent(prompt)
            const response = result.response
            const text = response.text()

            // Try to parse JSON
            // This is fragile in MVP without strict JSON mode, but let's try regex extraction
            const match = text.match(/\[[\s\S]*\]/)
            if (match) {
                const ids = JSON.parse(match[0])
                // Reorder candidates based on AI
                const aiRanked = candidates.filter(c => ids.includes(c.id))
                const others = candidates.filter(c => !ids.includes(c.id))
                rankedCandidates = [...aiRanked, ...others].slice(0, 3)
                reasoning = "Sugestões otimizadas por IA com base no perfil."
            }
        } catch (e) {
            console.error("AI Error:", e)
            // Fallback to default order
        }
    }

    return {
        candidates: rankedCandidates,
        reasoning
    }
}
