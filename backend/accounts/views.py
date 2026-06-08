from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    RegisterSerializer, UserSerializer,
    SeekerProfileSerializer, RecruiterProfileSerializer
)
from .models import SeekerProfile, RecruiterProfile

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SeekerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.seeker_profile
        except SeekerProfile.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)
        serializer = SeekerProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        try:
            profile = request.user.seeker_profile
        except SeekerProfile.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)
        serializer = SeekerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class RecruiterProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.recruiter_profile
        except RecruiterProfile.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        try:
            profile = request.user.recruiter_profile
        except RecruiterProfile.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=404)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return User.objects.none()
        return super().get_queryset()