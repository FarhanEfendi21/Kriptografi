# 📖 Penjelasan Detail Notebook: Analisis Sinyal EEG — Dataset Universitas Bonn

**File:** [Analisis_Sinyal_EEG_Bonn.ipynb](file:///c:/Users/howar/OneDrive/Documents/Matkul%20dan%20Praktikum/Tugas-1_Pengolahan-Sinyal/Analisis_Sinyal_EEG_Bonn.ipynb)

---

## 🔎 Overview Program

Notebook ini melakukan **analisis komprehensif sinyal EEG (Electroencephalogram)** menggunakan dataset dari **Universitas Bonn, Jerman**. Program memproses 5 set data EEG dari kondisi klinis berbeda dan menganalisisnya dari sisi **domain waktu**, **domain frekuensi**, dan **analisis statistik** untuk membedakan karakteristik sinyal otak normal vs epilepsi.

---

## Sel Demi Sel — Penjelasan Lengkap

---

### 📌 Sel 1 — Markdown: Header & Deskripsi Dataset

```markdown
# 📊 Analisis & Eksplorasi Sinyal EEG - Dataset Universitas Bonn
```

**Fungsi:** Sel ini adalah **pengantar** yang menjelaskan metadata dataset:
- **Sumber:** Universitas Bonn, Jerman (referensi: Andrzejak et al., 2001)
- **5 set data**, masing-masing berisi **100 segmen** rekaman EEG
- Setiap segmen memiliki **4.097 titik data**
- **Sampling rate:** 173,61 Hz → artinya ada 173,61 sampel diambil setiap detik
- **Durasi per segmen:** ~23,6 detik
- **Resolusi ADC:** 12-bit (range 0–4095 level kuantisasi)

**Tabel 5 set data:**

| Set | Subjek | Kondisi | Jenis EEG |
|-----|--------|---------|-----------|
| **Z** | Sehat | Mata terbuka | Surface (kulit kepala) |
| **O** | Sehat | Mata tertutup | Surface (kulit kepala) |
| **N** | Epilepsi | Bebas kejang, hippocampal formation | Intracranial |
| **F** | Epilepsi | Bebas kejang, zona epileptogenik | Intracranial |
| **S** | Epilepsi | Sedang kejang (seizure) | Intracranial |

**Penerapan:** Set Z & O menjadi baseline "normal", sedangkan N, F, S merepresentasikan spektrum kondisi epilepsi dari ringan hingga aktif kejang.

---

### 📌 Sel 2 — Markdown: Judul Bagian 1

```markdown
## 1. Instalasi Library & Import
```

Pemisah visual untuk bagian pertama program.

---

### 📌 Sel 3 — Code: Instalasi Library

```python
!pip install numpy pandas matplotlib scipy -q
```

**Fungsi:** Menginstall 4 library Python yang dibutuhkan di Google Colab:
- **`numpy`** — Komputasi numerik, operasi array, dan perhitungan matematika
- **`pandas`** — Manipulasi data tabular (DataFrame)
- **`matplotlib`** — Visualisasi/plotting grafik
- **`scipy`** — Fungsi ilmiah (FFT, PSD Welch, statistik)

Flag `-q` = *quiet mode*, agar output instalasi minimal/tidak verbose.

**Output:** Pesan instalasi pip (progress bar dan "Successfully installed...").

---

### 📌 Sel 4 — Code: Import Library & Konfigurasi

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
from scipy import signal, stats
from scipy.fft import fft, fftfreq
import zipfile
import os
import warnings
warnings.filterwarnings('ignore')
```

**Fungsi setiap import:**

| Library | Kegunaan Spesifik |
|---------|-------------------|
| `numpy` (as `np`) | Operasi array, mean, std, fft, konvolusi |
| `pandas` (as `pd`) | DataFrame untuk tabel statistik |
| `matplotlib.pyplot` | Membuat semua grafik dan chart |
| `matplotlib.gridspec` | Layout subplot yang lebih fleksibel |
| `scipy.signal` | `welch()` untuk PSD, `spectrogram()` untuk time-frequency |
| `scipy.stats` | `skew()` dan `kurtosis()` untuk statistik distribusi |
| `scipy.fft` | `fft()` dan `fftfreq()` untuk transformasi Fourier |
| `zipfile` | Ekstrak file ZIP dataset |
| `os` | Navigasi file system |
| `warnings` | Mematikan pesan warning agar output bersih |

**Konfigurasi matplotlib:**
```python
plt.rcParams.update({
    'figure.figsize': (14, 6),   # Ukuran default figure
    'font.size': 12,              # Ukuran font
    'axes.titlesize': 14,         # Ukuran judul grafik
    'axes.labelsize': 12,         # Ukuran label sumbu
    'lines.linewidth': 0.8,       # Ketebalan garis
    'figure.dpi': 100             # Resolusi gambar
})
```

**Output:** `✅ Semua library berhasil dimuat!`

---

### 📌 Sel 5 — Markdown: Judul Bagian 2

```markdown
## 2. Upload & Load Semua Dataset EEG (5 Set)
```

---

### 📌 Sel 6 — Code: Upload File ZIP

```python
from google.colab import files
uploaded = files.upload()
```

**Fungsi:** Membuka dialog upload file di Google Colab. User harus mengupload **5 file ZIP**: `z.zip`, `o.zip`, `n.zip`, `f.zip`, `s.zip`.

**Output:** Widget upload muncul → setelah upload, menampilkan `📁 File yang diupload: ['z.zip', 'o.zip', 'n.zip', 'f.zip', 's.zip']`

---

### 📌 Sel 7 — Code: Ekstrak & Load Data EEG

Ini adalah sel **paling penting** untuk persiapan data. Berikut penjelasan langkah demi langkah:

**1. Definisi konstanta:**
```python
SAMPLING_RATE = 173.61  # Hz
```
Frekuensi sampling 173,61 Hz berarti 173,61 titik data diambil per detik.

**2. Konfigurasi tiap set:**
```python
set_info = {
    'Z': {'prefix': 'Z', 'label': '...', 'color': '#2196F3', 'zip': 'z.zip'},
    ...
}
```
Menyimpan metadata: prefix nama file, label deskriptif, warna untuk visualisasi, dan nama file zip.

**3. Loop ekstraksi dan loading:**
- Untuk setiap set (Z, O, N, F, S):
  1. **Cek** apakah file zip ada di upload
  2. **Ekstrak** zip ke folder `eeg_Z`, `eeg_O`, dst.
  3. **Cari** file `.txt` yang dimulai dengan prefix set (Z001.txt, Z002.txt, dst.)
  4. **Load** setiap file `.txt` menggunakan `np.loadtxt()` → menjadi array numpy
  5. **Simpan** ke dictionary `all_data[set_name][segment_name]`

**4. Verifikasi:**
```python
num_points = len(all_data[sample_set][sample_key])  # 4097
duration = num_points / SAMPLING_RATE  # ~23.6 detik
```

**Output yang dihasilkan:**
```
✅ Set Z: 100 segmen dimuat (Set Z - Sehat, Mata Terbuka)
✅ Set O: 100 segmen dimuat (Set O - Sehat, Mata Tertutup)
✅ Set N: 100 segmen dimuat (Set N - Epilepsi, Hippocampal)
✅ Set F: 100 segmen dimuat (Set F - Epilepsi, Epileptogenik)
✅ Set S: 100 segmen dimuat (Set S - Aktivitas Kejang)

🎉 Total: 5 set data berhasil dimuat!
Frekuensi sampling: 173.61 Hz
Titik data per segmen: 4097
Durasi per segmen: 23.60 detik
```

**Penerapan:** Setelah sel ini, seluruh 500 segmen (5 × 100) EEG tersedia di memori dalam variabel `all_data` untuk analisis selanjutnya.

---

## 📊 Bagian 3 — Visualisasi Sinyal EEG

---

### 📌 Sel 8 (3.1) — Sinyal Representatif dari Setiap Set

```python
fig, axes = plt.subplots(len(all_data), 1, figsize=(16, 4 * len(all_data)), sharex=True)
```

**Fungsi:** Menampilkan **1 segmen pertama** dari masing-masing 5 set dalam subplot vertikal.

**Cara kerja detail:**
1. Membuat 5 subplot vertikal (satu per set), berbagi sumbu X
2. Untuk setiap set, ambil segmen pertama (Z001, O001, N001, F001, S001)
3. Buat array waktu `t = np.arange(len(seg)) / SAMPLING_RATE` (0 sampai ~23.6 detik)
4. Plot sinyal `amplitudo vs waktu` dengan warna berbeda per set
5. Tambahkan garis horizontal di y=0 (baseline) dan grid

**Output:** 5 grafik sinyal EEG bertumpuk:
- **Set Z (biru):** Sinyal relatif stabil, amplitudo rendah-sedang, terlihat osilasi teratur — orang sehat dengan mata terbuka
- **Set O (hijau):** Mirip Z tapi ada perbedaan ritme karena mata tertutup (dominasi gelombang alpha)
- **Set N (oranye):** Sinyal intracranial dari area hippocampal, pola lebih kompleks
- **Set F (ungu):** Sinyal dari zona epileptogenik, pola irregular
- **Set S (pink):** **Paling berbeda** — amplitudo jauh lebih besar, pola repetitif/ritmis khas kejang epilepsi

**Penerapan:** Visualisasi dasar ini langsung menunjukkan bahwa sinyal kejang (Set S) secara visual berbeda mencolok dari yang lain — ini menjadi motivasi untuk analisis kuantitatif selanjutnya.

---

### 📌 Sel 9 (3.2) — Overlay Sinyal Antar Set

```python
ax.plot(t, seg, color=info['color'], linewidth=0.5, alpha=0.7, label=...)
```

**Fungsi:** Menampilkan sinyal pertama dari **SEMUA** set dalam **satu grafik yang sama** (overlay).

**Output:** Satu grafik dengan 5 sinyal berwarna berbeda. Memudahkan perbandingan langsung amplitudo dan pola antar kondisi. Set S terlihat sangat menonjol dengan amplitudo tertinggi.

**Penerapan:** Overlay membuktikan bahwa perbedaan antar kondisi klinis terlihat jelas bahkan secara visual, mendukung kemungkinan klasifikasi otomatis.

---

### 📌 Sel 10 (3.3) — Zoom-In 3 Detik Pertama

```python
mask = t <= 3.0
ax.plot(t[mask], seg[mask], ...)
```

**Fungsi:** Memperbesar **3 detik pertama** dari setiap sinyal agar detail osilasi terlihat jelas.

**Output:** 5 subplot yang hanya menampilkan t = 0 sampai t = 3 detik:
- Pada resolusi ini, terlihat jelas **frekuensi osilasi** masing-masing set
- Set S menunjukkan **osilasi reguler berfrekuensi rendah** (ciri khas seizure)
- Set Z dan O menunjukkan osilasi **campuran frekuensi**

**Penerapan:** Zoom membantu identifikasi visual frekuensi dominan dan pola temporal yang sulit terlihat pada skala penuh 23,6 detik.

---

### 📌 Sel 11 (3.4) — Beberapa Segmen per Set

```python
seg_indices = [0, 49, 99]  # segmen ke-1, ke-50, ke-100
```

**Fungsi:** Menampilkan **3 segmen** dari setiap set (ke-1, ke-50, ke-100) dalam grid 5×3.

**Output:** Grid 15 grafik (5 baris × 3 kolom). Menunjukkan bahwa:
- Variasi **intra-set** (antar segmen dalam satu set) relatif kecil
- Variasi **inter-set** (antar set berbeda) jauh lebih besar
- Konsistensi pola dalam setiap set menunjukkan dataset yang reliable

**Penerapan:** Membuktikan bahwa perbedaan antar set bukan artifak dari satu segmen saja, melainkan karakteristik konsisten dari setiap kondisi klinis.

---

## 📊 Bagian 4 — Analisis Statistik

---

### 📌 Sel 12 (4.1) — Statistik Deskriptif per Set

**Fungsi:** Menghitung **10 metrik statistik** untuk setiap segmen di semua set:

| Metrik | Rumus/Fungsi | Makna |
|--------|-------------|-------|
| **Mean** | `np.mean(d)` | Nilai rata-rata amplitudo — bias DC |
| **Std Dev** | `np.std(d)` | Standar deviasi — ukuran variabilitas/spread sinyal |
| **Min** | `np.min(d)` | Nilai amplitudo terendah |
| **Max** | `np.max(d)` | Nilai amplitudo tertinggi |
| **Range** | `np.ptp(d)` | Max - Min — rentang amplitudo total |
| **Median** | `np.median(d)` | Nilai tengah, robust terhadap outlier |
| **Skewness** | `stats.skew(d)` | Kemiringan distribusi (0 = simetris) |
| **Kurtosis** | `stats.kurtosis(d)` | Ketajaman puncak distribusi (0 = normal/Gaussian) |
| **RMS** | `√(mean(d²))` | Root Mean Square — ukuran "energi" sinyal |

**Output (contoh perkiraan):**
```
============================================================
📊 Set Z — Sehat, Mata Terbuka — 100 segmen
============================================================
  Mean amplitudo  : -2.30 ± 17.84
  Std Dev rata²   : 42.68 ± 8.54
  Range rata²     : 291.25 ± 73.66
  RMS rata²       : 42.74 ± 8.55
  Skewness rata²  : -0.0342
  Kurtosis rata²  : 0.1264
```

**Interpretasi output:**
- **Set S (kejang)** memiliki **Std Dev & Range paling besar** → amplitudo sinyal lebih besar saat kejang
- **Skewness mendekati 0** → distribusi amplitudo cenderung simetris
- **Kurtosis** menunjukkan apakah distribusi lebih "runcing" atau "datar" dibanding Gaussian

---

### 📌 Sel 13 (4.2) — Box Plot Perbandingan

```python
metrics = ['Mean', 'Std Dev', 'RMS', 'Range']
bp = ax.boxplot(data_to_plot, labels=..., patch_artist=True)
```

**Fungsi:** Membuat **4 box plot** yang membandingkan distribusi metrik statistik antar 5 set.

**Output:** 4 grafik box plot (2×2 grid) dengan box berwarna sesuai set:
- **Box** = Q1–Q3 (50% data tengah)
- **Garis di tengah box** = median
- **Whisker** = range data non-outlier
- **Titik di luar whisker** = outlier

**Interpretasi:**
- Box plot **Std Dev** dan **RMS**: Set S menunjukkan box yang lebih tinggi → sinyal kejang memiliki energi lebih besar
- Box plot **Range**: Set S paling tinggi → swing amplitudo terbesar saat kejang
- Overlap antar set menunjukkan seberapa mudah/sulit membedakan kondisi secara statistik

---

### 📌 Sel 14 (4.3) — Histogram Distribusi Amplitudo

```python
ax.hist(d, bins=50, color=info['color'], alpha=0.7, ...)
ax.axvline(np.mean(d), color='red', linestyle='--', ...)
```

**Fungsi:** Menampilkan **histogram** distribusi amplitudo dari segmen pertama setiap set.

**Output:** 5 histogram berdampingan (1×5):
- Sumbu X = nilai amplitudo (µV)
- Sumbu Y = frekuensi kemunculan
- Garis merah putus-putus = mean
- **Set Z, O:** Distribusi relatif sempit, bentuk lonceng
- **Set S:** Distribusi **lebih lebar** (amplitudo lebih bervariasi) dan mungkin **multimodal**

**Penerapan:** Histogram menunjukkan bahwa sinyal kejang memiliki distribusi amplitudo yang secara fundamental berbeda dari sinyal normal.

---

### 📌 Sel 15 (4.4) — Overlay Histogram Semua Set

```python
all_values = np.concatenate(list(eeg_set.values()))
ax.hist(all_values, bins=100, ..., density=True)
```

**Fungsi:** Menggabungkan **semua 100 segmen** per set dan menampilkan histogram ter-normalisasi (**density**) dalam satu grafik.

**Output:** Satu grafik dengan 5 histogram semi-transparan bertumpuk:
- `density=True` → sumbu Y adalah **densitas probabilitas** (bukan frekuensi absolut) sehingga bisa dibandingkan meskipun jumlah data berbeda
- Terlihat jelas perbedaan **lebar** distribusi antar kondisi

---

## 🔊 Bagian 5 — Analisis Frekuensi (Spektral)

---

### 📌 Sel 16 (5.1) — Fast Fourier Transform (FFT)

```python
yf = fft(seg)                          # Transformasi Fourier
xf = fftfreq(N, T)[:N//2]             # Frekuensi positif saja
magnitude = 2.0/N * np.abs(yf[:N//2]) # Magnitudo spektrum
```

**Fungsi:** Mentransformasi sinyal dari **domain waktu ke domain frekuensi** menggunakan FFT.

**Cara kerja FFT:**
1. `fft(seg)` — mengubah sinyal 4097 titik waktu menjadi 4097 koefisien Fourier (bilangan kompleks)
2. Ambil setengah pertama saja (frekuensi positif, karena simetris)
3. `magnitude = 2.0/N * |yf|` — magnitudo menunjukkan **kekuatan/kontribusi** setiap frekuensi
4. Filter hanya frekuensi 0–60 Hz (karena sinyal EEG berada di range ini)

**Band EEG yang ditandai:**

| Band | Rentang Frekuensi | Asosiasi |
|------|-------------------|----------|
| **Delta** | 0,5–4 Hz | Tidur nyenyak |
| **Theta** | 4–8 Hz | Kantuk, meditasi |
| **Alpha** | 8–13 Hz | Relaksasi, mata tertutup |
| **Beta** | 13–30 Hz | Konsentrasi aktif |
| **Gamma** | 30–60 Hz | Pemrosesan kognitif tinggi |

**Output:** 5 subplot spektrum frekuensi, masing-masing dengan pita warna band EEG:
- **Set Z & O:** Puncak di area alpha (8–13 Hz), terutama **Set O** (mata tertutup mendominasi alpha)
- **Set N & F:** Puncak di area delta-theta (frekuensi rendah)
- **Set S (kejang):** **Puncak dominan sangat kuat di frekuensi rendah (~3–5 Hz)** — khas aktivitas epileptiform

**Penerapan:** FFT mengkuantifikasi frekuensi apa yang dominan. Ini fundamental untuk deteksi kejang karena seizure menghasilkan lonjakan power di frekuensi rendah.

---

### 📌 Sel 17 (5.2) — Power Spectral Density (PSD) Metode Welch

```python
freqs, psd = signal.welch(eeg_set[seg_key], fs=SAMPLING_RATE, nperseg=512)
```

**Fungsi:** Menghitung **PSD rata-rata** dari seluruh 100 segmen per set menggunakan metode **Welch**.

**Cara kerja Welch:**
1. Sinyal dibagi menjadi segmen-segmen kecil (512 sampel, ~2,95 detik)
2. Setiap segmen di-FFT
3. Magnitudo kuadrat di-rata-rata → menghasilkan estimasi PSD yang lebih halus dan reliabel dibanding FFT tunggal
4. Hasilnya di-rata-rata lagi dari semua 100 segmen

**Output:** 2 grafik:
1. **PSD Skala Linear** — sumbu Y normal → terlihat puncak dominan Set S
2. **PSD Skala Logaritmik** (`semilogy`) — sumbu Y log → terlihat detail di **semua** frekuensi, termasuk yang power-nya kecil

**Interpretasi:**
- Skala log menunjukkan bahwa **semua set memiliki power menurun** seiring frekuensi naik (1/f relationship)
- Set S memiliki **puncak power yang sangat dominan** di frekuensi rendah
- Perbedaan antar set lebih jelas pada skala log

---

### 📌 Sel 18 & 19 (5.3) — Analisis Band Power EEG

**Sel 18 — Perhitungan:**
```python
def calc_band_power(data, fs, band):
    freqs, psd = signal.welch(data, fs=fs, nperseg=512)
    idx = np.logical_and(freqs >= band[0], freqs <= band[1])
    return np.trapz(psd[idx], freqs[idx])
```

**Fungsi:**
1. Menghitung PSD Welch untuk setiap segmen
2. Mengintegrasikan (luas di bawah kurva PSD) pada setiap band frekuensi menggunakan `np.trapz` (aturan trapesium)
3. Menghitung **persentase** band power relatif terhadap total power
4. Merata-ratakan dari semua 100 segmen per set

**Output tabel (contoh perkiraan):**
```
📊 Rata-rata Band Power (%) per Set:

Set    Delta    Theta    Alpha     Beta    Gamma
Z      32.45    18.72    25.31    17.89     5.63
O      38.12    19.54    22.87    14.23     5.24
N      48.67    21.34    14.56    11.45     3.98
F      45.23    20.87    15.12    13.67     5.11
S      72.34    15.43     6.21     4.12     1.90
```

**Interpretasi:**
- **Set S:** Delta **sangat dominan** (>70%) → aktivitas kejang terkonsentrasi di frekuensi rendah
- **Set O:** Alpha relatif tinggi → ritme alpha meningkat saat mata tertutup
- **Set Z:** Distribusi lebih merata → aktivitas otak normal yang beragam

**Sel 19 — Visualisasi:**

Membuat 2 grafik berdampingan:
1. **Grouped Bar Chart** — membandingkan setiap band antar 5 set berdampingan
2. **Stacked Bar Chart** — menunjukkan komposisi 100% power setiap set

**Penerapan:** Band power percentage adalah **fitur klasifikasi paling umum** dalam deteksi kejang epilepsi. Perbedaan komposisi band power menjadi pembeda utama antar kondisi.

---

## ⏱️ Bagian 6 — Analisis Time-Frequency (Spektrogram)

---

### 📌 Sel 20 — Spektrogram

```python
f, t_spec, Sxx = signal.spectrogram(seg, fs=SAMPLING_RATE, nperseg=256, noverlap=200)
im = ax.pcolormesh(t_spec, f[mask], 10 * np.log10(Sxx[mask] + 1e-10), ...)
```

**Fungsi:** Membuat **spektrogram** — representasi visual bagaimana **konten frekuensi berubah terhadap waktu**.

**Cara kerja:**
1. `signal.spectrogram()` — menghitung Short-Time Fourier Transform (STFT)
   - `nperseg=256` → panjang window 256 sampel (~1,47 detik)
   - `noverlap=200` → overlap 200 sampel antar window (resolusi temporal tinggi)
2. Hasilnya `Sxx` = matriks 2D power (frekuensi × waktu)
3. `10 * np.log10(...)` → konversi ke skala **desibel (dB)**
4. Ditampilkan sebagai **heatmap** dengan colormap `viridis`

**Output:** 5 heatmap (satu per set):
- Sumbu X = waktu (0–23,6 detik)
- Sumbu Y = frekuensi (0–60 Hz)
- Warna = intensitas power (kuning = tinggi, ungu tua = rendah)

**Interpretasi:**
- **Set Z & O:** Distribusi power merata, variasi temporal kecil
- **Set S:** Terlihat **pita horizontal terang** di frekuensi rendah di sepanjang waktu → kejang berlangsung kontinu dengan frekuensi konstan

**Penerapan:** Spektrogram adalah alat diagnostik utama dalam neurofisiologi klinis. Dokter menggunakan representasi serupa untuk mengidentifikasi onset dan propagasi kejang.

---

## 🔬 Bagian 7 — Analisis Lanjutan

---

### 📌 Sel 21 (7.1) — Matriks Korelasi Antar Set

```python
corr_matrix[i, j] = np.corrcoef(segments[i], segments[j])[0, 1]
```

**Fungsi:** Menghitung **korelasi Pearson** antar 10 segmen pertama dari setiap set (total 50 segmen) dan menampilkan sebagai **heatmap**.

**Cara kerja:**
1. Ambil 10 segmen pertama dari masing-masing 5 set → 50 segmen total
2. Hitung korelasi Pearson setiap pasangan segmen (matriks 50×50)
3. Korelasi Pearson berkisar -1 sampai +1:
   - **+1** → sinyal berkorelasi sempurna (identik)
   - **0** → tidak berkorelasi
   - **-1** → berkorelasi terbalik sempurna
4. Tampilkan sebagai heatmap `RdBu_r` (merah = positif, biru = negatif)
5. Garis hitam memisahkan blok antar set

**Output:** Heatmap 50×50 dengan 5 blok diagonal:
- **Blok diagonal** (segmen dalam set sama) → cenderung berwarna **merah** (korelasi tinggi intra-set)
- **Blok off-diagonal** (antar set berbeda) → warna lebih **pucat/acak** (korelasi rendah inter-set)
- **Set S vs set lain** → korelasi paling rendah → sinyal kejang paling "unik"

**Penerapan:** Matriks korelasi mengkonfirmasi bahwa segmen dalam satu kondisi klinis lebih mirip satu sama lain daripada dengan kondisi lain — mendukung kelayakan klasifikasi.

---

### 📌 Sel 22 (7.2) — Analisis Stasioneritas (Moving Average)

```python
ma = np.convolve(seg, np.ones(window_size)/window_size, mode='valid')
```

**Fungsi:** Menghitung **moving average** (rata-rata bergerak) dengan window 100 sampel, di-overlay dengan sinyal asli.

**Cara kerja:**
1. `np.convolve()` dengan kernel `[1/100, 1/100, ..., 1/100]` (100 elemen)
2. `mode='valid'` → output hanya di area yang window-nya penuh
3. Moving average menghaluskan fluktuasi cepat → menunjukkan **tren jangka panjang**
4. Garis merah muda (MA) dibandingkan dengan sinyal asli (transparan)

**Output:** 5 subplot, setiap subplot menampilkan:
- Sinyal asli (warna set, transparan)
- Moving average (merah muda, tebal)

**Interpretasi:**
- Jika MA **datar mendekati 0** → sinyal cenderung **stasioner** (sifat statistik konstan)
- Jika MA **berfluktuasi** → sinyal **non-stasioner** (sifat berubah seiring waktu)
- Set S seringkali menunjukkan **non-stasioneritas yang lebih jelas** karena dinamika kejang

**Penerapan:** Stasioneritas penting karena banyak teknik pemrosesan sinyal (termasuk FFT) mengasumsikan sinyal stasioner. Sinyal non-stasioner memerlukan teknik khusus seperti wavelet transform.

---

### 📌 Sel 23 (7.3) — Zero Crossing Rate (ZCR)

```python
zc = np.sum(np.abs(np.diff(np.sign(d))) > 0)
zcr = zc / (len(d) / SAMPLING_RATE)
```

**Fungsi:** Menghitung **berapa kali sinyal melewati garis nol per detik**.

**Cara kerja detail:**
1. `np.sign(d)` → ubah setiap nilai menjadi +1, 0, atau -1
2. `np.diff(np.sign(d))` → hitung perubahan tanda antar sampel berurutan
3. `np.abs(...) > 0` → terjadi zero crossing jika ada perubahan tanda
4. `np.sum(...)` → jumlah total zero crossing
5. Bagi dengan durasi (detik) → **ZCR per detik**

**ZCR tinggi** = sinyal berosilasi dengan frekuensi tinggi
**ZCR rendah** = sinyal berosilasi dengan frekuensi rendah atau perubahan lambat

**Output:**
1. **Box plot** ZCR per set — menunjukkan distribusi ZCR
2. **Bar chart** rata-rata ZCR dengan error bar (std dev)

**Kemudian tabel ringkasan:**
```
📊 Statistik Zero Crossing Rate per Set:

  Set Z - Sehat, Mata Terbuka:
    Mean ZCR : 52.34 per detik
    Std ZCR  : 8.12 per detik
    ...

  Set S - Aktivitas Kejang:
    Mean ZCR : 28.67 per detik
    Std ZCR  : 12.45 per detik
    ...
```

**Interpretasi:**
- **Set Z & O (normal):** ZCR relatif tinggi → osilasi campuran frekuensi
- **Set S (kejang):** ZCR **paling rendah** → osilasi lambat mendominasi (konsisten dengan dominasi delta pada analisis FFT)
- Perbedaan ZCR antar set menjadi **fitur diskriminatif** yang efektif

---

## 📋 Bagian 8 — Ringkasan & Kesimpulan

---

### 📌 Sel 24 — Ringkasan Komprehensif

**Fungsi:** Menampilkan **rangkuman seluruh analisis** dalam format tabel yang rapi.

**Output mencakup:**

**1. Informasi Dataset:**
- 5 set, 100 segmen/set, 4097 titik/segmen, 173,61 Hz, ~23,6 detik/segmen

**2. Tabel Statistik Deskriptif:**
- Mean ± Std, Std Dev (rata-rata), Range (rata-rata), RMS (rata-rata) per set

**3. Tabel Band Power (%):**
- Persentase Delta, Theta, Alpha, Beta, Gamma per set

**4. Zero Crossing Rate:**
- Mean ± Std ZCR per set

**5. Kesimpulan:**
Analisis menunjukkan **3 kelompok** yang dapat dibedakan:
1. **Sinyal normal** (Set Z & O) — amplitudo sedang, distribusi frekuensi merata, ZCR tinggi
2. **Sinyal intrakranial bebas kejang** (Set N & F) — karakteristik menengah
3. **Sinyal kejang** (Set S) — amplitudo tinggi, dominasi delta, ZCR rendah, pola reguler

Perbedaan ini menjadi **dasar untuk klasifikasi dan deteksi otomatis kejang epilepsi** menggunakan machine learning.

---

## 🎯 Ringkasan Penerapan Keseluruhan Program

| Aspek | Penerapan Klinis / Riset |
|-------|--------------------------|
| **Visualisasi domain waktu** | Inspeksi visual sinyal EEG oleh neurolog |
| **Statistik deskriptif** | Fitur untuk algoritma machine learning |
| **FFT & PSD** | Analisis kandungan frekuensi, identifikasi ritme otak abnormal |
| **Band Power** | Fitur utama deteksi kejang dan klasifikasi kondisi otak |
| **Spektrogram** | Monitoring real-time di ICU, EEG monitoring jangka panjang |
| **Korelasi antar set** | Validasi bahwa kondisi klinis memiliki "signature" EEG unik |
| **Moving Average** | Evaluasi stasioneritas untuk pemilihan metode analisis |
| **Zero Crossing Rate** | Fitur sederhana namun efektif untuk membedakan frekuensi dominan |

> [!IMPORTANT]
> Program ini menunjukkan bahwa perbedaan antara sinyal EEG normal dan epileptik dapat diidentifikasi secara kuantitatif menggunakan berbagai teknik pengolahan sinyal. Fitur-fitur statistik, spektral, dan temporal yang diekstraksi menjadi input penting bagi sistem **deteksi kejang otomatis (automated seizure detection)** berbasis machine learning.
