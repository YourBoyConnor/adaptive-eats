export interface RecipeResponse {
  original_recipe: string;
  adapted_recipe: string;
  dietary_restrictions: string[];
  allergies: string[];
  substitutions_made: string[];
  nutrition_facts: string[];
}

export interface DietaryOption {
  id: string;
  label: string;
  selected: boolean;
}

export interface Allergy {
  id: string;
  name: string;
}
