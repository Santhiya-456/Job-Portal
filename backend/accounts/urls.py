from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView,
    SeekerProfileView, RecruiterProfileView,
    AdminUserListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('profile/seeker/', SeekerProfileView.as_view(), name='seeker_profile'),
    path('profile/recruiter/', RecruiterProfileView.as_view(), name='recruiter_profile'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_user_list'),
]