"""
FestivalGen AI - Flask Backend
Main application entry point
"""

import os
import json
import secrets
import logging
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Optional, List, Tuple

from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from dotenv import load_dotenv

LANGUAGE_INSTRUCTIONS = {
    'English': 'Write all user-facing content in English using Latin script.',
    'Hindi': 'Write all user-facing content in Hindi using Devanagari script. Do not use Tamil, Telugu, Malayalam, or Bengali script.',
    'Telugu': 'Write all user-facing content in Telugu using Telugu script (Unicode U+0C00-U+0C7F). Do not use Tamil, Malayalam, Kannada, Hindi, or Bengali script. Do not mix scripts. English is allowed only for the fixed category enum values required by the schema.',
    'Tamil': 'Write all user-facing content in Tamil using Tamil script (Unicode U+0B80-U+0BFF). Do not use Telugu, Malayalam, Kannada, Hindi, or Bengali script. Do not mix scripts. English is allowed only for the fixed category enum values required by the schema.',
    'Bengali': 'Write all user-facing content in Bengali using Bengali script. Do not use Tamil, Telugu, Malayalam, Kannada, or Hindi script.',
}

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, static_folder='dist/public', static_url_path='')
app.config['JSON_SORT_KEYS'] = False

# Configure session
app.secret_key = os.getenv('SESSION_SECRET', 'dev-secret-change-in-production')
app.config['SESSION_COOKIE_SECURE'] = os.getenv('NODE_ENV', 'development') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=365)

# Configure database
# Support both SQLite (default) and MySQL
database_url = os.getenv('DATABASE_URL')
if not database_url:
    # Use SQLite by default for development
    database_url = 'sqlite:///festival_db.db'
elif not database_url.startswith('sqlite://') and not database_url.startswith('mysql'):
    # If invalid, use SQLite
    database_url = 'sqlite:///festival_db.db'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

logger.info(f'Using database: {database_url}')

# Initialize database
db = SQLAlchemy(app)

# Configure CORS
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://localhost:5173'])

# ======================
# Database Models
# ======================

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    open_id = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.Text)
    email = db.Column(db.String(320))
    login_method = db.Column(db.String(64))
    password_hash = db.Column(db.String(255))  # For simple auth
    role = db.Column(db.String(64), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_signed_in = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    festival_plans = db.relationship('FestivalPlan', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'openId': self.open_id,
            'name': self.name,
            'email': self.email,
            'loginMethod': self.login_method,
            'role': self.role,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'lastSignedIn': self.last_signed_in.isoformat(),
        }


class FestivalPlan(db.Model):
    """Festival plan model"""
    __tablename__ = 'festival_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    festival = db.Column(db.String(120), nullable=False)
    city = db.Column(db.String(160), nullable=False)
    family_size = db.Column(db.Integer, nullable=False)
    budget = db.Column(db.Integer, nullable=False)
    language = db.Column(db.String(64), nullable=False)
    preferences = db.Column(db.Text)  # JSON string
    plan_json = db.Column(db.Text, nullable=False)  # JSON string
    image_url = db.Column(db.Text)  # Dynamic festival image reference
    image_key = db.Column(db.String(320))  # Festival and location identity for the image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'festival': self.festival,
            'city': self.city,
            'familySize': self.family_size,
            'budget': self.budget,
            'language': self.language,
            'preferences': json.loads(self.preferences) if self.preferences else [],
            'planJson': json.loads(self.plan_json),
            'imageUrl': self.image_url,
            'imageKey': self.image_key,
            'createdAt': self.created_at.isoformat(),
        }


# ======================
# Authentication Helpers
# ======================

def create_session_token(user_id: int, user: User) -> str:
    """Create a session for the user"""
    session.permanent = True
    session['user_id'] = user_id
    session['open_id'] = user.open_id
    session['name'] = user.name
    return secrets.token_urlsafe(32)


def get_current_user() -> Optional[User]:
    """Get the current authenticated user from session"""
    user_id = session.get('user_id')
    if not user_id:
        return None
    return User.query.get(user_id)


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function


def upsert_user(open_id: str, name: Optional[str] = None, email: Optional[str] = None,
                login_method: Optional[str] = None) -> User:
    """Create or update a user"""
    user = User.query.filter_by(open_id=open_id).first()
    
    if user:
        # Update existing user
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        if login_method is not None:
            user.login_method = login_method
        user.last_signed_in = datetime.utcnow()
    else:
        # Create new user
        user = User(
            open_id=open_id,
            name=name,
            email=email,
            login_method=login_method,
            role='user'
        )
        db.session.add(user)
    
    db.session.commit()
    return user


# ======================
# Groq Integration
# ======================

