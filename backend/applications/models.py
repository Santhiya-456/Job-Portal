from django.db import models
from django.conf import settings
from jobs.models import Job


def resume_upload_path(instance, filename):
    # Saves to: media/resumes/user_<id>/<filename>
    return f'resumes/user_{instance.applicant.id}/{filename}'


class Application(models.Model):
    STATUS_CHOICES = (
        ('pending',     'Pending'),
        ('shortlisted', 'Shortlisted'),
        ('rejected',    'Rejected'),
        ('hired',       'Hired'),
    )

    # Core relation fields
    job       = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications'
    )

    # Personal info (filled per application)
    full_name    = models.CharField(max_length=200,null=True)
    email        = models.EmailField(null=True)
    phone        = models.CharField(max_length=20,null=True)
    skills       = models.TextField(help_text="Comma separated skills",null=True)
    experience   = models.TextField(help_text="Work experience summary",null=True)
    cover_letter = models.TextField(blank=True)

    # File
    resume = models.FileField(
        upload_to=resume_upload_path,
        help_text="PDF, DOC, or DOCX only",
        null=True
    )

    # Optional links
    linkedin_url  = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    # Status + timestamp
    status     = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ('job', 'applicant')

    def __str__(self):
        return f"{self.full_name} → {self.job.title}"