from django.db import models
from django.conf import settings

class AnnotatedImage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='annotations/')
    type = models.CharField(max_length=50, default="axial")
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Polygon(models.Model):
    image = models.ForeignKey(AnnotatedImage, on_delete=models.CASCADE, related_name='polygons')
    points = models.JSONField()
    type = models.CharField(max_length=50, default="axial")
    created_at = models.DateTimeField(auto_now_add=True)