from django.urls import path
from .views import (
    JobListView, JobDetailView,
    JobCreateView, JobUpdateView,
    MyPostedJobsView,
    AdminJobListView, AdminJobToggleView,
)

urlpatterns = [
    path('', JobListView.as_view(), name='job_list'),
    path('<int:pk>/', JobDetailView.as_view(), name='job_detail'),
    path('create/', JobCreateView.as_view(), name='job_create'),
    path('<int:pk>/edit/', JobUpdateView.as_view(), name='job_update'),
    path('my-jobs/', MyPostedJobsView.as_view(), name='my_jobs'),
    path('admin/all/', AdminJobListView.as_view(), name='admin_job_list'),
    path('admin/<int:pk>/toggle/', AdminJobToggleView.as_view(), name='admin_job_toggle'),
]