class GroqAPI:
    """Groq API integration for festival plan generation"""
    
    def __init__(self):
        self.api_key = os.getenv('GROQ_API_KEY')
        self.base_url = 'https://api.groq.com/openai/v1'
        if not self.api_key:
            raise ValueError('GROQ_API_KEY environment variable not set')
    
    @staticmethod
    def get_plan_schema() -> Dict[str, Any]:
        """Get the JSON schema for festival plan"""
        return {
            "name": "festival_plan",
            "strict": True,
            "schema": {
                "type": "object",
                "additionalProperties": False,
                "required": ["summary", "specialItems", "decorations", "shoppingList", "budget", "recipes", "rituals", "invitations", "timeline"],
                "properties": {
                    "summary": {"type": "string"},
                    "specialItems": {"type": "array", "items": {"type": "string"}},
                    "decorations": {"type": "array", "items": {"type": "string"}},
                    "shoppingList": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "required": ["item", "category", "quantity", "estimatedPrice"],
                            "properties": {
                                "item": {"type": "string"},
                                "category": {"type": "string"},
                                "quantity": {"type": "string"},
                                "estimatedPrice": {"type": "number"}
                            }
                        }
                    },
                    "budget": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "required": ["category", "amount", "percentage"],
                            "properties": {
                                "category": {"type": "string", "enum": ["Food", "Shopping", "Decorations", "Puja", "Other"]},
                                "amount": {"type": "number"},
                                "percentage": {"type": "number"}
                            }
                        }
                    },
                    "recipes": {
                        "minItems": 5,
                        "maxItems": 5,
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "required": ["name", "category", "cookTime", "ingredients", "steps", "servings", "description", "tips", "rating"],
                            "properties": {
                                "name": {"type": "string"},
                                "category": {"type": "string"},
                                "cookTime": {"type": "string"},
                                "ingredients": {"type": "array", "items": {"type": "string"}},
                                "steps": {"type": "array", "items": {"type": "string"}},
                                "servings": {"type": "number"},
                                "description": {"type": "string"},
                                "tips": {"type": "array", "minItems": 1, "items": {"type": "string"}},
                                "rating": {"type": "number"}
                            }
                        }
                    },
                    "rituals": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "required": ["stepNumber", "title", "materials", "procedure", "purpose", "duration", "mantra"],
                            "properties": {
                                "stepNumber": {"type": "number"},
                                "title": {"type": "string"},
                                "materials": {"type": "array", "items": {"type": "string"}},
                                "procedure": {"type": "array", "minItems": 2, "maxItems": 5, "items": {"type": "string"}},
                                "purpose": {"type": "string"},
                                "duration": {"type": "string"},
                                "mantra": {"type": ["string", "null"]}
                            }
                        }
                    },
                    "invitations": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "required": ["type", "title", "content"],
                            "properties": {
                                "type": {"type": "string"},
                                "title": {"type": "string"},
                                "content": {"type": "string"}
                            }
                        }
                    },
                    "timeline": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "additionalProperties": False,
                            "required": ["dayDate", "title", "description", "status"],
                            "properties": {
                                "dayDate": {"type": "string"},
                                "title": {"type": "string"},
                                "description": {"type": "string"},
                                "status": {"type": "string", "enum": ["Completed", "In Progress", "Upcoming"]}
                            }
                        }
                    }
                }
            }
        }

    @staticmethod
    def get_festival_focus(festival: str) -> str:
        focus = {
            'Diwali': 'Lakshmi-Ganesha puja, diyas, rangoli, lanterns, gifts, chakli and laddoo',
            'Holi': 'Holika Dahan, natural colors, water play, gujiya, thandai and dahi vada',
            'Pongal': 'Surya worship, Pongal pot, sugarcane, kolam, Sakkarai Pongal, Mattu Pongal and Kaanum Pongal',
            'Krishna Janmashtami': 'midnight Krishna birth puja, Krishna idol, makhan, flute, jhula and Dahi Handi',
            'Ganesh Chaturthi': 'Ganesha sthapana, durva grass, modak, flowers, mandap and visarjan',
            'Onam': 'Pookalam, Onam Sadya, banana leaves, Vallam Kali and traditional Kerala customs',
            'Navratri': 'kalash sthapana, garba, dandiya, vrat foods and devotional decorations',
            'Durga Puja': 'Durga worship, dhak, flowers, pandal traditions, sindoor khela and bhog',
            'Dussehra': 'Ram Lila, Shami leaves, Ayudha Puja and the victory of good over evil',
            'Eid-ul-Fitr': 'Eid prayer, dates, biryani, sheer khurma, new clothes and sharing with community',
            'Eid-al-Adha': 'Eid prayer, sacrifice traditions handled respectfully, biryani, dates and community sharing',
            'Makar Sankranti': 'Surya worship, til-gul, kites and regional harvest customs',
            'Lohri': 'bonfire, rewri, gajak, peanuts, bhangra and Punjabi harvest customs',
            'Ugadi': 'Ugadi pachadi, neem and mango leaves, oil bath, panchanga reading and Telugu-Kannada New Year customs',
            'Gudi Padwa': 'gudi flag, neem and jaggery, rangoli, shrikhand-puri and Marathi New Year customs',
            'Jagannath Rath Yatra': 'Jagannath chariot devotion, mahaprasad, chariot decorations and Odisha traditions',
            'Guru Nanak Jayanti': 'Gurdwara visit, kirtan, langar, Prabhat Pheri and Sikh traditions',
            'Christmas': 'Christmas tree, crib, carols, fruit cake, midnight mass and community sharing',
        }
        return focus.get(festival, f'Use practices, foods, items, decorations and timings genuinely specific to {festival}; do not substitute Diwali content.')
    
    def generate_festival_plan(self, festival: str, city: str, family_size: int,
                              budget: int, language: str, preferences: List[str]) -> Dict[str, Any]:
        """Generate a festival plan using Groq API"""
        
        plan_schema = self.get_plan_schema()
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'openai/gpt-oss-120b',
            'temperature': 0.35,
            'max_tokens': 4500,
            'response_format': {
                'type': 'json_schema',
                'json_schema': plan_schema
            },
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are FestivalGen AI, an expert Indian festival planner. Return only valid JSON matching the provided schema. Every field must be specific to the requested festival and regional customs. Generate a genuine step-by-step ritual procedure: each step must explain what to do, how to do it, what materials are needed, and what comes next. Prioritize 2-5 unique physical actions per step over devotional text. Do not repeat the same mantra, slokam, prayer, or sentence across steps. Include a mantra only when specifically relevant; otherwise return mantra as null. Make recommendations practical, culturally respectful, family-friendly, and specific to the requested city, budget, family size, language, region, and festival. Follow the requested language instruction exactly and never mix writing systems.'
                },
                {
                    'role': 'user',
                    'content': json.dumps({
                        'task': 'Create a complete festival plan',
                        'festival': festival,
                        'festivalFocus': self.get_festival_focus(festival),
                        'outputRequirements': 'Return exactly five different recipes appropriate to the requested festival: exactly two with category Main Course, one Dessert, one Sweet, and one Drink. Use only those exact category values. Every recipe must include name, category, preparation time, ingredients, complete preparation steps, servings, description, three recipe-specific tips, and rating. Never include recipe images, image paths, image URLs, or image fields. Also return festival-specific specialItems, decorations, shoppingList, rituals, and timeline. Each ritual must include materials, 2-5 unique actionable procedure instructions, a purpose, duration, and mantra null unless genuinely required at that exact step. Never repeat a mantra or procedure between ritual steps. For the budget categories, use exactly these category values: Food, Shopping, Decorations, Puja, Other. Apply the requested language instruction to every user-facing string, including recipe names, shopping item names, quantities, ritual titles, materials, procedures, purpose, mantras, invitation content, and timeline text. Do not translate or alter the fixed enum category values.',
                        'city': city,
                        'familySize': family_size,
                        'budget': budget,
                        'language': language,
                        'languageInstruction': LANGUAGE_INSTRUCTIONS.get(language, f'Write all user-facing content in {language}. Use one consistent script and do not mix languages.'),
                        'preferences': ', '.join(preferences)
                    })
                }
            ]
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers=headers,
                json=payload,
                timeout=90
            )
            response.raise_for_status()
            
            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content')
            
            if not content:
                raise ValueError('No content returned from Groq API')
            
            # Clean content from code fences if present
            cleaned_content = content.strip()
            if cleaned_content.startswith('```'):
                newline_idx = cleaned_content.find('\n')
                if newline_idx != -1:
                    cleaned_content = cleaned_content[newline_idx:].strip()
                if cleaned_content.endswith('```'):
                    cleaned_content = cleaned_content[:-3].strip()
            
            plan = json.loads(cleaned_content)
            
            # Normalize recipe categories for robustness
            recipes = plan.get('recipes')
            if isinstance(recipes, list):
                for recipe in recipes:
                    if not isinstance(recipe, dict):
                        continue
                    cat = recipe.get('category')
                    if isinstance(cat, str):
                        cat_clean = cat.strip().lower()
                        if 'main' in cat_clean:
                            recipe['category'] = 'Main Course'
                        elif 'dessert' in cat_clean:
                            recipe['category'] = 'Dessert'
                        elif 'sweet' in cat_clean:
                            recipe['category'] = 'Sweet'
                        elif 'drink' in cat_clean or 'beverage' in cat_clean:
                            recipe['category'] = 'Drink'

            rituals = plan.get('rituals')
            if isinstance(rituals, list):
                seen_mantras = set()
                for ritual in rituals:
                    if not isinstance(ritual, dict):
                        continue
                    mantra = ritual.get('mantra')
                    key = mantra.strip().casefold() if isinstance(mantra, str) else ''
                    if not key or key in seen_mantras:
                        ritual['mantra'] = None
                    else:
                        seen_mantras.add(key)
                            
            return plan
        
        except Exception as e:
            logger.error(f'Groq API error: {str(e)}')
            raise


