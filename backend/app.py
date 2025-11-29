# pip install pytubefix

from pytubefix import YouTube, Search
import asyncio
from flask import Flask, jsonify, request
import random
import string
import json
import hashlib
import os

app = Flask(__name__)

# Helper to generate a hash from the JSON object
def hash_json(json_obj):
    json_string = json.dumps(json_obj, sort_keys=True)
    sha256_hash = hashlib.sha256()
    sha256_hash.update(json_string.encode('utf-8'))
    return sha256_hash.hexdigest()

# Helper to generate a random ID
def generate_random_id(length=16):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))

# Function to download the video audio
async def download_audio(video_url, output_path, filename):
    video = YouTube(video_url)
    audio_stream = video.streams.filter(only_audio=True, file_extension="mp4").order_by("abr").desc().first()
    audio_stream.download(output_path=output_path, filename=filename)

# Function to update metadata in JSON file
async def update_metadata_list(json_path, new_data):
    data = []
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]  # Force into a list if needed
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=4)

    # Append new data
    new_data["id"] = len(data) + 1
    data.append(new_data)

    # Save updated metadata
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    
    return new_data

@app.route('/playlist/list', methods=['GET'])
def get_playlists():
    data = []
    if os.path.exists('./data/playlists.json'):
        with open('./data/playlists.json', 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname('./data/playlists.json'), exist_ok=True)
        with open('./data/playlists.json', 'w', encoding='utf-8') as f:
            temp = {}
            temp["id"] = 0
            temp["name"] = "Liked Songs"
            temp["tracks"] = []
            data.append(temp)
            json.dump([temp], f, ensure_ascii=False, indent=4)

    return jsonify(data), 200

