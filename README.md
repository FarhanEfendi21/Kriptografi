# Penjelasan Rinci Setiap Output — Notebook Analisis Sinyal EEG Bonn

Dokumen ini menjelaskan **setiap output** (grafik dan teks) yang dihasilkan notebook [Analisis_Sinyal_EEG_Bonn.ipynb](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Analisis_Sinyal_EEG_Bonn.ipynb), apa **kegunaan**-nya, dan apa yang **diindikasikan** oleh hasilnya.

---

## 1. Sinyal EEG Representatif dari Setiap Set (Bagian 3.1)

![Sinyal EEG Representatif](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Sinyal-EEG-Representatif-dari-Setiap-set.png)

**Apa yang ditampilkan:** 5 subplot vertikal, masing-masing menampilkan 1 segmen pertama dari set Z, O, N, F, dan S. Sumbu-x = waktu (detik), sumbu-y = amplitudo (µV).

**Kegunaan:**
- Memberikan **gambaran awal (visual inspection)** bentuk umum sinyal EEG pada setiap kondisi klinis.
- Menjadi titik awal untuk mengidentifikasi perbedaan kasar antar kondisi sebelum analisis kuantitatif.

**Indikasi:**
- **Set Z & O** (sehat): sinyal cenderung berfrekuensi rendah–menengah dengan amplitudo sedang dan terlihat lebih "*smooth*/halus".
- **Set N & F** (epilepsi, bebas kejang): sinyal lebih kompleks dengan campuran frekuensi.
- **Set S** (kejang aktif): sinyal menunjukkan **pola ritmis berulang (quasi-periodik) dengan amplitudo sangat tinggi**, yang merupakan ciri khas aktivitas seizure.

---

## 2. Overlay Sinyal EEG — 1 Segmen per Set (Bagian 3.2)

![Overlay Sinyal EEG](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Overlay-Sinyal-EEG.png)

**Apa yang ditampilkan:** Semua 5 sinyal representatif ditumpuk dalam **1 grafik** dengan warna berbeda.

**Kegunaan:**
- **Membandingkan secara langsung** rentang amplitudo, pola osilasi, dan variabilitas antar kondisi pada skala waktu yang sama.

**Indikasi:**
- Terlihat jelas bahwa **Set S memiliki rentang amplitudo paling besar** (puncak-ke-puncak tertinggi).
- Set Z dan O relatif tumpang-tindih, menunjukkan kesamaan kondisi normal.
- Perbedaan visual ini mengkonfirmasi bahwa sinyal kejang secara fundamental berbeda dari sinyal non-kejang.

---

## 3. Zoom-In (0–3 detik) — Segmen Pertama Setiap Set (Bagian 3.3)

![Zoom-In](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Zoom-In%20(0-3%20detik)_Segmen-Pertama-Setiap-Set.png)

**Apa yang ditampilkan:** 5 subplot yang menampilkan hanya **3 detik pertama** dari setiap set.

**Kegunaan:**
- Memperbesar detail sinyal sehingga **morfologi gelombang individual** (bentuk, frekuensi, keteraturan) dapat diamati.
- Berguna untuk mengidentifikasi **pola ritmis, spike, dan artefak**.

**Indikasi:**
- Pada resolusi temporal yang lebih tinggi, terlihat bahwa Set S memiliki **gelombang reguler berfrekuensi rendah dan amplitudo tinggi** (tipikal kejang *tonic-clonic*).
- Set Z dan O menunjukkan campuran osilasi yang lebih acak (*stochastic*).
- Set N dan F memiliki aktivitas *spike-and-wave* sesekali yang merupakan penanda interiktal (antar-kejang).

---

## 4. 3 Segmen Representatif per Set — ke-1, ke-50, ke-100 (Bagian 3.4)

![3 Segmen per Set](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/3-Segmen-Representatif-per-Set_(ke-1,ke-50,ke-100).png)

**Apa yang ditampilkan:** Grid 5×3 subplot; baris = set (Z, O, N, F, S), kolom = segmen ke-1, ke-50, ke-100.

**Kegunaan:**
- Memeriksa **konsistensi intra-set** — apakah pola sinyal seragam di seluruh 100 segmen per set, atau ada variasi besar.
- Mendeteksi potensi **outlier** atau segmen yang tidak representatif.

**Indikasi:**
- Jika ketiga segmen dalam satu baris terlihat mirip → set tersebut **konsisten/stabil**.
- Jika ada segmen yang sangat berbeda → kemungkinan ada **variabilitas subjek** atau **artefak perekaman**.

---

## 5. Statistik Deskriptif per Set (Bagian 4.1) — Output Teks