groq_api = GroqAPI() if os.getenv('GROQ_API_KEY') else None


def construct_festival_image_prompt(festival: str, city: str = '') -> str:
    """Dynamically construct a high-quality image prompt for the selected festival."""
    fest_lower = festival.lower().strip()
    
    cultural_elements = ""
    if 'diwali' in fest_lower or 'deepavali' in fest_lower:
        cultural_elements = "traditional clay diyas lit with warm flames, beautiful colorful rangoli patterns on the floor, floral garlands of marigold, hanging decorative lamps, and warm glowing festive lights"
    elif 'holi' in fest_lower:
        cultural_elements = "vibrant splash of organic colors, colored powder (gulal) in brass bowls, traditional water guns (pichkaris), and joyful festive atmosphere"
    elif 'durga puja' in fest_lower:
        cultural_elements = "a beautifully sculpted clay idol of Goddess Durga with elegant decorations, traditional dhak drums, dhunuchi incense burner, marigold garlands, and red-white traditional theme"
    elif 'ganesh' in fest_lower or 'vinayaka' in fest_lower or 'chaturthi' in fest_lower or 'chavithi' in fest_lower:
        cultural_elements = "an elegant Lord Ganesha idol decorated with fresh marigold flowers, traditional brass oil lamps, a plate of sweet modaks, subtle colorful rangoli, and warm traditional home decorations"
    elif 'onam' in fest_lower:
        cultural_elements = "a colorful floral rangoli (Pookalam) on a traditional Kerala home wooden veranda, lit brass lamps (Nilavilakku), fresh banana leaves, and a serene backwater background with traditional snake boats"
    elif 'navratri' in fest_lower:
        cultural_elements = "colorful dandiya sticks, a decorated earthen pot (garbo) with a candle lit inside, traditional Gujarati decorations, and warm festive illumination"
    elif 'dussehra' in fest_lower or 'dasara' in fest_lower:
        cultural_elements = "victory celebration details, traditional weapons puja, marigold flower garlands, and warm twilight festive lighting"
    elif 'shivaratri' in fest_lower or 'shivratri' in fest_lower:
        cultural_elements = "a sacred Shivalinga shrine decorated with white flowers and bilva leaves, trishul, rudraksha beads, and traditional oil lamps in a serene spiritual atmosphere"
    elif 'janmashtami' in fest_lower or 'krishna' in fest_lower:
        cultural_elements = "a small decorated cradle (jhula) with baby Krishna, colorful peacock feathers, a small earthen pot overflowing with butter (dahi handi), a traditional flute, and flower garlands"
    elif 'milad' in fest_lower or 'mawlid' in fest_lower or 'nabi' in fest_lower:
        cultural_elements = "an elegant Islamic cultural celebration with green, gold and white decorative lighting, tasteful crescent and star motifs, refined Islamic geometric patterns, hanging lanterns, and a peaceful community gathering; no diyas, rangoli, Hindu deities, marigold-heavy decor, or Diwali puja setup"
    elif 'eid' in fest_lower:
        cultural_elements = "a decorative crescent moon and star motif, traditional hanging lanterns (fanoos), a platter of sweet dates and sheer khurma, and warm elegant lighting"
    elif 'raksha bandhan' in fest_lower or 'rakhi' in fest_lower:
        cultural_elements = "a decorative puja thali with colorful rakhis (sacred threads), traditional Indian sweets, rice grains, and vermilion powder in a warm festive home setting"
    elif 'mahavir jayanti' in fest_lower:
        cultural_elements = "a peaceful Lord Mahavira idol in a serene temple sanctum, decorated with white lotus flowers and lit lamps"
    elif 'kumbh mela' in fest_lower:
        cultural_elements = "a spiritual river bank ghat at sunset, traditional floating leaf lamps (diyas) in water, sadhus (sages), and mist rising from the sacred river Ganges"
    elif 'rath yatra' in fest_lower:
        cultural_elements = "the grand wooden chariot of Lord Jagannath decorated with colorful fabrics and flower garlands in a festive procession setting"
    elif 'pushkar' in fest_lower:
        cultural_elements = "a decorated camel in the Rajasthan desert dunes at sunset, colorful traditional tents, and distant warm festive lights"
    elif 'sankranti' in fest_lower:
        cultural_elements = "colorful kites flying high in a clear blue sky, bowls of til-gul sweets (sesame and jaggery), and ears of green harvest grain"
    elif 'pongal' in fest_lower:
        cultural_elements = "a traditional clay pot boiling over with Pongal rice, stalks of fresh sugarcane, colorful kolam patterns on the ground, and harvest decorations"
    elif 'lohri' in fest_lower:
        cultural_elements = "a glowing winter bonfire at night, traditional Punjabi sweets like rewri, gajak, and peanuts on a brass plate"
    elif 'ugadi' in fest_lower or 'gudi padwa' in fest_lower:
        cultural_elements = "a traditional gudi flag (silk cloth, neem leaves, mango leaves, copper pot), a bowl of Ugadi Pachadi, mango leaf garlands, and colorful rangoli"
    elif 'baisakhi' in fest_lower:
        cultural_elements = "a vibrant Punjabi dhol drum decorated with tassels, golden wheat stalks, and festive harvest flags"
    elif 'bihu' in fest_lower:
        cultural_elements = "a traditional Assamese Pepa horn instrument, Bihu dhol drums, fresh kopou orchids, and green tea leaf backgrounds"
    elif 'hornbill' in fest_lower:
        cultural_elements = "traditional Naga tribal headgear with hornbill feathers, decorative spears, tribal bonfire, and vibrant indigenous festival ground details"
    elif 'christmas' in fest_lower:
        cultural_elements = "a beautifully decorated Christmas tree with warm fairy lights, a traditional nativity crib, red poinsettia flowers, and a cozy fireplace background"
    else:
        cultural_elements = f"traditional decorations, warm festive lighting, traditional sweets, and clean premium composition for {festival}"

    # Build the dynamic premium prompt
    prompt = (
        f"Create a premium realistic festival celebration image for Festival: {festival}. "
        f"Location: {city or 'India'}. Use only cultural elements genuinely associated with {festival} "
        f"and its regional context. Do not include Diwali-specific elements unless the selected festival is Diwali. "
        f"featuring {cultural_elements}, tasteful decorations, subtle lighting, "
        f"pastel pink, lavender, cream and soft golden color palette, clean premium composition, "
        f"realistic photography style, no text, no watermark, no logos."
    )
    return prompt


