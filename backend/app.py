# pip install pytubefix

from pytubefix import YouTube, Search
from pytubefix.cli import on_progress

from flask import Flask, jsonify
import random
import string
import json
import hashlib
import os
import threading
# from flask_cors import CORS
# import webview

app = Flask(__name__)
# cors = CORS(app, origins='*')

def hash_json(json_obj):
    # Convert JSON object to a string
    json_string = json.dumps(json_obj, sort_keys=True)  # sort_keys ensures consistent order

    # Create a SHA-256 hash object
    sha256_hash = hashlib.sha256()

    # Update the hash object with the JSON string encoded as bytes
    sha256_hash.update(json_string.encode('utf-8'))

    # Return the hexadecimal representation of the hash
    return sha256_hash.hexdigest()

def update_metadata_list(json_path, new_data):
    """Load a JSON file (list), append new_data (dict), and save it back."""
    
    # Ensure the file exists
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
    data.append(new_data)

    # Save back to file
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def generate_random_id(length=16):
    """Generate a random string of letters and digits."""
    characters = string.ascii_letters + string.digits  # a-zA-Z0-9
    return ''.join(random.choices(characters, k=length))

def on_progress(stream, chunk, bytes_remaining):
    print(stream, chunk, bytes_remaining)
    pass  # Optional: define your progress handling logic here

def download_video_audio(video, name):
    audio_stream = video.streams.filter(only_audio=True, file_extension="mp4").order_by("abr").desc().first()
    audio_stream.download(output_path="./data/videos", filename=name + ".m4a")

@app.route('/fetch/video/<url>', methods=['GET'])
def fetchVideo(url):
    video = YouTube("https://www.youtube.com/watch?v=" + url)

    name = hash_json({
        "title": video.title,
        "length": video.length,
        "author": video.author,
        "miniature": video.thumbnail_url,
    })

    metadata = {
        "name": name + ".m4a",
        "title": video.title,
        "length": video.length,
        "author": video.author,
        "miniature": video.thumbnail_url,
    }
    
    if os.path.exists(f"./data/videos/{name}.m4a"):
        return jsonify(metadata)


    # Start the download in a background thread
    threading.Thread(target=download_video_audio, args=(video, name), daemon=True).start()

    update_metadata_list(os.path.join('./data', 'metadata.json'), metadata)
    
    return jsonify(metadata)


@app.route('/search/<req>', methods=['GET'])
def searchVideo(req):
    try:
        results = Search(req)
        res = []
        for video in results.videos:
            res.append({
                "title": video.title,
                "url": video.watch_url,
                "length": video.length,
                "author": video.author,
                "miniature": video.thumbnail_url,
            })
        return jsonify({ "result": res })
    except Exception as e:
        return jsonify({ "result": res })

app.run(debug=True, port=4444)
# if __name__ == '__main__':
#     t = threading.Thread(target=start_server)
#     t.daemon = True
#     t.start()
    
#     webview.create_window('My App', 'http://localhost:5010')
#     webview.start()