**Output berupa tabel teks** yang menampilkan untuk setiap set (Z, O, N, F, S):

| Metrik | Dihitung dari | Kegunaan | Indikasi |
|--------|--------------|----------|----------|
| **Mean amplitudo** | Rata-rata nilai semua titik data | Mengukur **DC offset** / nilai tengah sinyal | Nilai mendekati 0 = sinyal terkalibrasi baik; jauh dari 0 = ada offset DC |
| **Std Dev** | Simpangan baku | Mengukur **variabilitas/dispersi** amplitudo | Nilai tinggi = sinyal berfluktuasi besar (misal Set S); rendah = sinyal lebih stabil |
| **Range** | Max − Min | Mengukur **rentang puncak-ke-puncak** | Set S diharapkan memiliki range tertinggi (amplitudo kejang sangat besar) |
| **RMS** (Root Mean Square) | √(mean(x²)) | Mengukur **energi efektif** sinyal; analog dengan "volume" sinyal | RMS tinggi = sinyal mengandung lebih banyak energi; berguna untuk membandingkan *power* antar kondisi |
| **Skewness** | Momen ketiga ternormalisasi | Mengukur **asimetri distribusi** amplitudo | ≈0 = simetris (Gaussian); positif = ekor kanan panjang; negatif = ekor kiri panjang |
| **Kurtosis** | Momen keempat ternormalisasi | Mengukur **ketajaman puncak** distribusi | >0 (*leptokurtic*) = banyak nilai ekstrem/spike; <0 (*platykurtic*) = distribusi datar |

---

## 6. Perbandingan Box Plot Antar Set (Bagian 4.2)

![Box Plot Statistik](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Perbandingan-Statistik-Deskriptif-Antar-Set.png)

**Apa yang ditampilkan:** 4 box plot (Mean, Std Dev, RMS, Range) masing-masing membandingkan distribusi 100 segmen dari setiap set.

**Kegunaan:**
- Memberikan **perbandingan distribusi statistik** antar set secara visual.
- Box plot menunjukkan **median, Q1, Q3, whisker, dan outlier**, sehingga lebih informatif daripada hanya rata-rata.

**Indikasi:**
- **Std Dev & RMS box** untuk Set S akan berada jauh lebih tinggi → konfirmasi energi sinyal kejang lebih besar.
- **Range** Set S juga signifikan lebih besar.
- Perbedaan yang jelas antar box menunjukkan bahwa fitur-fitur ini **berpotensi menjadi fitur klasifikasi** yang baik.

---

## 7. Histogram Distribusi Amplitudo — Segmen Pertama (Bagian 4.3)

![Histogram Distribusi](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Distribusi-Amplitudo_Segmen-Pertama-Setiap-Set.png)

**Apa yang ditampilkan:** 5 histogram terpisah, masing-masing menampilkan distribusi amplitudo 1 segmen dari setiap set, dengan garis merah menandai mean.

**Kegunaan:**
- Memeriksa **bentuk distribusi** amplitudo: apakah Gaussian, bimodal, skewed, dll.
- Membantu memahami **karakteristik statistik** yang mendasari sinyal.

**Indikasi:**
- Distribusi yang mendekati **Gaussian** (lonceng) menunjukkan sinyal yang lebih acak/stokastik (tipikal Set Z, O).
- Distribusi yang **lebih lebar/tersebar** menunjukkan variabilitas amplitudo yang besar (tipikal Set S).
- Distribusi **bimodal atau ekor panjang** dapat mengindikasikan adanya dua *state* dalam sinyal (misal, spike + baseline).

---

## 8. Overlay Histogram — Semua Set (Bagian 4.4)

![Overlay Histogram](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Distribusi-Amplitudo_Semua-Set(Overlay,Normalized).png)

**Apa yang ditampilkan:** Semua 5 distribusi amplitudo (dari seluruh segmen per set) ditumpuk dengan normalisasi densitas.

**Kegunaan:**
- Membandingkan **lebar dan bentuk distribusi** langsung satu sama lain.
- Normalisasi (`density=True`) memastikan perbandingan adil meskipun jumlah data berbeda.

**Indikasi:**
- Set S memiliki distribusi **paling lebar** (amplitudo tersebar dari sangat negatif ke sangat positif).
- Set Z dan O memiliki distribusi **paling sempit dan tinggi** (amplitudo terkonsentrasi di rentang kecil).
- Ini mengkonfirmasi bahwa sinyal kejang memiliki **variabilitas amplitudo yang jauh lebih besar**.

---

## 9. Spektrum Frekuensi (FFT) — Segmen Pertama (Bagian 5.1)