@app.route('/playlist/get/<playlist_id>', methods=['GET'])
def get_playlist(playlist_id):
    playlists = []
    if os.path.exists('./data/playlists.json'):
        with open('./data/playlists.json', 'r', encoding='utf-8') as f:
            try:
                playlists = json.load(f)
                if not isinstance(playlists, list):
                    playlists = [playlists]
            except json.JSONDecodeError:
                playlists = []
    else:
        os.makedirs(os.path.dirname('./data/playlists.json'), exist_ok=True)
        with open('./data/playlists.json', 'w', encoding='utf-8') as f:
            temp = {}
            temp["id"] = 0
            temp["name"] = "Liked Songs"
            temp["tracks"] = []
            playlists = [temp]
            json.dump([temp], f, ensure_ascii=False, indent=4)
        if playlist_id != 0:
            return "There is no playlist in the database", 404

    playlist = None
    for p in playlists:
        if int(p["id"]) == int(playlist_id):
            playlist = p
            break
    if playlist == None:
        return "The given ID does not correspond to any playlist: " + str(playlist_id), 404

    tracks = []
    json_path = os.path.join('./data', 'metadata.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                tracks = json.load(f)
                if not isinstance(tracks, list):
                    tracks = [tracks]
            except json.JSONDecodeError:
                tracks = []
    else:
        playlist["tracks"] = []
        return jsonify(playlist), 200

    completeTracks = []
    for track in playlist["tracks"]:
        for t in tracks:
            if int(track) == t["id"]:
                completeTracks.append(t)
                break

    playlist["tracks"] = completeTracks
    return jsonify(playlist), 200

@app.route('/playlist/create', methods=['POST'])
def create_playlist():
    name = request.json.get('name', '')
    if (name == ''):
        return "Given parameter seems to be null: " + str(name), 404

    data = []
    new_data = {}
    if os.path.exists('./data/playlists.json'):
        with open('./data/playlists.json', 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname('./data/playlists.json'), exist_ok=True)
        with open('./data/playlists.json', 'w', encoding='utf-8') as f:
            temp = {}
            temp["id"] = 0
            temp["name"] = "Liked Songs"
            temp["tracks"] = []
            data.append(temp)
            json.dump([temp], f, ensure_ascii=False, indent=4)

    # Append new data
    new_data["id"] = len(data) + 1
    new_data["name"] = name
    new_data["tracks"] = []
    data.append(new_data)

    # Save updated data
    with open('./data/playlists.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return jsonify(new_data), 200

@app.route('/playlist/update', methods=['POST'])
def update_playlist():
    track = int(request.json.get('track', -1))
    playlist_id = int(request.json.get('playlist_id', -1))
    if (track == -1 or playlist_id == -1):
        return "The given ID seems to be null", 404

    data = []
    if os.path.exists('./data/playlists.json'):
        with open('./data/playlists.json', 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname('./data/playlists.json'), exist_ok=True)
        with open('./data/playlists.json', 'w', encoding='utf-8') as f:
            temp = {}
            temp["id"] = 0
            temp["name"] = "Liked Songs"
            temp["tracks"] = []
            data.append(temp)
            json.dump([temp], f, ensure_ascii=False, indent=4)

    pl = None
    found = False
    for elt in data:
        if elt["id"] == playlist_id:
            found = True
            if track not in elt["tracks"]:
                elt["tracks"].append(track)
                pl = elt["tracks"]
    if not found:
        return "The given ID does not correspond to an existing playlist: " + str(playlist_id), 404
    if pl == None:
        return "The given track is already present in the playlist !", 404

    # Save updated data
    with open('./data/playlists.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return jsonify(pl), 200

@app.route('/playlist/delete', methods=['DELETE'])
def delete_track_from_playlist():
    track = int(request.json.get('track', -1))
    playlist_id = int(request.json.get('playlist_id', -1))
    if (track == -1 or playlist_id == -1):
        return "The given ID seems to be null", 404

    data = []
    if os.path.exists('./data/playlists.json'):
        with open('./data/playlists.json', 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname('./data/playlists.json'), exist_ok=True)
        with open('./data/playlists.json', 'w', encoding='utf-8') as f:
            temp = {}
            temp["id"] = 0
            temp["name"] = "Liked Songs"
            temp["tracks"] = []
            data.append(temp)
            json.dump([temp], f, ensure_ascii=False, indent=4)

    pl = None
    found = False
    for elt in data:
        if elt["id"] == playlist_id:
            found = True
            if track in elt["tracks"]:
                elt["tracks"].remove(track)
                pl = elt["tracks"]
    if not found:
        return "The given ID does not correspond to an existing playlist: " + str(playlist_id), 404
    if pl == None:
        return "The given track is already present in the playlist !", 404

    # Save updated data
    with open('./data/playlists.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return jsonify(pl), 200

# Route to fetch video and download it
@app.route('/fetch/video/<url>', methods=['GET'])
async def fetch_video(url):
    try:
        video_url = f"https://www.youtube.com/watch?v={url}"
        video = YouTube(video_url)

        name = hash_json({
            "title": video.title,
            "length": video.length,
            "author": video.author,
            "miniature": video.thumbnail_url,
        })

        metadata = {
            "name": f"{name}.m4a",
            "title": video.title,
            "length": video.length,
            "author": video.author,
            "miniature": video.thumbnail_url,
        }

        video_path = f"./data/videos/{name}.m4a"

        if os.path.exists(video_path):
            return jsonify(metadata), 200

        # Asynchronously download the audio
        await download_audio(video_url, "./data/videos", f"{name}.m4a")

        # Update metadata asynchronously
        await update_metadata_list('./data/metadata.json', metadata)

        return jsonify(metadata), 200
    except:
        return jsonify({ "error": "A problem occured while fetching the video" }), 400

# Route to fetch video, download it and add it to a given playlist
@app.route('/fetch_dl/video/<url>', methods=['POST'])
async def fetch_dl_video(url):
    playlist_id = int(request.json.get('playlist_id', -1))
    if (playlist_id == -1):
        return "The given playlist ID seems to be null", 404
    
    data = []
    if os.path.exists('./data/playlists.json'):
        with open('./data/playlists.json', 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname('./data/playlists.json'), exist_ok=True)
        with open('./data/playlists.json', 'w', encoding='utf-8') as f:
            temp = {}
            temp["id"] = 0
            temp["name"] = "Liked Songs"
            temp["tracks"] = []
            data.append(temp)
            json.dump([temp], f, ensure_ascii=False, indent=4)

    
    video_url = f"https://www.youtube.com/watch?v={url}"
    video = YouTube(video_url)

    name = hash_json({
        "title": video.title,
        "length": video.length,
        "author": video.author,
        "miniature": video.thumbnail_url,
    })

    metadata = {
        "name": f"{name}.m4a",
        "title": video.title,
        "length": video.length,
        "author": video.author,
        "miniature": video.thumbnail_url,
    }

    video_path = f"./data/videos/{name}.m4a"

    pl = None
    found = False

    if not os.path.exists(video_path):
        # Asynchronously download the audio
        await download_audio(video_url, "./data/videos", f"{name}.m4a")

        # Update metadata asynchronously
        new_data = await update_metadata_list('./data/metadata.json', metadata)    

        for elt in data:
            if elt["id"] == playlist_id:
                found = True
                elt["tracks"].append(new_data["id"])
                pl = elt["tracks"]

    if not found:
        return "The given ID does not correspond to an existing playlist: " + str(playlist_id), 404
    if pl == None:
        return "The given track is already present in the playlist !", 404

    # Save updated data
    with open('./data/playlists.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    return jsonify(metadata), 200

# Route to get all tracks
@app.route('/tracks', methods=['GET'])
def get_tracks():
    data = []
    json_path = os.path.join('./data', 'metadata.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=4)

    return jsonify(data), 200

# Route to search for videos
@app.route('/search/<req>', methods=['GET'])
def search_video(req):
    data = []
    json_path = os.path.join('./data', 'metadata.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
            except json.JSONDecodeError:
                data = []
    else:
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=4)

    try:
        results = Search(req)
        res = []
        index = -1
        for video in results.videos:
            name = hash_json({
                "title": video.title,
                "length": video.length,
                "author": video.author,
                "miniature": video.thumbnail_url,
            })
            found = False
            for track in data:
                if track["name"] == f"{name}.m4a":
                    found = True
                    track["liked"] = True
                    res.append(track)
                    break

            if not found:
                res.append({
                    "name": f"{name}.m4a",
                    "title": video.title,
                    "url": video.watch_url,
                    "length": video.length,
                    "author": video.author,
                    "miniature": video.thumbnail_url,
                    "id": index,
                    "liked": False,
                })
                index -= 1
        return jsonify(res), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 200

# Run the app
if __name__ == "__main__":
    # DEBUG: app.run(debug=True, port=4444)
    app.run(port=4444)
