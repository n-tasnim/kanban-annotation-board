from django.urls import path
from .views import (
    ImageListCreateView, 
    ImageDetailView, 
    PolygonListCreateView, 
    PolygonDetailView
)

urlpatterns = [
    path('images/', ImageListCreateView.as_view(), name='image-list-create'),
    path('images/<int:pk>/', ImageDetailView.as_view(), name='image-detail'),
    path('polygons/', PolygonListCreateView.as_view(), name='polygon-list-create'),
    path('polygons/<int:pk>/', PolygonDetailView.as_view(), name='polygon-detail'),
]