from flask import Flask, request, jsonify

app = Flask(__name__)

# --- FUNGSI FUZZY LOGIC (Lengkap dan Benar) ---
def fuzzy_logic(tekanan, suhu, ketebalan):
    def tekanan_kurang(x): return 1.0 if x <= 29 else max(0, (31 - x) / 2)
    def tekanan_normal(x): return max(0, min((x - 30) / 2, (36 - x) / 2)) if 30 < x <= 36 else 0
    def tekanan_lebih(x): return 1.0 if x > 36 else max(0, (x - 34) / 2)
    def suhu_dingin(x): return 1.0 if x <= 29 else max(0, (35 - x) / 6)
    def suhu_normal(x): return max(0, min((x - 29) / 6, (61 - x) / 6)) if 29 < x <= 61 else 0
    def suhu_panas(x): return 1.0 if x > 60 else max(0, (x - 55) / 5)
    def ketebalan_tipis(x): return 1.0 if x <= 2 else max(0, (3 - x) / 1)
    def ketebalan_normal(x): return max(0, min((x - 2) / 3, (9 - x) / 3)) if 2 < x <= 9 else 0
    def ketebalan_tebal(x): return 1.0 if x > 8 else max(0, (x - 7) / 1)
    tk, tn, tl = tekanan_kurang(tekanan), tekanan_normal(tekanan), tekanan_lebih(tekanan)
    sd, sn, sp = suhu_dingin(suhu), suhu_normal(suhu), suhu_panas(suhu)
    kt, kn, kb = ketebalan_tipis(ketebalan), ketebalan_normal(ketebalan), ketebalan_tebal(ketebalan)
    baik = max(min(tn, sd, kn), min(tn, sd, kb), min(tn, sn, kn), min(tn, sn, kb))
    sedang = max(min(tl, sn, kn), min(tl, sn, kb), min(tl, sd, kb))
    derajat_buruk = []
    if tk > 0: derajat_buruk.append(tk)
    if sp > 0: derajat_buruk.append(sp)
    if kt > 0: derajat_buruk.append(kt)
    if tl > 0.5 and sp > 0.5: derajat_buruk.append(min(tl, sp))
    buruk = max(derajat_buruk) if derajat_buruk else 0.0
    status = {'Baik': baik, 'Sedang': sedang, 'Buruk': buruk}
    return max(status, key=status.get)

# --- FUNGSI UNTUK ALASAN (Untuk Tombol "i") ---
def generate_reasons(tekanan, suhu, ketebalan):
    reasons = []
    if tekanan < 29: reasons.append("Tekanan ban terlalu rendah, berisiko merusak velg.")
    if tekanan > 36: reasons.append("Tekanan ban terlalu tinggi, mengurangi kenyamanan.")
    if suhu < 29: reasons.append("Suhu ban terlalu dingin, cengkeraman belum optimal.")
    if suhu > 60: reasons.append("Suhu ban sangat tinggi, risiko ban meledak meningkat.")
    if ketebalan <= 2: reasons.append("Ketebalan ban sudah kritis, risiko bocor sangat tinggi.")
    return reasons

# --- FUNGSI UNTUK NARASI (Untuk Kartu Simulasi) ---
def generate_narrative_prediction(status, reasons):
    if not reasons:
        return "PERKIRAAN KONDISI: Semua parameter berada dalam kondisi optimal. Performa dan keamanan berada di level terbaik."
    
    # Ambil alasan pertama sebagai highlight narasi
    first_reason = reasons[0] if reasons else ""

    if status == "Buruk":
        return f"ANALISIS RISIKO: Ditemukan {len(reasons)} masalah kritis. Poin utama: {first_reason}"
    if status == "Sedang":
        return f"HEALTH FORECAST: Ditemukan {len(reasons)} poin peringatan. Poin utama: {first_reason}"
    
    return "Tidak dapat membuat prediksi."

# --- ENDPOINT DIPERBAIKI ---

# Endpoint untuk data real-time dari ESP32
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        tekanan, suhu, ketebalan = data['tekanan'], data['suhu'], data['ketebalan']
        
        status = fuzzy_logic(tekanan, suhu, ketebalan)
        reasons = generate_reasons(tekanan, suhu, ketebalan)
        
        return jsonify({'status_prediksi': status, 'reasons': reasons})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Endpoint untuk form simulasi di frontend
@app.route('/simulate', methods=['POST'])
def simulate():
    try:
        data = request.get_json()
        tekanan, suhu, ketebalan = data['tekanan'], data['suhu'], data['ketebalan']

        status = fuzzy_logic(tekanan, suhu, ketebalan)
        reasons = generate_reasons(tekanan, suhu, ketebalan)
        
        # --- PERBAIKAN DI SINI ---
        # Panggil fungsi narasi dengan argumen yang benar (2 argumen)
        narrative = generate_narrative_prediction(status, reasons)

        return jsonify({
            'status': status,
            'narrative': narrative
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
# Jalankan server Flask
if __name__ == '__main__':
    app.run(debug=True, port=5000)
