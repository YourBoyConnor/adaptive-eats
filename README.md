# AdaptiveEats 🍽️

AI-powered recipe adaptation for dietary restrictions. Transform any recipe to fit your dietary needs with the power of artificial intelligence.

## Features

- **Smart Recipe Adaptation**: Convert recipes for 9+ dietary restrictions
- **AI-Powered Substitutions**: Intelligent ingredient replacements
- **Camera Integration**: Take photos or upload images for recipe recognition
- **Cross-Platform**: Web app + Mobile app (iOS & Android)
- **Clean Interface**: Modern, Discord-like UI design
- **Real-time Processing**: Get adapted recipes instantly

## Supported Dietary Restrictions

- Vegan
- Vegetarian
- Gluten-free
- Keto
- Paleo
- Dairy-free
- Nut-free
- Low-sodium
- Diabetic-friendly

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up OpenAI API Key**:
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   ```

3. **Run the Application**:
   ```bash
   python main.py
   ```

4. **Open in Browser**:
   Navigate to `http://localhost:8000`

## How to Use

1. Paste your recipe in the text area
2. Select your dietary restriction from the dropdown
3. Click "Adapt Recipe"
4. Get your personalized, adapted recipe!

## Example

**Input Recipe**:
```
Chocolate Chip Cookies
- 2 cups all-purpose flour
- 1 cup butter
- 1 cup brown sugar
- 2 eggs
- 1 cup chocolate chips
```

**Adapted for Vegan**:
```
Vegan Chocolate Chip Cookies
- 2 cups all-purpose flour
- 1 cup coconut oil (instead of butter)
- 1 cup brown sugar
- 2 flax eggs (2 tbsp ground flaxseed + 6 tbsp water)
- 1 cup dairy-free chocolate chips
```

## Technical Details

- **Backend**: FastAPI (Python)
- **AI**: OpenAI GPT-3.5-turbo
- **Frontend**: HTML/CSS/JavaScript
- **Templates**: Jinja2

## Next Steps

This is an MVP version. Future enhancements could include:
- Image recognition for food photos
- Recipe database and storage
- User accounts and saved recipes
- More sophisticated dietary customization
- Mobile app version
