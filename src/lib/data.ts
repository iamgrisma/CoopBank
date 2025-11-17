
"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getProvinces() {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('id');
    
    if (error) {
        console.error("Error fetching provinces:", error.message);
        return [];
    }
    return data || [];
}

export async function getDistricts(provinceId?: number) {
    const supabase = createSupabaseServerClient();
    let query = supabase
        .from('districts')
        .select('*')
        .order('name');

    if (provinceId) {
        query = query.eq('province_id', provinceId);
    }
    
    const { data, error } = await query;
    
    if (error) {
        console.error("Error fetching districts:", error.message);
        return [];
    }
    return data || [];
}

export async function getLocalLevels(districtId?: number) {
    const supabase = createSupabaseServerClient();
    let query = supabase
        .from('local_levels')
        .select('*')
        .order('name');
    
    if (districtId) {
        query = query.eq('district_id', districtId);
    }

    const { data, error } = await query;
    
    if (error) {
        console.error("Error fetching local levels:", error.message);
        return [];
    }
    return data || [];
}
