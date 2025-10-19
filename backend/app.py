# pip install pytubefix

from pytubefix import YouTube, Search
from pytubefix.cli import on_progress

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app, origins='*')

@app.route('/fetch/video/<url>', methods=['GET'])
def fetchVideo(url):
    video = YouTube(url, on_progress_callback=on_progress)
    video.streams.get_audio_only().download(output_path="../data/videos")
    return jsonify({
        "title": video.title,
        "length": video.length,
        "author": video.author,
        "miniature": video.thumbnail_url,
    })

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

app.run(port=4444)