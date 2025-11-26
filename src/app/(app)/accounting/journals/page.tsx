
import { JournalsClient } from "./client-page";
import { supabase } from "@/lib/supabase-client"

export default async function JournalsPage() {
    const { data, error } = await supabase
        .from('journal_entries')
        .select(`
            id,
            date,
            description,
            reference_id,
            reference_type,
            journal_entry_items (
                id,
                type,
                amount,
                chart_of_accounts (
                    name,
                    code
                )
            )
        `)
        .order('date', { ascending: false })
        .limit(50);

    if (error) {
        console.error("Error fetching journal entries:", error);
    }
    
    const entries = data || [];

    return <JournalsClient entries={entries} />;
}
