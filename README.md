# Graphical User Interface Editor for Bigraphs
An interactive graphical user interface editor for modelling user defined bigraphs.

[DEMO LINK](https://smor.pythonanywhere.com/)

## Screenshot
![alt text](https://github.com/smoriya1/Bigraphs-Editor/Screenshot/Screenshot.png?raw=true)

## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)

## General info
A Bigragh is a formalism developed as a way to intuitively model interactive and ubiquitous systems that changes its state, connectivity and locality over time. 
This project is a webapp which allows users to create, edit and export customized bigraphs, with the added functionality to convert diagrams into algebraic notation.

## Technologies
Project is created with:
* [GoJS](https://gojs.net/): JavaScript library to create diagrams and graphs.
* [Django](https://www.djangoproject.com/): High level Python web framework for implementing the Model-View-Template architectural pattern. 
* [JQuery](https://jquery.com/): Popular JavaScript library for simplified HTML DOM element manipulation and event handling. 

## Setup
(Pre-requisites: Latest version of [Python 3](https://www.python.org/downloads/))

For the initial setup on a local machine, you will need to install Django within a Python virtual environment. First, install virtualenvwrapper to get access to virtualenv.
```python
#Linux/MacOS
sudo pip3 install virtualenvwrapper

#Windows
pip3 install virtualenvwrapper-win
```
Create a new virtual environment. 
```python
mkvirtualenv my_django_environment

#Activating the virtualenv
workon my_django_environment
#Deactivating the virtualenv
deactivate
```
Install the latest version of Django within the newly created virtual environment.
```
pip3 install django
```
Once installed, navigate to the cloned directory and run a local server. Then proceed to navigate to the link provided in the terminal to access the webapp locally on a web browser. 
```python
python3 manage.py runserver
```
