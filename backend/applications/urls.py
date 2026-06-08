from django.urls import path
from .views import (
    ApplyToJobView,
    MyApplicationsView,
    JobApplicationsView,
    ApplicationDetailView,
    UpdateApplicationStatusView,
    AdminApplicationListView,
    WithdrawApplicationView,
)

urlpatterns = [
    path('apply/',
         ApplyToJobView.as_view(),
         name='apply_job'),

    path('my/',
         MyApplicationsView.as_view(),
         name='my_applications'),

    path('job/<int:job_id>/',
         JobApplicationsView.as_view(),
         name='job_applications'),

    # NEW — single application detail for recruiter
    path('<int:pk>/detail/',
         ApplicationDetailView.as_view(),
         name='application_detail'),

    path('<int:pk>/status/',
         UpdateApplicationStatusView.as_view(),
         name='update_status'),

    path('<int:pk>/withdraw/',
         WithdrawApplicationView.as_view(),
         name='withdraw'),

    path('admin/all/',
         AdminApplicationListView.as_view(),
         name='admin_applications'),
]