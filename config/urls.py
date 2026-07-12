from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Auth Endpoints
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # App Endpoints
    path('api/accounts/', include('accounts.urls')),
    path('api/tasks/', include('tasks.urls')),
    path('api/annotation/', include('annotation.urls')),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)