export interface CoachPersona {
    id: CoachPersonaType;
    icon: string;
    name: string;
    description: string;
    examples: string[];
    color: string;
}

export type CoachPersonaType = 'cheerleader' | 'mentor' | 'drill-sergeant';
