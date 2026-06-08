from rest_framework import serializers
from .models import Application
from accounts.serializers import UserSerializer
from jobs.serializers import JobSerializer

ALLOWED_RESUME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument'
    '.wordprocessingml.document',
]


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Used when seeker submits application with file"""

    class Meta:
        model = Application
        fields = [
            'id', 'job',
            'full_name', 'email', 'phone',
            'skills', 'experience', 'cover_letter',
            'resume',
            'linkedin_url', 'portfolio_url',
        ]

    def validate_resume(self, file):
        if file.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Resume file must be under 5MB."
            )
        if file.content_type not in ALLOWED_RESUME_TYPES:
            raise serializers.ValidationError(
                "Only PDF, DOC, or DOCX files are allowed."
            )
        return file

    def validate(self, data):
        request   = self.context['request']
        job       = data['job']
        applicant = request.user

        if Application.objects.filter(
            job=job, applicant=applicant
        ).exists():
            raise serializers.ValidationError(
                "You have already applied to this job."
            )
        if not job.is_active:
            raise serializers.ValidationError(
                "This job is no longer accepting applications."
            )
        return data

    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)


class ApplicationReadSerializer(serializers.ModelSerializer):
    """
    Used when recruiter/admin reads applications.
    REQUIRES request in serializer context to build resume_url.
    """
    applicant  = UserSerializer(read_only=True)
    job        = JobSerializer(read_only=True)
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'applicant',
            'full_name',
            'email',
            'phone',
            'skills',
            'experience',
            'cover_letter',
            'resume',
            'resume_url',
            'linkedin_url',
            'portfolio_url',
            'status',
            'applied_at',
        ]

    def get_resume_url(self, obj):
        request = self.context.get('request')
        # Guard: resume field may be empty on old applications
        if obj.resume and hasattr(obj.resume, 'url') and request:
            try:
                return request.build_absolute_uri(obj.resume.url)
            except Exception:
                return None
        return None


class ApplicationStatusSerializer(serializers.ModelSerializer):
    """Used when recruiter updates status only"""
    class Meta:
        model  = Application
        fields = ['id', 'status']