![FFT Spektrum](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Spektrum-Frekuensi(FFT)_Segmen-Pertama-Setiap-Set.png)

**Apa yang ditampilkan:** 5 subplot, masing-masing menampilkan magnitudo FFT dari 0–60 Hz, dengan band EEG ditandai warna latar:

| Band | Rentang | Warna |
|------|---------|-------|
| **Delta** | 0.5–4 Hz | Kuning |
| **Theta** | 4–8 Hz | Hijau |
| **Alpha** | 8–13 Hz | Biru |
| **Beta** | 13–30 Hz | Ungu |
| **Gamma** | 30–60 Hz | Merah |

**Kegunaan:**
- **Menguraikan sinyal dari domain waktu ke domain frekuensi** — menunjukkan komponen frekuensi apa saja yang menyusun sinyal.
- Mengidentifikasi **frekuensi dominan** pada setiap kondisi klinis.

**Indikasi:**
- **Set Z & O**: puncak dominan di band **Alpha (8-13 Hz)**, yang merupakan ritme normal otak saat istirahat.
- **Set S (kejang)**: puncak dominan bergeser ke **frekuensi rendah (Delta)**, karena aktivitas kejang didominasi oleh gelombang lambat berenergi tinggi.
- **Set N & F**: spektrum lebih merata dengan aktivitas di beberapa band, mencerminkan sinyal interiktal yang lebih kompleks.

---

## 10. Power Spectral Density (PSD) — Metode Welch (Bagian 5.2)

![PSD Rata-rata](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/PSD_Rata-rata_Perbandingan-Semua-Set.png)

**Apa yang ditampilkan:** 2 subplot:
1. **PSD skala linear** — menunjukkan kekuatan sinyal di setiap frekuensi (satuan: µV²/Hz)
2. **PSD skala logaritmik** — tampilan yang sama dalam skala log untuk melihat detail di frekuensi tinggi

Setiap garis adalah **rata-rata PSD dari seluruh 100 segmen** per set.

**Kegunaan:**
- PSD (via metode Welch) adalah **estimasi densitas spektral daya yang lebih stabil** dibanding FFT mentah, karena menggunakan teknik *windowing* dan *averaging*.
- Menghitung **berapa banyak energi/daya** sinyal yang terkandung di setiap frekuensi.

**Indikasi:**
- **Set S** memiliki PSD tertinggi di seluruh rentang, terutama di band Delta → **energi kejang sangat besar**.
- Pada **skala logaritmik**, detail di frekuensi tinggi (Beta, Gamma) lebih terlihat — Set S dan N/F menunjukkan pola berbeda dari Z/O.
- PSD digunakan sebagai dasar untuk menghitung **band power** (output berikutnya).

---

## 11. Analisis Band Power EEG — Semua Set (Bagian 5.3)

![Band Power](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Distribusi-Band-Power-EEG_Perbandingan-Semua-Set.png)

**Output teks:** Tabel persentase rata-rata band power per set.
**Output grafik:** 2 chart:
1. **Grouped bar chart**: membandingkan persentase setiap band antar set.
2. **Stacked bar chart**: menunjukkan komposisi total 100% per set.

**Kegunaan:**
- Mengkuantifikasi **distribusi energi sinyal** di seluruh 5 band EEG standard.
- Menentukan **band mana yang dominan** pada setiap kondisi klinis.

**Indikasi:**

| Set | Band Dominan | Interpretasi Klinis |
|-----|-------------|---------------------|
| **Z** (sehat, mata buka) | Alpha + Beta | Ritme alpha dominan saat relaks; beta aktif saat mata terbuka |
| **O** (sehat, mata tutup) | Alpha paling tinggi | Penutupan mata memperkuat ritme alpha (*alpha blocking* berkurang) |
| **N** (epilepsi, hipokampal) | Delta + Theta | Aktivitas frekuensi rendah interiktal di hipokampus |
| **F** (epilepsi, epileptogenik) | Delta + Theta | Zona epileptogenik menunjukkan aktivitas slow-wave abnormal |
| **S** (kejang) | Delta sangat dominan | Kejang epilepsi didominasi gelombang delta berenergi sangat tinggi |

---

## 12. Spektrogram (Time-Frequency) — Segmen Pertama (Bagian 6)

![Spektrogram](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Spektogram-Sinyal-EEG_Segmen-Pertama-Setiap-Set.png)

**Apa yang ditampilkan:** 5 heatmap warna; sumbu-x = waktu (detik), sumbu-y = frekuensi (Hz), warna = power dalam dB. Menggunakan skala warna *viridis* (kuning = power tinggi, ungu gelap = power rendah).