def get_fallback_festival_image(festival: str) -> str:
    """Return a static asset path for the selected festival if image generation fails."""
    fest = festival.lower().strip()
    
    if 'jagannath' in fest or 'ratha yatra' in fest or 'rath yatra' in fest:
        return '/assets/jagannath_ratha_yatra.png'
    elif 'janmashtami' in fest or 'krishna' in fest:
        return '/assets/krishna_janmashtami.png'
    elif 'maha shivaratri' in fest or 'maha shivratri' in fest or 'shivaratri' in fest or 'shivratri' in fest:
        return '/assets/maha_shivaratri.png'
    elif 'raksha bandhan' in fest or 'rakhi' in fest:
        return '/assets/bhai_dooj.png'
    elif 'milad' in fest or 'mawlid' in fest or 'nabi' in fest:
        return '/assets/festival-eid.jpg'
    elif 'eid' in fest:
        return '/assets/eid.png'
    elif 'karwa chauth' in fest or 'karwachauth' in fest:
        return '/assets/karwa_chauth.png'
    elif 'diwali' in fest or 'deepavali' in fest:
        return '/assets/diwali.png'
    elif 'govardhan' in fest:
        return '/assets/govardhan_puja.png'
    elif 'pongal' in fest:
        return '/assets/pongal.png'
    elif 'holi' in fest:
        return '/assets/festival-holi.jpg'
    elif 'durga puja' in fest or 'durgapuja' in fest or 'navratri' in fest:
        return '/assets/festival-durga-puja.jpg'
    elif 'ganesh' in fest or 'vinayaka' in fest or 'chavithi' in fest or 'chaturthi' in fest:
        return '/assets/festival-ganesh-chaturthi.jpg'
    elif 'dussehra' in fest or 'dasara' in fest:
        return '/assets/festival-dussehra.jpg'
    elif 'onam' in fest:
        return '/assets/festival-onam.jpg'
    elif 'christmas' in fest:
        return '/assets/festival-christmas.jpg'
    elif 'sankranti' in fest or 'ugadi' in fest or 'gudi' in fest or 'padwa' in fest or 'baisakhi' in fest or 'bihu' in fest:
        return '/assets/festival-sankranti.jpg'
    else:
        return '/assets/festivalgen-hero.png'


