from fastapi import FastAPI, Request
from fastapi import UploadFile, File, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import warnings
import openai
import os
from typing import List, Optional

# Suppress the Pydantic V1 compatibility warning
warnings.filterwarnings("ignore", message="Core Pydantic V1 functionality isn't compatible with Python 3.14 or greater.")

app = FastAPI(title="AdaptiveEats", description="AI-powered recipe adaptation for dietary restrictions")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://adaptive-eats.vercel.app",  # Production frontend URL
        "https://adaptive-eats-frontend.vercel.app",  # Alternative Vercel URL
        "https://adaptive-eats-5ay32vf9l-yourboyconnors-projects.vercel.app",  # Your actual Vercel URL
        "https://*.vercel.app",  # Vercel preview URLs
        "https://adaptive-eats-git-main.vercel.app",  # Vercel branch URLs
        "https://www.adaptive-eats.com",
        "https://adaptive-eats.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly allow OPTIONS
    allow_headers=["*"],  # Allow all headers
)

# Templates
templates = Jinja2Templates(directory="templates")

# Initialize OpenAI (you'll need to set OPENAI_API_KEY environment variable)
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class RecipeRequest(BaseModel):
    recipe_text: str
    dietary_restrictions: List[str] = []
    allergies: List[str] = []

class RecipeResponse(BaseModel):
    original_recipe: str
    adapted_recipe: str
    dietary_restrictions: List[str]
    allergies: List[str]
    substitutions_made: List[str]
    nutrition_facts: List[str] = []

# Dietary restriction options
DIETARY_OPTIONS = [
    "vegan",
    "vegetarian", 
    "gluten-free",
    "keto",
    "paleo",
    "dairy-free",
    "nut-free",
    "low-sodium",
    "diabetic-friendly",
]

ALLERGY_OPTIONS = [
    "peanuts",
    "tree-nuts",
    "shellfish",
    "fish",
    "eggs",
    "milk",
    "soy",
    "wheat",
    "sesame",
    "sulfites",
]

