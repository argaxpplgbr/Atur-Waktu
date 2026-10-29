# StudyFlow — Timer Belajar C# + Python

Aplikasi demo untuk mengatur sesi belajar. Frontend HTML/CSS/JavaScript memakai tema warna terinspirasi C# (ungu) dan Python (biru-kuning). ASP.NET Core di .NET 10 menjadi API utama; FastAPI di Python 3.14.6 memberi rekomendasi durasi fokus dari model Random Forest yang dilatih lokal menggunakan data sintetis.

> Rekomendasi model hanya untuk demonstrasi dan bukan klaim ilmiah tentang produktivitas.

## Jalankan di VS Code

Buka folder `logistics-delay-demo`, lalu jalankan dua terminal dan satu Live Server.

### Terminal 1 — Python

```powershell
cd python
py -3.14 -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Tidak perlu mengaktifkan `.venv`; cara ini menghindari kebijakan PowerShell yang memblokir skrip aktivasi. Tunggu layanan berjalan dan biarkan terminal tetap terbuka.

### Terminal 2 — .NET 10

```powershell
cd dotnet/Study.Api
dotnet run --urls http://localhost:5000
```

Biarkan terminal tetap terbuka. Jika `dotnet` belum dikenali, pasang .NET 10 SDK.

### Frontend

Di Explorer VS Code buka `frontend`, klik kanan `index.html` → **Open with Live Server**. Kalau ekstensi belum terpasang, pasang **Live Server** terlebih dahulu.

Pilih mata pelajaran, masukkan waktu yang tersedia, atur energi dan gangguan, lalu tekan **Buat sesi fokus**. Setelah rekomendasi tampil, tekan **Mulai fokus**. Timer dapat dijeda dan di-reset.

## Workflow

Browser → `POST /api/study/recommend` pada C# → C# memvalidasi input dan memanggil Python `POST /recommend` → model mengusulkan durasi fokus → jawaban kembali ke UI → timer berjalan di browser.

Rentang validasi: waktu tersedia 10–180 menit, energi dan tingkat gangguan masing-masing 1–5. Data sintetis dibuat dan model dilatih ulang ketika Python mulai. Timer berjalan di browser; C# dan Python menangani rekomendasi durasi.


## Design dan Code

untuk design pake designpakeai.com
dan untuk code untuk di c# dan python menggunakan AI asistent codex