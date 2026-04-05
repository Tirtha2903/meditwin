from flask import Blueprint, request, jsonify, Response
from services.twin_service import twin_service
from google import genai
import requests as req
import datetime
import time

api_bp = Blueprint('api', __name__)

GEMINI_KEY = 'AIzaSyCsXBhPCQlo7RmH6vxOUPVbMJJGCh1viQ0'
ELEVENLABS_KEY = 'sk_08c0de3515ab66d6b6651ff161fb1a4ba2a2947134ef3e9b'
VOICE_ID = 'Ig3E2CbjErTtg7LouDHB'
REQUIRED = ['age','heart_rate','systolic_bp','diastolic_bp','bmi','cholesterol','glucose','smoking','diabetes','family_history']

gemini_client = genai.Client(api_key=GEMINI_KEY)
presage_store = {}


@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'MediTwin AI running'})


@api_bp.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    try:
        parsed = {k: float(data[k]) for k in REQUIRED}
    except (KeyError, TypeError, ValueError) as e:
        return jsonify({'error': f'Missing or invalid field: {e}'}), 400
    result = twin_service.create_twin_and_predict(parsed)
    return jsonify(result), 200


@api_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    context = data.get('context', '')
    last_error = None
    for attempt in range(3):
        try:
            prompt = f"{context}\n\nUser question: {message}\n\nAnswer in under 100 words. Be direct and helpful."
            response = gemini_client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt
            )
            return jsonify({'reply': response.text})
        except Exception as e:
            last_error = str(e)
            time.sleep(2)
            return jsonify({'error': last_error}), 500


@api_bp.route('/speak', methods=['POST'])
def speak():
    data = request.get_json()
    text = data.get('text', '')
    try:
        response = req.post(
            f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}',
            headers={
                'xi-api-key': ELEVENLABS_KEY,
                'Content-Type': 'application/json'
            },
            json={
                'text': text,
                'model_id': 'eleven_turbo_v2_5',
                'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75}
            }
        )
        return Response(response.content, mimetype='audio/mpeg')
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@api_bp.route('/superplane/trigger', methods=['POST'])
def superplane_trigger():
    data = request.get_json()
    try:
        response = req.post(
            'https://app.superplane.com/api/v1/webhooks/meditwin',
            headers={'Content-Type': 'application/json'},
            json={
                'event_type': data.get('event'),
                'payload': data,
                'source': 'MediTwin AI'
            },
            timeout=5
        )
        return jsonify({'status': 'triggered', 'superplane_status': response.status_code})
    except Exception as e:
        return jsonify({'status': 'triggered_locally', 'note': str(e)})


@api_bp.route('/presage/vitals', methods=['POST'])
def presage_vitals():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    user_id = data.get('user_id', 'presage-user')
    presage_store[user_id] = {
        'heart_rate':        data.get('heart_rate'),
        'breathing_rate':    data.get('breathing_rate'),
        'systolic_bp':       data.get('systolic_bp'),
        'diastolic_bp':      data.get('diastolic_bp'),
        'posture':           data.get('posture'),
        'activity_level':    data.get('activity_level'),
        'emotion':           data.get('emotion'),
        'micro_expressions': data.get('micro_expressions'),
        'focus_score':       data.get('focus_score'),
        'excitement_score':  data.get('excitement_score'),
        'stress_score':      data.get('stress_score'),
        'timestamp':         datetime.datetime.now().isoformat()
    }
    return jsonify({
    'status': 'received',
    'stored_fields': [k for k, v in presage_store[user_id].items() if v is not None]
})


@api_bp.route('/presage/latest', methods=['GET'])
def presage_latest():
    user_id = request.args.get('user_id', 'presage-user')
    data = presage_store.get(user_id)
    if not data:
        return jsonify({'status': 'waiting'}), 200
    return jsonify({'status': 'ready', 'data': data})


@api_bp.route('/presage/clear', methods=['POST'])
def presage_clear():
    user_id = request.get_json().get('user_id', 'presage-user')
    presage_store.pop(user_id, None)
    return jsonify({'status': 'cleared'})