def adapt_recipe_with_ai(recipe_text: str, dietary_restrictions: List[str], allergies: List[str]) -> tuple[str, List[str], List[str]]:
    """
    Use OpenAI to adapt a recipe for a specific dietary restriction
    """
    if not dietary_restrictions and not allergies:
        restriction_text = "with no dietary restrictions or allergies."
    elif dietary_restrictions and allergies:
        restriction_text = f"that is {', '.join(dietary_restrictions)} and avoiding these allergens: {', '.join(allergies)}."
    elif dietary_restrictions:
        restriction_text = f"that is {', '.join(dietary_restrictions)}."
    elif allergies:
        restriction_text = f"avoiding these allergens: {', '.join(allergies)}."
    else:
        restriction_text = "with no dietary restrictions or allergies."

    prompt = f"""
    Adapt the following recipe {restriction_text}
    
    Requirements:
    1. Replace any non-compliant ingredients with suitable alternatives
    2. Adjust cooking instructions if needed
    3. Maintain the same general structure and cooking method
    4. Ensure the adapted recipe is delicious and practical
    
    Original Recipe:
    {recipe_text}
    
    Provide the adapted recipe using these exact sections and formatting:
    ADAPTED_RECIPE:
    Title: <short dish name>
    
    Ingredients:
    - <ingredient 1>
    - <ingredient 2>
    
    Instructions:
    1. <step 1>
    2. <step 2>
    
    Notes (optional):
    - <note>
    
    SUBSTITUTIONS:
    <original> -> <replacement>
    <original> -> <replacement>

    NUTRITION (per serving):
    Calories: <kcal>
    Protein: <g>
    Carbs: <g>
    Fat: <g>
    Fiber: <g>
    Sugar: <g>
    Sodium: <mg>
    Servings: <n>
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
            temperature=0.7
        )
        
        content = response.choices[0].message.content or ""

        # Parse sections by markers
        text = content
        upper_text = text.upper()
        adapted_start = upper_text.find("ADAPTED_RECIPE:")
        subs_start = upper_text.find("SUBSTITUTIONS")
        nutr_start = upper_text.find("NUTRITION")

        if adapted_start != -1:
            # Find the end of the adapted recipe section
            if subs_start != -1 and nutr_start != -1:
                end_idx = min(subs_start, nutr_start)
            elif subs_start != -1:
                end_idx = subs_start
            elif nutr_start != -1:
                end_idx = nutr_start
            else:
                end_idx = len(text)
            adapted_recipe = text[adapted_start + len("ADAPTED_RECIPE:"):end_idx].strip()
        else:
            adapted_recipe = text.strip()

        substitutions: List[str] = []
        if subs_start != -1:
            # Find the end of the substitutions section
            if nutr_start != -1:
                subs_end = nutr_start
            else:
                subs_end = len(text)
            subs_block = text[subs_start:subs_end]
            subs_lines = subs_block.split("\n")
            # Skip the header line
            subs_lines = subs_lines[1:] if subs_lines else []
            substitutions = [l.strip() for l in subs_lines if "->" in l and l.strip()]

        nutrition: List[str] = []
        if nutr_start != -1:
            nutr_text = text[nutr_start:].split("\n", 1)[1] if "\n" in text[nutr_start:] else ""
            nutrition = [line.strip() for line in nutr_text.split("\n") if line.strip() and not line.strip().startswith("SUBSTITUTIONS")]

        # Debug logging
        print(f"DEBUG - Adapted recipe length: {len(adapted_recipe)}")
        print(f"DEBUG - Substitutions count: {len(substitutions)}")
        print(f"DEBUG - Nutrition count: {len(nutrition)}")
        print(f"DEBUG - Adapted recipe preview: {adapted_recipe[:100]}...")
        
        # Return adapted recipe plus parsed lists
        return adapted_recipe, substitutions, nutrition
        
    except Exception as e:
        return f"Error adapting recipe: {str(e)}", [], []


def generate_recipe_from_image_with_ai(image_data_url: str, dietary_restrictions: List[str], allergies: List[str]) -> tuple[str, List[str], List[str]]:
    """
    Use OpenAI Vision to recognize the dish from an image and produce a suitable recipe
    adapted for the specified dietary restriction ('no-restrictions' for general recipe).
    """
    if not dietary_restrictions and not allergies:
        dietary_instruction = (
            "Create a high-quality, practical recipe (ingredients + step-by-step instructions)."
        )
    elif dietary_restrictions and allergies:
        dietary_instruction = (
            f"Create a high-quality, practical recipe (ingredients + step-by-step instructions) that is {', '.join(dietary_restrictions)} and strictly avoids these allergens: {', '.join(allergies)}. "
            "Propose safe substitutions where needed and clearly avoid cross-contamination risks."
        )
    elif dietary_restrictions:
        dietary_instruction = (
            f"Create a high-quality, practical recipe (ingredients + step-by-step instructions) that is {', '.join(dietary_restrictions)}. "
            "If the recognized dish is incompatible, propose a similar dish that fits the restriction."
        )
    elif allergies:
        dietary_instruction = (
            f"Create a high-quality, practical recipe (ingredients + step-by-step instructions) that strictly avoids these allergens: {', '.join(allergies)}. "
            "Propose safe substitutions where needed and clearly avoid cross-contamination risks."
        )
    else:
        dietary_instruction = (
            "Create a high-quality, practical recipe (ingredients + step-by-step instructions)."
        )

    system_text = (
        "You are a culinary expert. Recognize the food in the image, then write a professional-level recipe. "
        "Be concise but complete. Use common household measurements."
    )

    user_text = (
        "Analyze the image to identify the dish and its main ingredients. "
        f"Then: {dietary_instruction}\n\n"
        "IMPORTANT: Infer the canonical, widely-accepted standard recipe for the recognized dish with NO dietary restrictions (the 'baseline').\n"
        "List substitutions by comparing the adapted recipe you produce to that baseline.\n"
        "Substitutions MUST be in the form '<baseline ingredient> -> <adapted ingredient>'.\n"
        "Example: 'Beef tenderloin -> Portobello mushroom' (not 'Portobello -> zucchini').\n\n"
        "Use these exact sections and formatting:\n"
        "ADAPTED_RECIPE:\n"
        "Title: <short dish name>\n\n"
        "Ingredients:\n"
        "- <ingredient 1>\n"
        "- <ingredient 2>\n\n"
        "Instructions:\n"
        "1. <step 1>\n"
        "2. <step 2>\n\n"
        "Notes (optional):\n"
        "- <note>\n\n"
        "SUBSTITUTIONS (vs baseline):\n"
        "<baseline> -> <adapted>\n"
        "<baseline> -> <adapted>\n\n"
        "NUTRITION (per serving):\n"
        "Calories: <kcal>\n"
        "Protein: <g>\n"
        "Carbs: <g>\n"
        "Fat: <g>\n"
        "Fiber: <g>\n"
        "Sugar: <g>\n"
        "Sodium: <mg>\n"
        "Servings: <n>\n"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_text},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_text},
                        {"type": "image_url", "image_url": {"url": image_data_url}},
                    ],
                },
            ],
            max_tokens=1200,
            temperature=0.7,
        )

        content = response.choices[0].message.content or ""

        text = content
        upper_text = text.upper()
        adapted_start = upper_text.find("ADAPTED_RECIPE:")
        subs_start = upper_text.find("SUBSTITUTIONS")
        nutr_start = upper_text.find("NUTRITION")

        if adapted_start != -1:
            # Find the end of the adapted recipe section
            if subs_start != -1 and nutr_start != -1:
                end_idx = min(subs_start, nutr_start)
            elif subs_start != -1:
                end_idx = subs_start
            elif nutr_start != -1:
                end_idx = nutr_start
            else:
                end_idx = len(text)
            adapted_recipe = text[adapted_start + len("ADAPTED_RECIPE:"):end_idx].strip()
        else:
            adapted_recipe = text.strip()

        substitutions: List[str] = []
        if subs_start != -1:
            # Find the end of the substitutions section
            if nutr_start != -1:
                subs_end = nutr_start
            else:
                subs_end = len(text)
            subs_block = text[subs_start:subs_end]
            subs_lines = subs_block.split("\n")
            # Skip the header line
            subs_lines = subs_lines[1:] if subs_lines else []
            substitutions = [l.strip() for l in subs_lines if "->" in l and l.strip()]

        nutrition: List[str] = []
        if nutr_start != -1:
            nutr_text = text[nutr_start:].split("\n", 1)[1] if "\n" in text[nutr_start:] else ""
            nutrition = [line.strip() for line in nutr_text.split("\n") if line.strip() and not line.strip().startswith("SUBSTITUTIONS")]

        # Debug logging
        print(f"DEBUG - Adapted recipe length: {len(adapted_recipe)}")
        print(f"DEBUG - Substitutions count: {len(substitutions)}")
        print(f"DEBUG - Nutrition count: {len(nutrition)}")
        print(f"DEBUG - Adapted recipe preview: {adapted_recipe[:100]}...")
        
        return adapted_recipe, substitutions, nutrition

    except Exception as e:
        return f"Error generating recipe from image: {str(e)}", [], []

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request, 
        "dietary_options": DIETARY_OPTIONS,
        "allergy_options": ALLERGY_OPTIONS
    })

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "AdaptiveEats API is running"}

@app.options("/health")
async def health_check_options():
    return {"message": "OK"}

@app.options("/adapt-recipe")
async def adapt_recipe_options():
    return {"message": "OK"}

@app.post("/adapt-recipe", response_model=RecipeResponse)
async def adapt_recipe(request: RecipeRequest):
    """
    Adapt a recipe for a specific dietary restriction
    """
    if not request.dietary_restrictions and not request.allergies:
        # No adaptation requested; just echo back the original as the adapted
        adapted_recipe, substitutions, nutrition = request.recipe_text, [], []
    else:
        adapted_recipe, substitutions, nutrition = adapt_recipe_with_ai(
            request.recipe_text,
            request.dietary_restrictions,
            request.allergies,
        )
    
    return RecipeResponse(
        original_recipe=request.recipe_text,
        adapted_recipe=adapted_recipe,
        dietary_restrictions=request.dietary_restrictions,
        allergies=request.allergies,
        substitutions_made=substitutions,
        nutrition_facts=nutrition,
    )


@app.options("/adapt-from-image")
async def adapt_from_image_options():
    return {"message": "OK"}

@app.post("/adapt-from-image", response_model=RecipeResponse)
async def adapt_from_image(
    file: UploadFile = File(...),
    dietary_restrictions: List[str] = Form([]),
    allergies: List[str] = Form([]),
):
    """
    Accept an image upload and generate a suitable recipe adapted to the given restriction.
    """
    try:
        content = await file.read()
        mime_type = file.content_type or "image/jpeg"
        import base64

        b64 = base64.b64encode(content).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64}"

        adapted_recipe, substitutions, nutrition = generate_recipe_from_image_with_ai(
            data_url,
            dietary_restrictions,
            allergies,
        )

        return RecipeResponse(
            original_recipe="",
            adapted_recipe=adapted_recipe,
            dietary_restrictions=dietary_restrictions,
            allergies=allergies,
            substitutions_made=substitutions,
            nutrition_facts=nutrition,
        )
    except Exception as e:
        return RecipeResponse(
            original_recipe="",
            adapted_recipe=f"Error processing image: {str(e)}",
            dietary_restrictions=[],
            allergies=[],
            substitutions_made=[],
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
