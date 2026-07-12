from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import AnnotatedImage, Polygon
from .serializers import AnnotatedImageSerializer, PolygonSerializer

class ImageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        images = AnnotatedImage.objects.filter(user=request.user)
        serializer = AnnotatedImageSerializer(images, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AnnotatedImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ImageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        image = get_object_or_404(AnnotatedImage, pk=pk, user=request.user)
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PolygonListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        polygons = Polygon.objects.filter(image__user=request.user)
        serializer = PolygonSerializer(polygons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        image_id = request.data.get('image')
        image = get_object_or_404(AnnotatedImage, id=image_id, user=request.user)
        
        serializer = PolygonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(image=image)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PolygonDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        polygon = get_object_or_404(Polygon, pk=pk, image__user=request.user)
        polygon.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)