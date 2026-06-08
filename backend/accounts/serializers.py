from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SeekerProfile, RecruiterProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'seeker'),
        )
        # Auto-create profile based on role
        if user.role == 'seeker':
            SeekerProfile.objects.create(user=user)
        elif user.role == 'recruiter':
            RecruiterProfile.objects.create(user=user)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'date_joined']


class SeekerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SeekerProfile
        fields = ['id', 'user', 'resume', 'skills', 'bio', 'phone']


class RecruiterProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = ['id', 'user', 'company_name', 'company_website', 'phone']