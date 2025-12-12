// src/App.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Calendar,
  Server,
  Activity,
  Zap,
  Clock as ClockIcon,
} from 'lucide-react';

// Ganti IP sesuai server Anda
const SERVER_URL = 'http://172.18.242.215:5000';

function App() {
  const [status, setStatus] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [health, setHealth] = useState({
    esp32: 'TIDAK DIKETAHUI',
    raspi: 'TIDAK DIKETAHUI',
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [metrics, setMetrics] = useState({
    yolo_ms: null,
    rfid_total_ms: null,
    ws_latency_ms: null,
  });

  useEffect(() => {
    // ==============================
    // FETCH JADWAL HARI INI
    // ==============================
    const fetchTodaysSchedule = () => {
      axios
        .get(`${SERVER_URL}/todays_schedule`) 
        .then((res) => setSchedule(res.data))
        .catch((err) => {
          console.error('Error mengambil jadwal:', err);
          setSchedule([]);
        });
    };
    fetchTodaysSchedule();

    // ==============================
    // FETCH STATUS AWAL SISTEM 
    // ==============================
    const fetchInitialStatus = () => {
      const startTime = Date.now(); 
      
      axios
        .get(`${SERVER_URL}/api/initial_status`) 
        .then((res) => {
          const endTime = Date.now(); 
          const apiLatency = endTime - startTime; 

          if (res.data.health) {
            setHealth((prev) => ({...prev, ...res.data.health})); 
          }
          if (res.data.status) {
            setStatus(res.data.status);
          }
          // Mengisi Metrik Persisten
          setMetrics((prev) => ({ 
            ...prev, 
            yolo_ms: res.data.metrics?.yolo_ms ?? null,
            rfid_total_ms: res.data.metrics?.rfid_total_ms ?? null,
            ws_latency_ms: apiLatency.toFixed(0) 
          }));

        })
        .catch((err) => {
          console.error('Error fetching initial status:', err);
        });
    };
    fetchInitialStatus(); 

    // ==============================
    // SOCKET.IO
    // ==============================
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Terhubung ke server via WebSocket');
    });

    socket.on('update_status', (data) => {
      if (data.server_timestamp_ms) {
        const latency = Date.now() - data.server_timestamp_ms;
        setMetrics((prev) => ({
          ...prev,
          ws_latency_ms: latency.toFixed(0),
        }));
      }
      setStatus(data);
    });

    socket.on('update_metrics', (data) => {
      const { server_timestamp_ms, ...rest } = data;
      setMetrics((prev) => ({ ...prev, ...rest }));
    });

    socket.on('update_health', (data) => {
      setHealth((prev) => ({...prev, ...data}));
    });

    // Auto-refresh jadwal setiap 5 menit
    const scheduleTimer = setInterval(fetchTodaysSchedule, 5 * 60 * 1000);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      socket.disconnect();
      clearInterval(timer);
      clearInterval(scheduleTimer);
    };
  }, []);

  // ==============================
  // UI HELPERS
  // ==============================
  const getHealthClass = (healthStatus) => {
    if (healthStatus === 'ONLINE') return 'bg-green-500 ring-green-300';
    if (healthStatus === 'OFFLINE') return 'bg-red-500 ring-red-300';
    return 'bg-yellow-500 ring-yellow-300';
  };

  const getStatusBadgeClasses = () => {
    if (status.status_kelas === 'Sedang Mengajar') {
      return 'bg-green-100 text-green-700 border border-green-300';
    }
    if (status.status_kelas === 'Belum Mulai') {
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
    return 'bg-gray-100 text-gray-600 border border-gray-200';
  };

  // ==============================
  // LOGIKA STATUS JADWAL (UPDATED)
  // ==============================
  const getJadwalStatusBadge = (item) => {
      const statusIzin = item.status_izin;
      const waktuKeluar = item.waktu_keluar;
      const waktuMasuk = item.waktu_masuk;

      // 1. KELAS SELESAI (Sudah Tap Out)
      if (waktuKeluar) {
          const formattedKeluar = format(new Date(waktuKeluar), 'HH:mm');
          return { 
              class: 'bg-blue-100 text-blue-700 border border-blue-200 font-bold', 
              text: 'SELESAI', 
              detail: `Selesai: ${formattedKeluar}`
          };
      }
      
      // 2. SEDANG BERLANGSUNG (Sudah Tap In, Belum Tap Out)
      if (waktuMasuk && !waktuKeluar) {
          const formattedMasuk = format(new Date(waktuMasuk), 'HH:mm');
          return { 
              class: 'bg-green-500 text-white font-bold animate-pulse', 
              text: 'SEDANG BERLANGSUNG',
              detail: `Masuk: ${formattedMasuk}`
          };
      }

      // 3. STATUS IZIN / SAKIT (Data dari tabel izin)
      if (statusIzin) {
          const statusLower = statusIzin.toLowerCase();
          let colorClass = 'bg-yellow-100 text-yellow-700 border border-yellow-300';
          
          if (statusLower.includes('dibatalkan')) colorClass = 'bg-red-100 text-red-700 border border-red-300';
          if (statusLower.includes('sakit')) colorClass = 'bg-orange-100 text-orange-700 border border-orange-300';
          
          return { 
              class: `${colorClass} font-bold`, 
              text: statusIzin.toUpperCase(), 
              detail: item.keterangan_izin || ''
          };
      }

      // 4. DEFAULT: TERJADWAL (Belum mulai & Tidak ada izin)
      return { 
          class: 'bg-gray-100 text-gray-500 border border-gray-200 font-semibold', 
          text: 'TERJADWAL', 
          detail: 'Belum dimulai' 
      };
  };

  // ==============================
  // MAIN UI
  // ==============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4 sm:p-8 font-inter">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white rounded-2xl shadow-xl mb-8 sticky top-4 z-10 border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.3)]" />
            TMJ CCIT 5B
          </h1>
          <span className="text-gray-600 flex items-center text-sm">
            <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center mr-2 text-xs">
              <Calendar className="w-3 h-3" />
            </span>
            {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
          </span>
        </div>

        <div className="flex flex-col items-end space-y-2 text-right mt-4 sm:mt-0">
          <div className="flex flex-wrap justify-end space-x-2 text-sm font-medium">
            <span className="text-gray-600 flex items-center mr-1">
              <Server className="w-4 h-4 mr-1 text-gray-400" /> Status Sistem:
            </span>

            <span className={`px-4 py-1.5 rounded-full text-white font-semibold shadow-lg ring-2 ${getHealthClass(health.esp32)}`}>
              RFID: {health.esp32}
            </span>

            <span className={`px-4 py-1.5 rounded-full text-white font-semibold shadow-lg ring-2 ${getHealthClass(health.raspi)}`}>
              Kamera: {health.raspi}
            </span>
          </div>

          <div className="text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 inline mr-1" />
            {format(currentTime, 'HH:mm:ss')}
          </div>
        </div>
      </header>

      {/* GRID UTAMA */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STATUS KELAS */}
        <section className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
              </span>
              Status Kelas
            </h2>

            <div
              className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold ${getStatusBadgeClasses()}`}
            >
              <span className="w-2 h-2 rounded-full bg-current" />
              {status.status_kelas || 'Belum Mulai'}
            </div>

            {/* Hadir (UPDATED: Menampilkan strip '-' jika belum mulai) */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-8 flex flex-col items-center justify-center mb-5 mt-4">
              <div className="text-base font-semibold text-slate-500 mb-2">
                Hadir Saat Ini:
              </div>
              <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900">
                {status.status_kelas === 'Belum Mulai' ? '-' : (status.count_live ?? 0)}
              </div>
            </div>

            {/* Detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-blue-100 rounded-2xl px-5 py-4">
              <Info label="Mata Kuliah" value={status.status_kelas === 'Belum Mulai' ? null : status.nama_matkul} />
              <Info label="Dosen" value={status.status_kelas === 'Belum Mulai' ? null : status.nama_dosen} />
              <Info label="Jam Masuk" value={status.status_kelas === 'Belum Mulai' ? null : status.waktu_masuk} />
              <Info label="Jam Keluar" value={status.status_kelas === 'Belum Mulai' ? null : status.waktu_keluar} />
            </div>
          </div>

          {/* PERFORMA SISTEM */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mt-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" /> Performa Sistem
            </h3>

            <div className="grid grid-cols-3 gap-3">
                <PerformanceItem
                    title="Proses RFID"
                    subtitle="ESP32 Server"
                    value={metrics.rfid_total_ms}
                />
                <PerformanceItem
                    title="Deteksi YOLO"
                    subtitle="Raspberry Pi"
                    value={metrics.yolo_ms}
                />
                <PerformanceItem
                    title="Latensi Dash"
                    subtitle="Refresh Rate"
                    value={metrics.ws_latency_ms}
                />
            </div>
          </div>
        </section>

        {/* JADWAL */}
        <section className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <h2 className="text-2xl font-extrabold text-gray-900">Jadwal Kuliah</h2>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                Hari Ini
              </span>
            </div>

            <table className="min-w-full border-t text-sm">
              <thead>
                <tr className="bg-white">
                  <Th>Mata Kuliah</Th>
                  <Th>Waktu</Th>
                  <Th>Dosen</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {schedule.length > 0 ? (
                  schedule.map((item, i) => {
                    const { class: badgeClass, text: statusText, detail } = getJadwalStatusBadge(item);

                    return (
                      <tr key={item.id_jadwal || i} className="hover:bg-gray-50 transition-colors">
                        <Td>
                          <div className="font-semibold text-gray-900">
                            {item.nama_matkul || '-'}
                          </div>
                        </Td>
                        <Td>
                          <div className="font-mono font-bold text-gray-900">
                            {item.jam_mulai} - {item.jam_selesai}
                          </div>
                        </Td>
                        <Td>
                          {/* PERBAIKAN: Menghapus NIDN */}
                          <div className="font-medium text-gray-900">
                            {item.nama_dosen || '-'}
                          </div>
                        </Td>
                        <Td>
                            <span className={`inline-block px-3 py-1 text-[10px] sm:text-xs rounded-full shadow-sm tracking-wide ${badgeClass}`}>
                                {statusText}
                            </span>
                            {detail && (
                                <div className="text-[10px] text-gray-500 mt-1 italic">
                                    {detail}
                                </div>
                            )}
                        </Td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <Td colSpan={4}>
                        <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                            <Calendar className="w-10 h-10 mb-2 opacity-20" />
                            Tidak ada jadwal untuk hari ini.
                        </div>
                    </Td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="mt-8 text-center text-gray-400 text-xs">
        System v1.0 &bull; {format(currentTime, 'HH:mm:ss')}
      </footer>
    </div>
  );
}

// ==============================
// COMPONENT MINI
// ==============================
const Th = ({ children }) => (
  <th className="px-4 py-3 border-b text-left text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50">
    {children}
  </th>
);

const Td = ({ children, colSpan }) => (
  <td className="px-4 py-4 border-b align-top" colSpan={colSpan}>
    {children}
  </td>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">
      {label}
    </p>
    <p className="font-semibold text-gray-900 text-sm truncate">
        {value || '-'}
    </p>
  </div>
);

const PerformanceItem = ({ title, subtitle, value }) => {
  const numericValue = parseFloat(value);
  const isDisplayable = !isNaN(numericValue) && value !== null && value !== undefined;

  return (
    <div className="flex flex-col justify-center items-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-center hover:shadow-md transition-shadow">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{subtitle}</div>
      <div className="font-medium text-gray-700 mt-0.5 text-xs">{title}</div>
      <span className="font-black text-lg text-gray-900 mt-1">
        {isDisplayable ? `${numericValue.toFixed(0)}` : '-'}
        <span className="text-xs font-normal text-gray-400 ml-0.5">ms</span>
      </span>
    </div>
  );
};

export default App;
