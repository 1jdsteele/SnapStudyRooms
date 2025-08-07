import * as React from "react";
import { supabase } from "../utils/hooks/supabase";
import { parse } from "@babel/core";

export function TimerFormat({studyTime})
{
    const separate = studyTime.split(":");
    if (separate.length == 2)
    {
        return [0, parseInt(separate[0]), parseInt(separate[1])];
    }
    else
    {
        return [parseInt(separate[0]), parseInt(separate[1]), parseInt(separate[2])];
    }
}