# Kanban Annotation Board

This is an assessment project. This web app combines kanban-style clinical task management and image annotation. It is built using Django REST Framework, React.js, TypeScript and Tailwind CSS. 

## Environment Requirements

- Python version: 3.14.6
- Django version: 6.0.6
- Django REST Framework version: 3.17.1
- SQLite version: 3.50.4
- Node.js version: 24.18.0
- npm version: 11.16.0
- React version: 19.2.7
- TypeScript version: 6.0.3
- Vite version: 8.1.3
- Simple JWT version: 5.5.1

## Steps To Run This Project

### Backend Setup
1. Navigate to backend folder.
    ```bash
    cd kanban-annotation-board
    ```
2. Create a virtual environment.
    ```bash
    python -m venv venv
    ```
3. Activate the virtual environment.
    **Windows**

    ```bash
    .\venv\Scripts\activate
    ```

    **macOS/Linux**

    ```bash
    source venv/bin/activate
    ```
4. Install the required Python packages.
    ```bash
    pip install -r requirements.txt
    ```
5. Apply database migrations.
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```
6. Start the Django backend server.
    ```bash
    python manage.py runserver
    ```
The backend will run at:
```
http://localhost:8000
```

### Frontend Setup
1. Open a new terminal.
2. Navigate to the frontend folder.
    ```bash
    cd frontend
    ```
3. Install all Node packages.
    ```bash
    npm install
    ```
4. Start the React development server.
    ```bash
    npm run dev
    ```
The frontend will be available at:

    ```
    http://localhost:5173
    ```
### Database
This project uses SQLite as its default database.
No additional database configuration is required. Running the migration commands will automatically create the SQLite database if it does not already exist.

## Features
- User registration and JWT authentication
- Create, update and delete Kanban tasks
- Drag-and-drop task management
- Task filtering by date
- Image upload
- Polygon-based image annotation
- Polygon deletion
- Multiple image support


## The Villains We Faced (Development Challenges & Solutions)

### Villain 1: The Missing JWT Token

Even after logging in successfully, protected API endpoints kept returning 401 Unauthorized errors. The issue was that some Axios requests were not sending the JWT access token in the Authorization header, while others were using an expired token after a page refresh.

We solved it by implementing Zustand with persistence to store the access and refresh tokens, and ensured every protected Axios request included:

Authorization: Bearer <access_token>

This allowed authenticated users to access task management and image annotation APIs consistently without logging in again after refreshing the page.


### Villain 2: The Disappearing Uploaded Images

Image uploads were successfully reaching the backend and were visible inside the media folder, but the frontend only displayed broken image icons because only the relative media path was being returned. React tried to use this as if it were hosted on the frontend server instead of the Django backend.

The backend was configured correctly with MEDIA_URL and MEDIA_ROOT, and urlpatterns += static(...). The frontend was then updated to prepend the backend URL. Once both sides were configured correctly, uploaded images displayed immediately after upload.


### Villain 3: The Polygon That Won't Stay On Image

Saving polygon coordinates using raw pixel values initially seemed correct but polygons became misaligned whenever the image size changed. The annotations no longer matched the original object after resizing the browser.

Instead of storing pixel coordinates, the application stores normalized coordinates between 0 and 1. When rendering, the coordinates are converted back into screen coordinates based on the displayed image size. This ensures annotations remain correctly positioned regardless of screen resolution or image scaling.


### Villain 4: Preventing Accidental Polygon Closure

While drawing polygons, clicking the first vertex could accidentally trigger unwanted events or continue adding extra points, resulting in invalid annotations. 

To solve this, the first vertex becomes interactive only after at least three points have been placed. Clicking it closes and saves the polygon, while event propagation is stopped to prevent duplicate click events. This creates a smoother and more reliable annotation workflow.


### Villain 5: Backend & Frontend Speaking Different Languages

Several APIs appeared to work individually but data was not displayed correctly because the frontend and backend expected different field names. The frontend expected image.image while the backend returned relative media paths and polygon objects needed to match the TypeScript interfaces exactly.

To solve this, the serializers, Django models, API responses and TypeScript interfaces were aligned so both applications shared the same data structure. Once the contracts matched, task filtering, image loading and polygon rendering all worked correctly.