**Kegunaan:**
- Menunjukkan **bagaimana distribusi frekuensi berubah sepanjang waktu** — sesuatu yang tidak bisa dilihat dari FFT atau PSD biasa (yang merata-ratakan seluruh durasi).
- **Sangat penting** untuk mendeteksi onset dan offset kejang, perubahan *state* otak, dan transisi antar-fase.

**Indikasi:**
- **Set S**: terlihat **garis horizontal terang stabil** di frekuensi rendah, menandakan aktivitas kejang yang **konsisten sepanjang rekaman**.
- **Set Z & O**: distribusi power lebih merata dan berfluktuasi seiring waktu.
- **Set N & F**: mungkin menunjukkan *burst* intermiten di frekuensi tertentu (spike interiktal).

---

## 13. Moving Average (Window = 100 Sampel) — Bagian 7.2

![Moving Average](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Moving-Average(Window=100sampel).png)

**Apa yang ditampilkan:** 5 subplot, masing-masing menampilkan sinyal asli (transparan, tipis) dan garis **moving average** (tebal, merah muda) dengan *window* 100 sampel (≈ 0,576 detik).

**Kegunaan:**
- Moving average berfungsi sebagai **filter low-pass sederhana** yang menghaluskan fluktuasi cepat.
- Digunakan untuk memeriksa **stasioneritas sinyal** — apakah rata-rata lokal berubah seiring waktu atau tetap konstan.

**Indikasi:**
- Jika garis MA **tetap dekat nol** → sinyal **stasioner** (rata-rata konstan).
- Jika garis MA **bergeser naik-turun** secara signifikan → sinyal **non-stasioner** (ada *drift* atau perubahan kondisi).
- **Set S** kemungkinan menunjukkan fluktuasi MA yang besar, mencerminkan pola osilasi kejang berfrekuensi rendah.
- Set Z/O diharapkan memiliki MA yang relatif stabil mendekati 0.

---

## 14. Zero Crossing Rate (ZCR) — Bagian 7.3

![ZCR](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Gambar-gambar%20output/Zero-Crossing-Rate.png)

**Output grafik:** 2 chart:
1. **Box plot ZCR** per set
2. **Bar chart rata-rata ZCR** dengan *error bar* (std deviasi)

**Output teks:** Tabel statistik ZCR (Mean, Std, Min, Max) per set.

**Apa itu ZCR:** Jumlah per detik sinyal **melintasi garis nol** (berubah tanda dari positif ke negatif atau sebaliknya).

**Kegunaan:**
- ZCR adalah **proxy sederhana untuk frekuensi dominan** sinyal — sinyal berfrekuensi tinggi melintasi nol lebih sering.
- Berguna sebagai **fitur klasifikasi** yang mudah dihitung.

**Indikasi:**

| Set | ZCR Diharapkan | Alasan |
|-----|---------------|--------|
| **Z, O** | Sedang–tinggi | Campuran frekuensi alpha dan beta |
| **N, F** | Tinggi | Sinyal intrakranial cenderung memiliki aktivitas berfrekuensi tinggi |
| **S** | **Rendah** | Kejang didominasi gelombang lambat (delta) → lebih sedikit crossing nol |

> [!IMPORTANT]
> ZCR rendah pada Set S menjadi **pembeda kunci** dari set lain dan merupakan indikator kuat bahwa sinyal didominasi oleh frekuensi rendah (kejang).

---

## 15. Ringkasan & Kesimpulan (Bagian 8) — Output Teks

**Apa yang ditampilkan:** Tabel ringkasan teks yang mengkompilasi semua hasil kuantitatif:
1. Informasi dataset (5 set, 100 segmen, 4.097 titik/segmen, 173,61 Hz)
2. Statistik deskriptif per set (Mean, Std Dev, Range, RMS)
3. Band power rata-rata (%) per set
4. ZCR per set
5. Kesimpulan naratif

**Kegunaan:**
- Menjadi **referensi ringkas tunggal** yang menggabungkan semua temuan.
- Mempermudah **penarikan kesimpulan akhir** tanpa harus meninjau ulang setiap grafik.

**Indikasi/Kesimpulan utama:**
- Sinyal EEG dari **5 kondisi berbeda** menunjukkan **perbedaan signifikan** dalam domain waktu maupun frekuensi.
- **Set S (kejang)** paling berbeda secara mencolok: amplitudo besar, energi tinggi, ZCR rendah, dan dominasi band Delta.
- Perbedaan ini menjadi **dasar empiris** untuk pengembangan sistem deteksi/klasifikasi otomatis kejang epilepsi menggunakan sinyal EEG.
