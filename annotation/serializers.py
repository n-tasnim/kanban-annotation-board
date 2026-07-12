from rest_framework import serializers
from .models import AnnotatedImage, Polygon

class PolygonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Polygon
        fields = ['id', 'points', 'created_at', 'image', 'type']
        read_only_fields = ['created_at']

class AnnotatedImageSerializer(serializers.ModelSerializer):
    polygons = PolygonSerializer(many=True, read_only=True)

    class Meta:
        model = AnnotatedImage
        fields = ['id', 'image', 'type', 'uploaded_at', 'polygons']
        read_only_fields = ['user', 'uploaded_at']