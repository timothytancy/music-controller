from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from .util import is_spotify_authenticated
from api.models import Room
import requests

# Create your views here.


# view to authencate app and request access
class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = "user-read-playback-state user-modify-playback-state user-read-currently-playing"
        url = (
            Request(
                "GET",
                "https://accounts.spotify.com/authorize",
                params={
                    "scope": scopes,
                    "response_type": "code",
                    "redirect_uri": REDIRECT_URI,
                    "client_id": CLIENT_ID,
                },
            )
            .prepare()
            .url
        )

        return Response({"url": url}, status=status.HTTP_200_OK)


# send a request to the generated url that was created in AuthURL
def spotify_callback(request, format=None):
    code = request.GET.get("code")
    error = request.GET.get("error")

    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    access_token = response.get("access_token")
    token_type = response.get("token_type")
    refresh_token = response.get("refresh_token")
    expires_in = response.get("expires_in")
    error = response.get("error")

    # create session if not exists
    if not request.session.exists(request.session.session_key):
        request.session.create()

    # store tokens for each user
    # one token for each session user
    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    # redirect to the frontend app (homepage)
    return redirect("frontend:")


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({"status": is_authenticated}, status=status.HTTP_200_OK)


# retrieves information about current song
class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get("room_code")
        # user might not be host
        # if not host, then find room, find host of room, and use host's data to retrieve song info
        room = Room.objects.filter(code=room_code)[0]
        host = room.host
        endpoint = "/player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        return Response(response, status=status.HTTP_200_OK)
