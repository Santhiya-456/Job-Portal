from rest_framework import serializers
from .models import Job
from accounts.serializers import UserSerializer


class JobSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'location',
            'salary', 'job_type', 'company_name',
            'posted_by', 'is_active', 'created_at',
            'updated_at', 'application_count'
        ]
        read_only_fields = ['posted_by', 'created_at', 'updated_at']

    def get_application_count(self, obj):
        return obj.applications.count()


class JobWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'location',
            'salary', 'job_type', 'company_name', 'is_active'
        ]