from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


# Create your views here.


# api view to show list of rooms
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = "code"

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            # Room is from models, so we can query by code here
            room = Room.objects.filter(code=code)

            # should not run into issues here of len(room) > 1, because roomCode is unique
            if len(room) > 0:
                # access room data by using RoomSerializer
                data = RoomSerializer(room[0]).data
                # create and set another attribute is_host to indicate whether the user is the host
                data["is_host"] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)

            # no rooms found:
            return Response({"Room Not Found": "Invalid Room Code"}, status=status.HTTP_404_NOT_FOUND)

        # no code found in request
        return Response({"Bad Request": "Code parameter not found in request"}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # if current user does not have an active session, create session
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            host = self.request.session.session_key  # identify the host by unique session key
            queryset = Room.objects.filter(host=host)

            # check if host owns an existing room (within same session)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=["guest_can_pause", "votes_to_skip"])
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:  # create a new room in the session
                room = Room(
                    host=host,
                    guest_can_pause=guest_can_pause,
                    votes_to_skip=votes_to_skip,
                )
                room.save()
                self.request.session["room_code"] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

            # if serializer is not valid then bad request
            return Response({"Bad Request": "Invalid data..."}, status=status.HTTP_400_BAD_REQUEST)


class JoinRoom(APIView):
    # grab room code from the url
    lookup_url_kwarg = "code"

    def post(self, request, format=None):
        # check if user has active session
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # this is a post request, so we can just access data using request.data
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            if len(room_result) > 0:
                room = room_result[0]
                # save the room code to the session data, so that they can leave and join later
                self.request.session["room_code"] = code
                return Response({"message": "Room Joined!"}, status=status.HTTP_200_OK)
            return Response({"Bad Request": "Invalid room code"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {"Bad Request": "Invalid post data, did not find a code key"}, status=status.HTTP_400_BAD_REQUEST
        )


# for the current user and session, are they in a room?
class UserInRoom(APIView):
    def get(self, request, format=None):
        # ensure that there is a session
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        data = {"code": self.request.session.get("room_code")}  # get room code from session
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    # post request because we are updating that the user is not in the room anymore
    def post(self, request, format=None):
        # if room_code is in the session, then remove it (pop) from the data
        if "room_code" in self.request.session:
            self.request.session.pop("room_code")
            host_id = self.request.session.session_key  # get host id
            room_results = Room.objects.filter(host=host_id)  # query rooms made by the host
            if room_results.exists() > 0:  # delete room if host leaves
                room = room_results[0]
                room.delete()
        return Response({"Message": "Success"}, status=status.HTTP_200_OK)


class UpdateView(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):  # patch used to update settings
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():  # grab data from serializer
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({"msg": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = self.request.session.session_key

            # only allow update settings if user if host
            if room.host != user_id:
                return Response({"msg": "You are not the host of this room."}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=["guest_can_pause", "votes_to_skip"])

            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({"Bad Request": "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)
