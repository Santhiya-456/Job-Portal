from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Application
from .serializers import (
    ApplicationCreateSerializer,
    ApplicationReadSerializer,
    ApplicationStatusSerializer,
)
from accounts.permissions import IsSeeker, IsRecruiter


class ApplyToJobView(generics.CreateAPIView):
    """Seeker: Submit full application with resume upload"""
    serializer_class   = ApplicationCreateSerializer
    permission_classes = [IsAuthenticated, IsSeeker]
    parser_classes     = [MultiPartParser, FormParser]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class MyApplicationsView(generics.ListAPIView):
    """Seeker: View own applications with full detail"""
    serializer_class   = ApplicationReadSerializer
    permission_classes = [IsAuthenticated, IsSeeker]

    def get_queryset(self):
        return Application.objects.filter(
            applicant=self.request.user
        ).select_related('job', 'applicant')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class JobApplicationsView(generics.ListAPIView):
    """
    Recruiter: View ALL applicants for a specific job.
    Only returns applications for jobs posted by this recruiter.
    """
    serializer_class   = ApplicationReadSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        job_id = self.kwargs['job_id']
        return Application.objects.filter(
            job__id=job_id,
            job__posted_by=self.request.user
        ).select_related('job', 'applicant')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class ApplicationDetailView(generics.RetrieveAPIView):
    """
    Recruiter: Get full detail of a single application.
    NEW endpoint — fixes the blank detail panel.
    """
    serializer_class   = ApplicationReadSerializer
    permission_classes = [IsAuthenticated, IsRecruiter]

    def get_queryset(self):
        # Recruiter can only read applications for their own jobs
        return Application.objects.filter(
            job__posted_by=self.request.user
        ).select_related('job', 'applicant')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class UpdateApplicationStatusView(APIView):
    """Recruiter: Update application status"""
    permission_classes = [IsAuthenticated, IsRecruiter]

    def patch(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        if application.job.posted_by != request.user:
            return Response(
                {'detail': 'You do not own this job.'},
                status=403
            )
        serializer = ApplicationStatusSerializer(
            application,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


class AdminApplicationListView(generics.ListAPIView):
    """Admin: See all applications"""
    serializer_class   = ApplicationReadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            return Application.objects.none()
        return Application.objects.all().select_related(
            'job', 'applicant'
        )

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx


class WithdrawApplicationView(APIView):
    """Seeker: Withdraw a pending application"""
    permission_classes = [IsAuthenticated, IsSeeker]

    def delete(self, request, pk):
        application = get_object_or_404(
            Application, pk=pk, applicant=request.user
        )
        if application.status != 'pending':
            return Response(
                {'detail': 'Only pending applications can be withdrawn.'},
                status=400
            )
        application.delete()
        return Response(
            {'detail': 'Application withdrawn.'},
            status=204
        )