# ── Nearby Festival Stores (Nominatim-powered) ──────────────────────────────
STORE_SEARCH_QUERIES = {
    'Puja': ['puja store', 'religious shop', 'pooja samagri'],
    'Food': ['sweet shop', 'bakery', 'grocery store', 'namkeen shop'],
    'Decorations': ['florist', 'flower shop', 'decoration shop'],
    'Shopping': ['gift shop', 'clothing store', 'jewelry shop', 'saree shop'],
    'Other': ['supermarket', 'general store', 'department store'],
}

STORE_CATEGORY_VALUES = {
    'Puja': {'religious', 'craft', 'gift'},
    'Food': {'supermarket', 'convenience', 'grocery', 'bakery', 'confectionery', 'deli', 'beverages', 'butcher', 'greengrocer'},
    'Decorations': {'florist', 'garden_centre', 'houseware', 'furniture'},
    'Shopping': {'gift', 'clothes', 'jewelry', 'shoes', 'bag', 'department_store', 'books', 'mall'},
    'Other': {'general', 'kiosk', 'variety_store', 'marketplace'},
}
RELEVANT_SHOP_VALUES = set().union(*STORE_CATEGORY_VALUES.values())

import math

CITY_CENTERS = {
    'hyderabad': (17.385044, 78.486671),
    'hyderabad, telangana': (17.385044, 78.486671),
    'bengaluru': (12.971599, 77.594566),
    'bangalore': (12.971599, 77.594566),
    'mumbai': (19.076090, 72.877426),
    'delhi': (28.613939, 77.209023),
    'new delhi': (28.613939, 77.209023),
    'chennai': (13.082680, 80.270718),
    'kolkata': (22.572645, 88.363892),
    'pune': (18.520430, 73.856743),
}

