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
                
    return jsonify(data)

@app.route('/playlist/create', methods=['POST'])
def create_playlist():
    name = request.json.get('name', '')
    print(name)
    if (name == ''):
        return
    
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
            json.dump([], f, ensure_ascii=False, indent=4)

    # Append new data
    new_data["id"] = len(data) + 1
    new_data["name"] = name
    new_data["tracks"] = []
    data.append(new_data)

    # Save updated metadata
    with open('./data/playlists.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return jsonify(new_data)

@app.route('/playlist/update', methods=['POST'])
def update_playlist():
    track = request.json.get('track', None)
    playlist_id = request.json.get('playlist_id', None)
    if (track == None or playlist_id == None):
        return
    
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
            json.dump([], f, ensure_ascii=False, indent=4)

    pl = None
    for elt in data:
        if elt["id"] == playlist_id:
            elt["tracks"].append(track)
            pl = elt["tracks"]
    if (pl == None):
        return

    # Save updated metadata
    with open('./data/playlists.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    return jsonify(pl)

# Route to fetch video and download it
@app.route('/fetch/video/<url>', methods=['GET'])
async def fetch_video(url):
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
        return jsonify(metadata)

    # Asynchronously download the audio
    await download_audio(video_url, "./data/videos", f"{name}.m4a")

    # Update metadata asynchronously
    await update_metadata_list('./data/metadata.json', metadata)

    return jsonify(metadata)

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

    return jsonify({"result": data})

# Route to search for videos
@app.route('/search/<req>', methods=['GET'])
def search_video(req):
    try:
        results = Search(req)
        res = []
        index = 1
        for video in results.videos:
            res.append({
                "title": video.title,
                "url": video.watch_url,
                "length": video.length,
                "author": video.author,
                "miniature": video.thumbnail_url,
                "id": index,
            })
            index += 1
        return jsonify({"result": res})
    except Exception as e:
        return jsonify({"error": str(e)})

# Run the app
if __name__ == "__main__":
    app.run(debug=True, port=4444)
