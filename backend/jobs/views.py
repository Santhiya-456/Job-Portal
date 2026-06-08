from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Job
from .serializers import JobSerializer, JobWriteSerializer
from accounts.permissions import IsRecruiter, IsRecruiterOrAdmin


class JobListView(generics.ListAPIView):
    """Public: Browse + search jobs"""
    serializer_class = JobSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'company_name', 'location', 'description']
    ordering_fields = ['created_at', 'salary']

    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True)
        job_type = self.request.query_params.get('job_type')
        location = self.request.query_params.get('location')
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset


class JobDetailView(generics.RetrieveAPIView):
    """Public: Single job detail"""
    queryset = Job.objects.filter(is_active=True)
    serializer_class = JobSerializer
    permission_classes = [AllowAny]


class JobCreateView(generics.CreateAPIView):
    """Recruiter: Post a new job"""
    serializer_class = JobWriteSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


class JobUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """Recruiter: Edit or delete own job"""
    serializer_class = JobWriteSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)


class MyPostedJobsView(generics.ListAPIView):
    """Recruiter: List own posted jobs"""
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        return Job.objects.filter(posted_by=self.request.user)


class AdminJobListView(generics.ListAPIView):
    """Admin: See ALL jobs including inactive"""
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Job.objects.none()
        return Job.objects.all()


class AdminJobToggleView(APIView):
    """Admin: Activate or deactivate any job"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'detail': 'Forbidden.'}, status=403)
        job = get_object_or_404(Job, pk=pk)
        job.is_active = not job.is_active
        job.save()
        return Response({'id': job.id, 'is_active': job.is_active})