def haversine_km(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lng points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@app.route('/api/nearby-stores', methods=['GET'])
def nearby_stores():
    """Search for real nearby stores using Nominatim (OpenStreetMap)."""
    city = request.args.get('city', 'Hyderabad')
    category = request.args.get('category', 'All')
    festival = request.args.get('festival', '')

    headers = {'User-Agent': 'FestivalGenAI/1.0 (festival planning app)'}

    # 1. Geocode the city
    try:
        geo_url = f'https://nominatim.openstreetmap.org/search?format=json&q={requests.utils.quote(city)}&limit=1'
        geo_resp = requests.get(geo_url, headers=headers, timeout=8)
        geo_resp.raise_for_status()
        geo_data = geo_resp.json()
        if not geo_data:
            raise ValueError('City not found')
        center_lat = float(geo_data[0]['lat'])
        center_lng = float(geo_data[0]['lon'])
    except Exception as e:
        logger.error(f'Geocoding error: {e}')
        fallback = None
        try:
            photon_geo = requests.get(
                f'https://photon.komoot.io/api/?q={requests.utils.quote(city)}&limit=1',
                headers=headers,
                timeout=8,
            ).json()
            coordinates = photon_geo.get('features', [{}])[0].get('geometry', {}).get('coordinates', [])
            if len(coordinates) == 2:
                fallback = (float(coordinates[1]), float(coordinates[0]))
        except Exception as photon_error:
            logger.warning('Photon geocoding fallback failed: %s', photon_error)
        fallback = fallback or CITY_CENTERS.get(city.strip().casefold())
        if not fallback:
            return jsonify({'stores': [], 'error': f'Could not locate "{city}". Try a nearby major city.'}), 200
        center_lat, center_lng = fallback

    # 2. Query real OSM businesses around the geocoded city center.
    radius = 15000
    overpass_query = f'''[out:json][timeout:25];
    (
      nwr[shop](around:{radius},{center_lat},{center_lng});
      nwr[amenity~"^(marketplace|restaurant|cafe|fast_food)$"](around:{radius},{center_lat},{center_lng});
    );
    out center tags;'''
    try:
        overpass_resp = requests.post(
            'https://overpass-api.de/api/interpreter',
            data=overpass_query,
            headers={**headers, 'Content-Type': 'text/plain'},
            timeout=30,
        )
        overpass_resp.raise_for_status()
        elements = overpass_resp.json().get('elements', [])
    except Exception as e:
        logger.exception('Overpass nearby-store search failed: %s', e)
        return jsonify({'stores': [], 'center': {'lat': center_lat, 'lng': center_lng}, 'error': 'Unable to load nearby stores. Please try again.'}), 502

    all_results = []
    seen_places = set()
    seen_names = set()
    for item in elements:
        tags = item.get('tags', {})
        name = str(tags.get('name', '')).strip()
        place_id = f"{item.get('type', 'osm')}-{item.get('id', '')}"
        shop_type = str(tags.get('shop', '')).casefold()
        amenity_type = str(tags.get('amenity', '')).casefold()
        if not name or not place_id or (not shop_type and amenity_type != 'marketplace'):
            continue
        if shop_type and shop_type not in RELEVANT_SHOP_VALUES:
            continue

        center = item.get('center', {})
        lat = item.get('lat', center.get('lat'))
        lng = item.get('lon', center.get('lon'))
        try:
            lat, lng = float(lat), float(lng)
        except (TypeError, ValueError):
            continue
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            continue
        dist = haversine_km(center_lat, center_lng, lat, lng)
        if dist > 15:
            continue

        if amenity_type in {'restaurant', 'cafe', 'fast_food'}:
            store_category = 'Food'
        elif amenity_type == 'marketplace':
            store_category = 'Other'
        else:
            store_category = next((key for key, values in STORE_CATEGORY_VALUES.items() if shop_type in values), 'Other')
        if category != 'All' and store_category != category:
            continue
        normalized_name = ' '.join(name.casefold().split())
        if place_id in seen_places or normalized_name in seen_names:
            continue
        seen_places.add(place_id)
        seen_names.add(normalized_name)
        address_parts = [tags.get(key) for key in ('addr:housenumber', 'addr:street', 'addr:suburb', 'addr:city') if tags.get(key)]
        all_results.append({
            'id': f'osm-{place_id}',
            'name': name,
            'category': store_category,
            'specialty': shop_type.replace('_', ' ').title() if shop_type else 'Market',
            'rating': None,
            'reviews': None,
            'address': ', '.join(address_parts) or city,
            'distance_km': round(dist, 1),
            'distance_text': f'{round(dist, 1)} km' if dist >= 1 else f'{int(dist * 1000)} m',
            'lat': lat,
            'lng': lng,
            'phone': tags.get('phone', '—'),
        })

    # Sort by distance
    all_results.sort(key=lambda x: x['distance_km'])

    return jsonify({
        'stores': all_results[:25],
        'center': {'lat': center_lat, 'lng': center_lng},
        'city': city,
    })


def generate_gemini_image(prompt: str) -> Dict[str, str]:
    """Generate an image with Gemini and return it as a browser-safe data URL."""
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError('GEMINI_API_KEY environment variable not set')

    model = os.getenv('GEMINI_IMAGE_MODEL', 'gemini-2.0-flash-exp')
    # Map gemini-2.0-flash-exp (which is 404/not supported) to gemini-2.5-flash-image
    if model == 'gemini-2.0-flash-exp':
        model = 'gemini-2.5-flash-image'

    response = requests.post(
        f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
        params={'key': api_key},
        headers={'Content-Type': 'application/json'},
        json={
            'contents': [{'parts': [{'text': prompt}]}],
            'generationConfig': {'responseModalities': ['IMAGE']}
        },
        timeout=60
    )
    response.raise_for_status()
    result = response.json()
    for candidate in result.get('candidates', []):
        for part in candidate.get('content', {}).get('parts', []):
            inline_data = part.get('inlineData')
            if inline_data and inline_data.get('data'):
                mime_type = inline_data.get('mimeType', 'image/png')
                return {'mimeType': mime_type, 'dataUrl': f"data:{mime_type};base64,{inline_data['data']}"}
    raise ValueError('Gemini returned no image data')



# ======================
# API Routes
# ======================

# Auth Routes
@app.route('/api/auth/me', methods=['GET'])
def get_current_user_route():
    """Get current user info"""
    user = get_current_user()
    if user:
        return jsonify(user.to_dict())
    return jsonify(None)


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Simple login endpoint"""
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user.last_signed_in = datetime.utcnow()
    db.session.commit()
    
    create_session_token(user.id, user)
    return jsonify(user.to_dict())


@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Simple signup endpoint"""
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    # Create new user
    user = User(
        open_id=email,  # Use email as open_id for simple auth
        email=email,
        name=name or email.split('@')[0],
        password_hash=generate_password_hash(password),
        login_method='email',
        role='user'
    )
    
    db.session.add(user)
    db.session.commit()
    
    create_session_token(user.id, user)
    return jsonify(user.to_dict()), 201


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout endpoint"""
    session.clear()
    return jsonify({'success': True})


# Plans Routes
@app.route('/api/plans/generate', methods=['POST'])
def generate_plan():
    """Generate a festival plan"""
    data = request.get_json(silent=True) or {}
    
    # Validate input
    festival = data.get('festival')
    city = data.get('city')
    family_size = data.get('familySize')
    budget = data.get('budget')
    language = data.get('language')
    preferences = data.get('preferences', [])
    
    errors = []
    if not festival or len(festival) < 2 or len(festival) > 120:
        errors.append('Festival must be 2-120 characters')
    if not city or len(city) < 2 or len(city) > 160:
        errors.append('City must be 2-160 characters')
    if not isinstance(family_size, int) or family_size < 1 or family_size > 50:
        errors.append('Family size must be 1-50')
    if not isinstance(budget, int) or budget < 1 or budget > 10_000_000:
        errors.append('Budget must be 1-10,000,000')
    if not language or len(language) < 2 or len(language) > 64:
        errors.append('Language must be 2-64 characters')
    if not isinstance(preferences, list) or len(preferences) > 20:
        errors.append('Preferences must be array of max 20 items')
    
    if errors:
        return jsonify({'success': False, 'error': 'Validation failed', 'details': errors}), 400
    
    if not groq_api:
        return jsonify({'success': False, 'error': 'Unable to generate festival plan: Groq API is not configured'}), 500
    
    try:
        # Generate plan using Groq
        plan = groq_api.generate_festival_plan(
            festival, city, family_size, budget, language, preferences
        )
        recipes = plan.get('recipes')
        category_counts = {}
        if isinstance(recipes, list):
            for recipe in recipes:
                category = recipe.get('category') if isinstance(recipe, dict) else None
                category_counts[category] = category_counts.get(category, 0) + 1
        if not isinstance(recipes, list) or len(recipes) != 5 or category_counts.get('Main Course') != 2 or category_counts.get('Dessert') != 1 or category_counts.get('Sweet') != 1 or category_counts.get('Drink') != 1:
            raise ValueError('Groq returned a plan without the required recipe structure')
        
        # Get current user (optional)
        user = get_current_user()
        user_id = user.id if user else None
        
        # Try to generate the image dynamically
        image_url = None
        try:
            image_prompt = construct_festival_image_prompt(festival, city)
            image_data = generate_gemini_image(image_prompt)
            image_url = image_data.get('dataUrl')
            logger.info(f"Successfully generated image with Gemini for festival plan: {festival}")
        except Exception as e:
            logger.error(f"Failed to generate Gemini image for festival plan {festival}: {e}")
            image_url = get_fallback_festival_image(festival)

        # Save to database
        festival_plan = FestivalPlan(
            user_id=user_id,
            festival=festival,
            city=city,
            family_size=family_size,
            budget=budget,
            language=language,
            preferences=json.dumps(preferences),
            plan_json=json.dumps(plan),
            image_url=image_url,
            image_key=f'{festival.strip().casefold()}|{city.strip().casefold()}'
        )
        
        db.session.add(festival_plan)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'id': festival_plan.id,
            'input': {
                'festival': festival,
                'city': city,
                'familySize': family_size,
                'budget': budget,
                'language': language,
                'preferences': preferences
            },
            'plan': plan
        })
    
    except Exception as e:
        logger.error(f'Plan generation error: {str(e)}')
        return jsonify({'success': False, 'error': 'Unable to generate festival plan', 'details': str(e)}), 500


@app.route('/api/images/generate', methods=['POST'])
def generate_image():
    """Generate a festival image through Gemini without exposing the API key."""
    data = request.get_json(silent=True) or {}
    prompt = data.get('prompt')
    if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 4000:
        return jsonify({'success': False, 'error': 'Prompt must be between 1 and 4000 characters'}), 400

    try:
        image = generate_gemini_image(prompt.strip())
        return jsonify({'success': True, **image})
    except requests.RequestException as error:
        logger.error(f'Gemini image generation error: {error}')
        return jsonify({'success': False, 'error': 'Gemini image generation failed'}), 502
    except Exception as error:
        logger.error(f'Image generation error: {error}')
        return jsonify({'success': False, 'error': str(error)}), 500


@app.route('/api/plans/latest', methods=['GET'])
@require_auth
def get_latest_plan():
    """Get latest festival plan for authenticated user"""
    user = get_current_user()
    
    plan = FestivalPlan.query.filter_by(user_id=user.id).order_by(
        FestivalPlan.created_at.desc()
    ).first()
    
    if not plan:
        return jsonify(None)
        
    # If the plan exists but image_url is missing (legacy plan), generate it dynamically and save it!
    expected_image_key = f'{plan.festival.strip().casefold()}|{plan.city.strip().casefold()}'
    if not plan.image_url or plan.image_key != expected_image_key:
        try:
            image_prompt = construct_festival_image_prompt(plan.festival, plan.city)
            image_data = generate_gemini_image(image_prompt)
            plan.image_url = image_data.get('dataUrl')
            plan.image_key = expected_image_key
            db.session.commit()
            logger.info(f"Dynamically generated missing image for legacy plan: {plan.festival}")
        except Exception as e:
            logger.error(f"Failed to dynamically generate image on load for {plan.festival}: {e}")
            plan.image_url = get_fallback_festival_image(plan.festival)
            plan.image_key = expected_image_key
            db.session.commit()
    
    return jsonify(plan.to_dict())


@app.route('/api/trpc/plans.latest', methods=['GET'])
def get_latest_plan_trpc():
    """tRPC endpoint for getting latest plan"""
    user = get_current_user()
    if not user:
        return jsonify([{'result': {'data': {'json': None}}}])
        
    plan = FestivalPlan.query.filter_by(user_id=user.id).order_by(
        FestivalPlan.created_at.desc()
    ).first()
    
    if not plan:
        return jsonify([{'result': {'data': {'json': None}}}])
        
    # If the plan exists but image_url is missing (legacy plan), generate it dynamically and save it!
    expected_image_key = f'{plan.festival.strip().casefold()}|{plan.city.strip().casefold()}'
    if not plan.image_url or plan.image_key != expected_image_key:
        try:
            image_prompt = construct_festival_image_prompt(plan.festival, plan.city)
            image_data = generate_gemini_image(image_prompt)
            plan.image_url = image_data.get('dataUrl')
            plan.image_key = expected_image_key
            db.session.commit()
            logger.info(f"Dynamically generated missing image for legacy plan: {plan.festival}")
        except Exception as e:
            logger.error(f"Failed to dynamically generate image on load for {plan.festival}: {e}")
            plan.image_url = get_fallback_festival_image(plan.festival)
            plan.image_key = expected_image_key
            db.session.commit()
            
    return jsonify([{'result': {'data': {'json': plan.to_dict()}}}])


# System Routes (health check, etc.)
@app.route('/api/system/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat()
    })


# ======================
# Frontend Serving
# ======================

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve the frontend"""
    # If path is empty or doesn't have a file extension, serve index.html
    if not path or '.' not in path:
        return send_from_directory(app.static_folder, 'index.html')
    
    # Try to serve the static file
    try:
        return send_from_directory(app.static_folder, path)
    except:
        # If file not found, serve index.html for client-side routing
        return send_from_directory(app.static_folder, 'index.html')


# ======================
# Error Handlers
# ======================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'error': 'API endpoint not found'}), 404
    # Serve index.html for SPA routing
    try:
        return send_from_directory(app.static_folder, 'index.html')
    except:
        return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f'Internal server error: {str(error)}')
    return jsonify({'error': 'Internal server error'}), 500


# ======================
# Database Initialization
# ======================

def init_db():
    """Initialize the database"""
    with app.app_context():
        try:
            db.create_all()
            # Try to add image_url column if it doesn't exist (e.g. for existing DB)
            try:
                db.session.execute(db.text("ALTER TABLE festival_plans ADD COLUMN image_url TEXT"))
                db.session.commit()
                logger.info('Added image_url column to festival_plans table successfully')
            except Exception:
                db.session.rollback()
            try:
                db.session.execute(db.text("ALTER TABLE festival_plans ADD COLUMN image_key VARCHAR(320)"))
                db.session.commit()
                logger.info('Added image_key column to festival_plans table successfully')
            except Exception:
                db.session.rollback()
            logger.info('Database initialized successfully')
        except Exception as e:
            logger.error(f'Database initialization error: {str(e)}')


# ======================
# Main Entry Point
# ======================

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Get port from environment or use default
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('NODE_ENV', 'development') == 'development'
    
    # Run the app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        use_reloader=debug
    )
