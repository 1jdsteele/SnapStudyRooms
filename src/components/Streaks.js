import { supabase } from '../utils/hooks/supabase'

export async function fetchStreakInfo(roomId) 
{
    const { data, error } = await supabase
        .from("track_streaks")
        //Fetch the time and current streak info
        .select('updated, current_streak')
        //Filter by user_id
        .eq('user_id', roomId)
        .single()

        console.log("Fetched streak data:", data);
        console.log("Supabase error:", error);

    if (error) 
    {
        throw error
    }
    return data
}

