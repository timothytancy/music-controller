# import spotify db
from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from requests import post

BASE_URL = "https://api.spotify.com/v1/me"


def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None


def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    if tokens:  # if updating token
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=["access_token", "refresh_token", "expires_in", "token_type"])
    else:  # if creating a new token
        tokens = SpotifyToken(
            user=session_id,
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=expires_in,
            token_type=token_type,
        )
        tokens.save()


def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():  # token expired
            refresh_spotify_token(session_id)
        return True
    return False


def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    # refresh token request
    response = post(
        "https://accounts.spotify.com/api/token",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    ).json()

    # update credentials
    access_token = response.get("access_token")
    token_type = response.get("token_type")
    expires_in = response.get("expires_in")
    refresh_token = response.get("refresh_token")

    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)


def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    # get token for session id
    tokens = get_user_tokens(session_id)
    # format for sending authorization to spotify api (can check docs to verify)
    headers = {"content-Type": "application/json", "Authorization": "Bearer " + tokens.access_token}

    if post_:  # if submitting post request:
        post(BASE_URL + endpoint, headers=headers)
    if put_:  # if submitting put request:
        put(BASE_URL + endpoint, headers=headers)

    # if submitting get request
    # catch exception because somtimes we get issues with get response
    response = get(BASE_URL + endpoint, {}, headers=headers)
    try:
        return response.json()
    except:
        return {"Error": "Issue with request"}
