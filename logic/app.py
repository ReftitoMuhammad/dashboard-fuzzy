from flask import Flask, request, jsonify

# Inisialisasi aplikasi Flask
app = Flask(__name__)

# --- Salin fungsi fuzzy_logic Anda ke sini ---
def fuzzy_logic(tekanan, suhu, ketebalan):
    # (Fungsi keanggotaan dan rules dari kode Python Anda)
    def tekanan_kurang(x):
        return 1.0 if x <= 29 else max(0, (30 - x) / 2)
    def tekanan_normal(x):
        return max(0, min((x-29)/2, (35-x)/3)) if 29 < x <= 35 else 0
    def tekanan_lebih(x):
        return 1.0 if x > 35 else max(0, (x-33)/2)
    def suhu_dingin(x):
        return 1.0 if x <= 29 else max(0, (30 - x) / 2)
    def suhu_normal(x):
        return max(0, min((x-29)/2, (89-x)/5)) if 29 < x <= 89 else 0
    def suhu_panas(x):
        return 1.0 if x > 89 else max(0, (x-87)/2)
    def ketebalan_tipis(x):
        return 1.0 if x <= 2 else max(0, (3 - x) / 1)
    def ketebalan_normal(x):
        return max(0, min((x-2)/1, (8-x)/2)) if 2 < x <= 8 else 0
    def ketebalan_tebal(x):
        return 1.0 if x > 8 else max(0, (x-7)/1)

    tk = tekanan_kurang(tekanan)
    tn = tekanan_normal(tekanan)
    tl = tekanan_lebih(tekanan)
    sd = suhu_dingin(suhu)
    sn = suhu_normal(suhu)
    sp = suhu_panas(suhu)
    kt = ketebalan_tipis(ketebalan)
    kn = ketebalan_normal(ketebalan)
    kb = ketebalan_tebal(ketebalan)

    rules = [
        (min(tk, sd, kt), "Buruk"), (min(tk, sd, kn), "Buruk"), (min(tk, sd, kb), "Buruk"),
        (min(tk, sn, kt), "Buruk"), (min(tk, sn, kn), "Buruk"), (min(tk, sn, kb), "Buruk"),
        (min(tk, sp, kt), "Buruk"), (min(tk, sp, kn), "Buruk"), (min(tk, sp, kb), "Buruk"),
        (min(tn, sp, kt), "Buruk"), (min(tn, sp, kn), "Buruk"), (min(tn, sp, kb), "Buruk"),
        (min(tl, sd, kt), "Buruk"), (min(tl, sn, kt), "Buruk"), (min(tl, sp, kt), "Buruk"),
        (min(tl, sd, kn), "Buruk"), (min(tl, sp, kn), "Buruk"), (min(tl, sp, kb), "Buruk"),
        (min(tn, sd, kt), "Buruk"), (min(tn, sn, kt), "Buruk"),
        (min(tl, sn, kn), "Sedang"), (min(tl, sn, kb), "Sedang"),
        (min(tl, sd, kb), "Sedang"), (min(tn, sn, kb), "Sedang"),
        (min(tn, sd, kn), "Baik"), (min(tn, sd, kb), "Baik"),
        (min(tn, sn, kn), "Baik"),
    ]

    status = {"Baik": 0, "Sedang": 0, "Buruk": 0}
    for degree, condition in rules:
        if degree > status[condition]:
            status[condition] = degree
    return max(status, key=status.get)

# Buat API endpoint '/predict' yang menerima metode POST
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Ambil data JSON dari body request
        data = request.get_json()
        
        tekanan = data['tekanan']
        suhu = data['suhu']
        ketebalan = data['ketebalan']

        # Panggil fungsi fuzzy logic
        prediction = fuzzy_logic(tekanan, suhu, ketebalan)

        # Kembalikan hasil dalam format JSON
        return jsonify({'status_prediksi': prediction})

    except Exception as e:
        # Tangani jika ada error (misal: data tidak lengkap)
        return jsonify({'error': str(e)}), 400

# Jalankan server Flask
if __name__ == '__main__':
    # Jalankan di port 5000 agar tidak bentrok dengan Node.js
    app.run(debug=True, port=5000)
