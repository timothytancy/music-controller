# translate room information into json response
from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = (
            "id",
            "code",
            "host",
            "guest_can_pause",
            "votes_to_skip",
            "created_at",
        )


# serializes payload included in post request
class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        # fields are data that needs to be included in a create room request
        fields = ("guest_can_pause", "votes_to_skip")


class UpdateRoomSerializer(serializers.ModelSerializer):
    # code field in models must be unique, so this line allows us to pass in an already existing code
    # updating room will always be performed on an already existing room, so this step is necessary
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ("guest_can_pause", "votes_to_skip", "code")
