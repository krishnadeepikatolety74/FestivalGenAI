# UtsavMitra - Flask Backend

A Python Flask backend for the UtsavMitra festival planning application. This application serves the React frontend and provides API endpoints for authentication, festival plan generation using Groq AI, and data management.

## Features

- **Authentication**: Sign up and sign in functionality
- **Festival Plan Generation**: AI-powered festival planning using Groq API
- **Plan Management**: Store and retrieve festival plans
- **Database**: SQLite (development) or MySQL (production)
- **React Frontend**: Integrated React UI served by Flask
- **REST API**: Complete REST API for all operations

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `GROQ_API_KEY`: Your Groq API key (get from https://console.groq.com/)
- `DATABASE_URL`: Database connection (leave empty for SQLite)
- Other optional settings

Example `.env`:
```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=
FLASK_ENV=development
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-secret-key
```

### 3. Run the Application

```bash
python app.py
```

The application will:
- Initialize the database automatically
- Serve the React frontend at `http://localhost:5000`
- Provide API endpoints at `http://localhost:5000/api/*`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name"
  }
  ```

- `POST /api/auth/login` - Sign in to existing account
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `GET /api/auth/me` - Get current user info

- `POST /api/auth/logout` - Sign out

### Festival Plans

- `POST /api/plans/generate` - Generate a festival plan
  ```json
  {
    "festival": "Diwali",
    "city": "Mumbai",
    "familySize": 4,
    "budget": 50000,
    "language": "English",
    "preferences": ["traditional", "budget-friendly"]
  }
  ```

- `GET /api/plans/latest` - Get latest plan for authenticated user

### System

- `GET /api/system/health` - Health check

## Database

### SQLite (Default - Development)

No configuration needed. Database file `festival_db.db` is created automatically.

### MySQL (Production)

Set `DATABASE_URL` in `.env`:
```
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/festival_db
```

Create database first:
```sql
CREATE DATABASE festival_db;
```

## Frontend

The React frontend is built and served by Flask in production. The frontend includes:
- Festival plan generator interface
- User authentication UI
- Plan management and viewing
- Shopping list and budget management
- Timeline and ritual planning

## Development

### Running Tests

```bash
python test_session.py
python test_api.py
```

### Building Frontend

The frontend is already built and included. To rebuild:
```bash
npm install --legacy-peer-deps
npm run build
```

## Production Deployment

For production, use Gunicorn:

```bash
export NODE_ENV=production
export FLASK_ENV=production
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///festival_db.db` | Database connection string |
| `GROQ_API_KEY` | (required) | Groq API key for AI features |
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `FLASK_ENV` | `development` | Flask environment |
| `SESSION_SECRET` | `dev-secret-change-in-production` | Session encryption key |

## File Structure

```
app.py                 # Main Flask application
requirements.txt       # Python dependencies
.env                   # Environment configuration
.env.example          # Example environment template
dist/public/          # Built React frontend
  - index.html
  - assets/
    - index-*.js
    - index-*.css
festival_db.db        # SQLite database (created on first run)
test_api.py          # API test suite
test_session.py      # Session test suite
```

## Troubleshooting

### Database Connection Error
- Ensure `DATABASE_URL` is correct
- For MySQL, verify the database server is running
- For SQLite, check write permissions in the project directory

### Groq API Errors
- Verify `GROQ_API_KEY` is set correctly
- Check your Groq API account status and rate limits
- Ensure you have sufficient API credits

### Frontend Not Loading
- Verify `dist/public/index.html` exists
- Check that the React build was completed successfully
- Clear browser cache and try again

### Port Already in Use
- Change `PORT` in `.env`
- Or find and kill the process using the current port

## Support

For issues or questions, refer to:
- Groq API Documentation: https://console.groq.com/docs
- Flask Documentation: https://flask.palletsprojects.com/
- SQLAlchemy Documentation: https://docs.sqlalchemy.org/

## License

MIT License
