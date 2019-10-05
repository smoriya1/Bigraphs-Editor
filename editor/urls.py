from django.urls import path
from editor import views

urlpatterns = [
	path('', views.editor, name='editor'),
]
