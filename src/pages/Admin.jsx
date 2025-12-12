// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import {
  BASE, getUsernameFromToken,
  getDosenList, createDosen, updateDosen, deleteDosen,
  getMatkulList, createMatkul, updateMatkul, deleteMatkul,
  getJadwalList, createJadwal, updateJadwal, deleteJadwal,
  getIzinList, createIzin, updateIzin, deleteIzin,
  getAbsensiDosenList, createAbsensiDosen, updateAbsensiDosen, deleteAbsensiDosen
} from "../services/api";
import './Admin.css';

export default function Admin() {
  // UI / tabs
  const [activeTab, setActiveTab] = useState("jadwal");

  // auth username
  const [username, setUsername] = useState("");

  // global
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // DOSEN state
  const [dosenList, setDosenList] = useState([]);
  const [dosenForm, setDosenForm] = useState({ nama_dosen: "", uid_kartu: "" });
  const [dosenEditId, setDosenEditId] = useState(null);

  // MATKUL state
  const [matkulList, setMatkulList] = useState([]);
  const [matkulForm, setMatkulForm] = useState({ kode_matkul: "", nama_matkul: "" });
  const [matkulEditId, setMatkulEditId] = useState(null);

  // JADWAL state
  const [jadwalList, setJadwalList] = useState([]);
  const [jadwalForm, setJadwalForm] = useState({ id_dosen: "", id_matkul: "", tanggal: "", jam_mulai: "", jam_selesai: "" });
  const [jadwalEditId, setJadwalEditId] = useState(null);

  // IZIN state
  const [izinList, setIzinList] = useState([]);
  const [izinForm, setIzinForm] = useState({ id_jadwal: "", tanggal: "", jenis: "", keterangan: "" });
  const [izinEditId, setIzinEditId] = useState(null);

  // ABSENSI state (Mode CRUD Manual)
  const [absensiList, setAbsensiList] = useState([]);
  const [absensiForm, setAbsensiForm] = useState({ id_jadwal: "", uid_kartu: "", waktu_masuk: "", waktu_keluar: "", status_kehadiran: "", keterangan: "" });
  const [absensiEditId, setAbsensiEditId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [absensiPage, setAbsensiPage] = useState(1);
  const [absensiTotal, setAbsensiTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // filter
  const [filterDosenId, setFilterDosenId] = useState("");

  // detail absensi view
  const [detailAbsensi, setDetailAbsensi] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // sidebar toggle
  const [sidebarToggled, setSidebarToggled] = useState(false);

  // helper
  function showError(msg) {
    setErrorMsg(msg);
    setTimeout(()=>setErrorMsg(""), 4000);
  }

  function showSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(()=>setSuccessMsg(""), 4000);
  }

  // ---------------- load functions ----------------
  async function loadDosen() {
    setLoading(true);
    try {
      const res = await getDosenList("", 1, 200);
      setDosenList(res.data || []);
    } catch (e) {
      console.error(e);
      showError(e.message || "Gagal load dosen");
    } finally {
      setLoading(false);
    }
  }

  async function loadMatkul() {
    setLoading(true);
    try {
      const res = await getMatkulList("", 1, 200);
      setMatkulList(res.data || []);
    } catch (e) {
      console.error(e);
      showError("Gagal load matkul");
    } finally {
      setLoading(false);
    }
  }

  async function loadJadwal() {
    setLoading(true);
    try {
      const res = await getJadwalList(searchTerm, filterDosenId ? parseInt(filterDosenId) : null, 1, 200);
      setJadwalList(res.data || []);
    } catch (e) {
      console.error(e);
      showError("Gagal load jadwal");
    } finally {
      setLoading(false);
    }
  }

  async function loadIzin() {
    setLoading(true);
    try {
      const res = await getIzinList(1, 200);
      setIzinList(res.data || []);
    } catch (e) {
      console.error(e);
      showError("Gagal load izin");
    } finally {
      setLoading(false);
    }
  }

  async function loadAbsensi(q = searchTerm, tanggal = null, page = absensiPage, size = entriesPerPage) {
    setLoading(true);
    try {
      const res = await getAbsensiDosenList(q, tanggal, page, size);
      setAbsensiList(res.data || []);
      setAbsensiTotal(res.total || 0);
      setAbsensiPage(res.page || page);
    } catch (e) {
      console.error(e);
      showError("Gagal load absensi");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- CRUD handlers ----------------
  // DOSEN
  async function submitDosen(e) {
    e?.preventDefault?.();
    try {
      if (!dosenForm.nama_dosen || !dosenForm.uid_kartu) {
        showError("Isi semua field dosen");
        return;
      }
      if (dosenEditId) {
        await updateDosen(dosenEditId, dosenForm);
        showSuccess("Dosen berhasil diperbarui");
      } else {
        await createDosen(dosenForm);
        showSuccess("Dosen berhasil ditambahkan");
      }
      setDosenForm({ nama_dosen: "", uid_kartu: "" });
      setDosenEditId(null);
      await loadDosen();
      await loadJadwal();
    } catch (e) {
      console.error(e);
      showError(e.message || "Gagal simpan dosen");
    }
  }

  async function removeDosen(id) {
    if(!window.confirm("Hapus dosen?")) return;
    try{
      await deleteDosen(id);
      await loadDosen();
      showSuccess("Dosen berhasil dihapus");
    } catch(e){
      showError("Gagal hapus dosen");
    }
  }

  // MATKUL
  async function submitMatkul(e) {
    e?.preventDefault?.();
    try {
      if (!matkulForm.kode_matkul || !matkulForm.nama_matkul) {
        showError("Isi semua field matkul");
        return;
      }
      if (matkulEditId) {
        await updateMatkul(matkulEditId, matkulForm);
        showSuccess("Mata kuliah berhasil diperbarui");
      } else {
        await createMatkul(matkulForm);
        showSuccess("Mata kuliah berhasil ditambahkan");
      }
      setMatkulForm({ kode_matkul: "", nama_matkul: "" });
      setMatkulEditId(null);
      await loadMatkul();
      await loadJadwal();
    } catch (e) {
      console.error(e);
      showError("Gagal simpan matkul");
    }
  }

  async function removeMatkul(id) {
    if(!window.confirm("Hapus mata kuliah?")) return;
    try{
      await deleteMatkul(id);
      await loadMatkul();
      showSuccess("Mata kuliah berhasil dihapus");
    } catch(e){
      showError("Gagal hapus matkul");
    }
  }

  // JADWAL
  async function submitJadwal(e) {
    e?.preventDefault?.();
    try {
      if (!jadwalForm.id_dosen || !jadwalForm.id_matkul || !jadwalForm.tanggal || !jadwalForm.jam_mulai || !jadwalForm.jam_selesai) {
        showError("Lengkapi field jadwal");
        return;
      }
      if (jadwalEditId) {
        await updateJadwal(jadwalEditId, jadwalForm);
        showSuccess("Jadwal berhasil diperbarui");
      } else {
        await createJadwal(jadwalForm);
        showSuccess("Jadwal berhasil ditambahkan");
      }
      setJadwalForm({ id_dosen: "", id_matkul: "", tanggal: "", jam_mulai: "", jam_selesai: "" });
      setJadwalEditId(null);
      await loadJadwal();
    } catch (e) {
      console.error(e);
      showError(e.message || "Gagal simpan jadwal (cek bentrok)");
    }
  }

  async function removeJadwal(id) {
    if(!window.confirm("Hapus jadwal?")) return;
    try{
      await deleteJadwal(id);
      await loadJadwal();
      showSuccess("Jadwal berhasil dihapus");
    } catch(e){
      showError("Gagal hapus jadwal");
    }
  }

  // IZIN (DIPERBAIKI: Reload semua data terkait)
  async function submitIzin(e) {
    e?.preventDefault?.();
    try {
      if (!izinForm.id_jadwal || !izinForm.tanggal || !izinForm.jenis) {
        showError("Lengkapi field izin");
        return;
      }
      
      const isJadwalValid = jadwalList.some(j => j.id_jadwal == izinForm.id_jadwal);
      if (!isJadwalValid) {
        showError("ID Jadwal tidak valid atau tidak ditemukan.");
        return;
      }
      
      if (izinEditId) {
        await updateIzin(izinEditId, izinForm);
        showSuccess("Izin berhasil diperbarui. Absensi terkait di-update.");
      } else {
        await createIzin(izinForm);
        showSuccess("Izin berhasil ditambahkan. Absensi Dosen otomatis dibuat.");
      }
      
      setIzinForm({ id_jadwal: "", tanggal: "", jenis: "", keterangan: "" });
      setIzinEditId(null);
      
      // Reload semua data yang terpengaruh
      await loadIzin();
      await loadJadwal(); 
      await loadAbsensi(searchTerm, null, absensiPage, entriesPerPage); 
    } catch (e) {
      console.error(e);
      showError(e.message || "Gagal simpan izin");
    }
  }

  async function removeIzin(id) {
    if(!window.confirm("Hapus izin? Ini akan menghapus record Absensi otomatis terkait.")) return;
    try{
      await deleteIzin(id);
      showSuccess("Izin dan record Absensi terkait berhasil dihapus.");
      
      // Reload semua data yang terpengaruh
      await loadIzin();
      await loadJadwal(); 
      await loadAbsensi(searchTerm, null, absensiPage, entriesPerPage);
    } catch(e){
      showError(e.message || "Gagal hapus izin");
    }
  }

  // ABSENSI (Hanya CRUD EDIT dan DELETE)
  async function submitAbsensi(e) {
    e?.preventDefault?.();
    try {
      const body = { ...absensiForm };
      
      // Mengubah format datetime-local ke ISO String yang diharapkan backend
      if (body.waktu_masuk) body.waktu_masuk = body.waktu_masuk + ":00";
      if (body.waktu_keluar) body.waktu_keluar = body.waktu_keluar + ":00";

      if (!body.id_jadwal || !body.uid_kartu || !body.waktu_masuk || !body.status_kehadiran) {
        showError("Lengkapi field absensi");
        return;
      }
      
      if (!absensiEditId) {
        // Mencegah Create Manual (POST)
        showError("Fungsi tambah absensi manual telah dinonaktifkan. Silakan gunakan Edit atau Hapus.");
        return;
      }
      
      // Mode Edit (PUT)
      await updateAbsensiDosen(absensiEditId, body);
      showSuccess("Absensi berhasil diperbarui");
      
      // Reset form
      setAbsensiForm({
        id_jadwal: "",
        uid_kartu: "",
        waktu_masuk: "",
        waktu_keluar: "",
        status_kehadiran: "",
        keterangan: ""
      });
      setAbsensiEditId(null);
      await loadAbsensi(searchTerm, null, 1, entriesPerPage);
    } catch (e) {
      console.error(e);
      showError("Gagal simpan absensi");
    }
  }

  async function removeAbsensi(id) {
    if(!window.confirm("Hapus absensi?")) return;
    try{
      await deleteAbsensiDosen(id);
      await loadAbsensi(searchTerm, null, 1, entriesPerPage);
      showSuccess("Absensi berhasil dihapus");
    } catch(e){
      showError("Gagal hapus absensi");
    }
  }

  // Handle Edit Absensi Manual
  const handleEditAbsensi = (a) => {
      // Data yang dibutuhkan untuk update manual dari admin
      setAbsensiEditId(a.id_absensi);
      setAbsensiForm({
          id_jadwal: a.id_jadwal,
          uid_kartu: a.uid_kartu,
          // Mengubah format ISO menjadi YYYY-MM-DDTHH:MM untuk input datetime-local
          waktu_masuk: a.waktu_masuk ? a.waktu_masuk.substring(0, 16) : "",
          waktu_keluar: a.waktu_keluar ? a.waktu_keluar.substring(0, 16) : "",
          status_kehadiran: a.status_kehadiran || "",
          keterangan: a.keterangan || ""
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  // detail absensi
  function openDetail(a) {
    setDetailAbsensi(a);
    setDetailVisible(true);
    setTimeout(()=>{
      const el = document.getElementById("absensi-dosen-card");
      if(el) el.scrollIntoView({behavior:"smooth"});
    },100);
  }

  function closeDetail() {
    setDetailVisible(false);
    setDetailAbsensi(null);
  }

  // handle search
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === "absensi") {
        loadAbsensi(searchTerm, null, 1, entriesPerPage);
      } else if (activeTab === "jadwal") {
        loadJadwal();
      }
    }
  }

  // handle entries per page change
  const handleEntriesPerPageChange = (value) => {
    const newSize = parseInt(value);
    setEntriesPerPage(newSize);
    if (activeTab === "absensi") {
      loadAbsensi(searchTerm, null, 1, newSize);
    }
  }

  // handle pagination
  const handlePageChange = (page) => {
    setAbsensiPage(page);
    if (activeTab === "absensi") {
      loadAbsensi(searchTerm, null, page, entriesPerPage);
    }
  }

  // tab details
  const tabDetails = {
    'jadwal': 'Kelola jadwal, dosen, mata kuliah, izin, dan waktu kelas. Kolom Status menampilkan apakah jadwal dicover oleh Izin/Pembatalan.',
    'dosen': 'Kelola data dosen dan UID kartu.',
    'matkul': 'Kelola kode dan nama mata kuliah.',
    'izin': 'Buat dan kelola permohonan izin/pembatalan kelas. Permintaan Izin akan secara otomatis tercatat di Absensi.',
    'absensi': 'Kelola (Edit/Hapus) dan lihat rekapitulasi lengkap data absensi dosen, termasuk yang berasal dari Izin.' 
  };

  // init loads & username
  useEffect(()=> {
    setUsername(getUsernameFromToken());
    loadDosen();
    loadMatkul();
    loadJadwal();
    loadIzin();
    // eslint-disable-next-line
  }, []);

  useEffect(()=> {
    // when switch tab load corresponding data
    if (activeTab === "jadwal") loadJadwal();
    if (activeTab === "dosen") loadDosen();
    if (activeTab === "matkul") loadMatkul();
    if (activeTab === "izin") loadIzin();
    if (activeTab === "absensi") loadAbsensi(searchTerm, null, absensiPage, entriesPerPage);
    // eslint-disable-next-line
  }, [activeTab]);

  // render pagination
  const renderPagination = () => {
    const totalPages = Math.ceil(absensiTotal / entriesPerPage);
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (absensiPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (absensiPage + 2 >= totalPages) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = absensiPage - 2; i <= absensiPage + 2; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return (
      <nav aria-label="Absensi pagination">
        <ul className="pagination pagination-sm mb-0" id="absensi-pagination">
          <li className={`page-item ${absensiPage <= 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => absensiPage > 1 && handlePageChange(absensiPage - 1)}
            >
              &lt;
            </button>
          </li>

          {pages.map((page, idx) => (
            <li
              key={idx}
              className={`page-item ${page === '...' ? 'disabled' : ''} ${page === absensiPage ? 'active' : ''}`}
            >
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          <li className={`page-item ${absensiPage >= totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => absensiPage < totalPages && handlePageChange(absensiPage + 1)}
            >
              &gt;
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  

  return (
    <div id="wrapper-admin" className={`d-flex ${sidebarToggled ? 'toggled' : ''}`}>
      {/* Sidebar */}
      <div id="sidebar-wrapper" className="text-light border-end border-secondary">
        <div className="sidebar-heading px-3 py-4 text-white fs-5 fw-bold bg-primary bg-gradient">
          <i className="bi bi-code-square me-2"></i> TMJ CCIT 5B
        </div>
        <div className="list-group list-group-flush">
          <button
            className={`list-group-item list-group-item-action ${activeTab === "jadwal" ? "active" : "list-group-item-dark"}`}
            onClick={() => setActiveTab("jadwal")}
          >
            <i className="bi bi-calendar-check me-2"></i> Jadwal
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeTab === "dosen" ? "active" : "list-group-item-dark"}`}
            onClick={() => setActiveTab("dosen")}
          >
            <i className="bi bi-people-fill me-2"></i> Dosen
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeTab === "matkul" ? "active" : "list-group-item-dark"}`}
            onClick={() => setActiveTab("matkul")}
          >
            <i className="bi bi-book-fill me-2"></i> Mata Kuliah
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeTab === "izin" ? "active" : "list-group-item-dark"}`}
            onClick={() => setActiveTab("izin")}
          >
            <i className="bi bi-file-earmark-person-fill me-2"></i> Izin
          </button>
          <button
            className={`list-group-item list-group-item-action ${activeTab === "absensi" ? "active" : "list-group-item-dark"}`}
            onClick={() => setActiveTab("absensi")}
          >
            <i className="bi bi-list-check me-2"></i> Absensi
          </button>
        </div>
        <div className="sidebar-footer text-center text-muted small p-3 position-absolute bottom-0 w-100">
          Version 1.0
        </div>
      </div>

      {/* Main Content */}
      <div id="page-content-wrapper">
        {/* Navbar */}
        <nav className="navbar navbar-expand navbar-light bg-white border-bottom shadow-sm sticky-top">
          <div className="container-fluid">
            <button
              className="btn btn-sm btn-outline-secondary"
              id="sidebarToggle"
              type="button"
              onClick={() => setSidebarToggled(!sidebarToggled)}
            >
              <i className="bi bi-list fs-5"></i>
            </button>
          </div>
        </nav>

        <div className="container-fluid px-4 py-4">
          {/* Header */}
          <h1 className="h3 text-dark"><i className="bi bi-person-circle me-2 text-primary"></i> Selamat Datang {username || "User"}</h1>
          <p className="text-muted mb-3" id="sub-header-text">{tabDetails[activeTab] || "Kelola jadwal, dosen, mata kuliah, izin, dan data absensi."}</p>

          {/* Filter Row */}
          {(activeTab === "jadwal" || activeTab === "absensi") && (
            <div className="card mb-4 filter-row">
              <div className="card-body">
                <div className="row g-2 align-items-center justify-content-start">
                  <div className="col-md-4">
                    <label className="form-label mb-0">Filter Nama Dosen:</label>
                    <select
                      className="form-select"
                      value={filterDosenId}
                      onChange={(e) => setFilterDosenId(e.target.value)}
                    >
                      <option value="">Pilih Dosen...</option>
                      {dosenList.map(d => (
                        <option key={d.id_dosen} value={d.id_dosen}>{d.nama_dosen}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label mb-0 invisible">Tombol</label>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => {
                        if (activeTab === "jadwal") loadJadwal();
                        if (activeTab === "absensi") loadAbsensi(searchTerm, null, 1, entriesPerPage); 
                      }}
                    >
                      <i className="bi bi-search me-2"></i>Cari
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div id="content-container">
            {/* JADWAL TAB */}
            {activeTab === "jadwal" && (
                <div className="content-tab active">
                    {/* Form Tambah/Edit Jadwal */}
                    <div className="card mb-4 shadow-sm border-primary">
                        <div className="card-header bg-primary text-white">
                            <i className="bi bi-plus-square-fill me-2"></i>
                            {jadwalEditId ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                        </div>
                        <div className="card-body">
                            <form onSubmit={submitJadwal}>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Nama Dosen</label>
                                            <select
                                                className="form-select"
                                                value={jadwalForm.id_dosen}
                                                onChange={(e) => setJadwalForm({...jadwalForm, id_dosen: e.target.value})}
                                                required
                                            >
                                                <option value="">Pilih Dosen</option>
                                                {dosenList.map(d => (
                                                    <option key={d.id_dosen} value={d.id_dosen}>{d.nama_dosen}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Nama Matkul</label>
                                            <select
                                                className="form-select"
                                                value={jadwalForm.id_matkul}
                                                onChange={(e) => setJadwalForm({...jadwalForm, id_matkul: e.target.value})}
                                                required
                                            >
                                                <option value="">Pilih Matkul</option>
                                                {matkulList.map(m => (
                                                    <option key={m.id_matkul} value={m.id_matkul}>{m.nama_matkul}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-3">
                                            <label className="form-label">Tanggal</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={jadwalForm.tanggal}
                                                onChange={(e) => setJadwalForm({...jadwalForm, tanggal: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Jam Mulai</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                value={jadwalForm.jam_mulai}
                                                onChange={(e) => setJadwalForm({...jadwalForm, jam_mulai: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="mb-3">
                                            <label className="form-label">Jam Selesai</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                value={jadwalForm.jam_selesai}
                                                onChange={(e) => setJadwalForm({...jadwalForm, jam_selesai: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3">
                                    <button className="btn btn-success me-2" type="submit">
                                        <i className="bi bi-save me-2"></i>
                                        {jadwalEditId ? "Update Jadwal" : "Simpan Jadwal"}
                                    </button>
                                    {jadwalEditId && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setJadwalEditId(null);
                                                setJadwalForm({ id_dosen: "", id_matkul: "", tanggal: "", jam_mulai: "", jam_selesai: "" });
                                            }}
                                        >
                                            Batal
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Tabel Jadwal */}
                    <div className="card mb-4 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div><i className="bi bi-list-ul me-2"></i> Data Jadwal Kelas</div>
                            <small className="text-muted">{jadwalList.length} total data</small>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>No.</th>
                                            <th>ID Jadwal</th>
                                            <th>Tanggal</th>
                                            <th>Hari</th>
                                            <th>Jam</th>
                                            <th>Nama Dosen</th>
                                            <th>Nama Matkul</th>
                                            <th>Status</th> 
                                            <th className="text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jadwalList.map((j, idx) => (
                                            <tr key={j.id_jadwal || idx}>
                                                <td>{idx + 1}.</td>
                                                <td>{j.id_jadwal}</td>
                                                <td>{j.tanggal}</td>
                                                <td>{j.hari}</td>
                                                <td>{j.jam_mulai} - {j.jam_selesai}</td>
                                                <td>{j.nama_dosen}</td>
                                                <td>{j.nama_matkul}</td>
                                                <td>
                                                    {j.status_izin ? ( 
                                                        <span className={`badge bg-${j.status_izin.toLowerCase() === 'dibatalkan' ? 'danger' : 'warning'}`}>{j.status_izin.toUpperCase()}</span>
                                                    ) : (
                                                        <span className="badge bg-success">TERJADWAL</span>
                                                    )}
                                                </td>
                                                <td className="text-center" style={{ width: '150px' }}>
                                                    <button
                                                        className="btn btn-sm btn-primary me-1"
                                                        onClick={() => {
                                                            setJadwalEditId(j.id_jadwal);
                                                            setJadwalForm({
                                                                id_dosen: j.id_dosen,
                                                                id_matkul: j.id_matkul,
                                                                tanggal: j.tanggal,
                                                                jam_mulai: j.jam_mulai,
                                                                jam_selesai: j.jam_selesai
                                                            });
                                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                                        }}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => removeJadwal(j.id_jadwal)}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {jadwalList.length === 0 && (
                                            <tr>
                                                <td colSpan="9" className="text-center py-3">
                                                    Tidak ada data
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* DOSEN TAB */}
            {activeTab === "dosen" && (
              <div className="content-tab active">
                {/* Form Dosen */}
                <div className="card mb-4">
                  <div className="card-header">
                    {dosenEditId ? "Edit Dosen" : "Tambah Dosen Baru"}
                  </div>
                  <div className="card-body">
                    <form onSubmit={submitDosen}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Nama Dosen</label>
                            <input
                              className="form-control"
                              placeholder="Nama Dosen"
                              value={dosenForm.nama_dosen}
                              onChange={(e) => setDosenForm({...dosenForm, nama_dosen: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">UID Kartu</label>
                            <input
                              className="form-control"
                              placeholder="UID Kartu"
                              value={dosenForm.uid_kartu}
                              onChange={(e) => setDosenForm({...dosenForm, uid_kartu: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button className="btn btn-success me-2" type="submit">
                          {dosenEditId ? "Update" : "Simpan"}
                        </button>
                        {dosenEditId && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setDosenEditId(null);
                              setDosenForm({ nama_dosen: "", uid_kartu: "" });
                            }}
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Tabel Dosen */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>Data Dosen</div>
                    <small className="text-muted">{dosenList.length} total data</small>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>No.</th>
                            <th>ID Dosen</th>
                            <th>Nama Dosen</th>
                            <th>UID Kartu</th>
                            <th className="text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dosenList.map((d, idx) => (
                            <tr key={d.id_dosen || idx}>
                              <td>{idx + 1}.</td>
                              <td>{d.id_dosen}</td>
                              <td>{d.nama_dosen}</td>
                              <td>{d.uid_kartu}</td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary me-1"
                                  onClick={() => {
                                    setDosenEditId(d.id_dosen);
                                    setDosenForm({ nama_dosen: d.nama_dosen, uid_kartu: d.uid_kartu });
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeDosen(d.id_dosen)}
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                          {dosenList.length === 0 && (
                            <tr>
                              <td colSpan="5" className="text-center py-3">
                                Tidak ada data
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* MATKUL TAB */}
            {activeTab === "matkul" && (
              <div className="content-tab active">
                {/* Form Matkul */}
                <div className="card mb-4">
                  <div className="card-header">
                    {matkulEditId ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
                  </div>
                  <div className="card-body">
                    <form onSubmit={submitMatkul}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Kode Matkul</label>
                            <input
                              className="form-control"
                              placeholder="Kode Matkul"
                              value={matkulForm.kode_matkul}
                              onChange={(e) => setMatkulForm({...matkulForm, kode_matkul: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Nama Mata Kuliah</label>
                            <input
                              className="form-control"
                              placeholder="Nama Mata Kuliah"
                              value={matkulForm.nama_matkul}
                              onChange={(e) => setMatkulForm({...matkulForm, nama_matkul: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button className="btn btn-success me-2" type="submit">
                          {matkulEditId ? "Update" : "Simpan"}
                        </button>
                        {matkulEditId && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              setMatkulEditId(null);
                              setMatkulForm({ kode_matkul: "", nama_matkul: "" });
                            }}
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Tabel Matkul */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>Data Mata Kuliah</div>
                    <small className="text-muted">{matkulList.length} total data</small>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>No.</th>
                            <th>ID Matkul</th>
                            <th>Kode Matkul</th>
                            <th>Nama Matkul</th>
                            <th className="text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matkulList.map((m, idx) => (
                            <tr key={m.id_matkul || idx}>
                              <td>{idx + 1}.</td>
                              <td>{m.id_matkul}</td>
                              <td>{m.kode_matkul}</td>
                              <td>{m.nama_matkul}</td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary me-1"
                                  onClick={() => {
                                    setMatkulEditId(m.id_matkul);
                                    setMatkulForm({ kode_matkul: m.kode_matkul, nama_matkul: m.nama_matkul });
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeMatkul(m.id_matkul)}
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                          {matkulList.length === 0 && (
                            <tr>
                              <td colSpan="5" className="text-center py-3">
                                Tidak ada data
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* IZIN TAB */}
            {activeTab === "izin" && (
              <div className="content-tab active">
                {/* Form Izin */}
                <div className="card mb-4">
                  <div className="card-header">
                    {izinEditId ? "Edit Izin" : "Buat Izin Baru"}
                  </div>
                  <div className="card-body">
                    <form onSubmit={submitIzin}>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">ID Jadwal</label>
                            <input
                              className="form-control"
                              type="number"
                              value={izinForm.id_jadwal}
                              onChange={(e) => setIzinForm({...izinForm, id_jadwal: e.target.value})}
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Tanggal Izin</label>
                            <input
                              className="form-control"
                              type="date"
                              value={izinForm.tanggal}
                              onChange={(e) => setIzinForm({...izinForm, tanggal: e.target.value})}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Jenis Izin</label>
                            <select
                              className="form-select"
                              value={izinForm.jenis}
                              onChange={(e) => setIzinForm({...izinForm, jenis: e.target.value})}
                              required
                            >
                              <option value="">Pilih</option>
                              <option value="libur">Libur</option>
                              <option value="sakit">Sakit</option>
                              <option value="izin">Izin</option>
                              <option value="dibatalkan">Dibatalkan</option>
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Keterangan (Opsional)</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={izinForm.keterangan}
                              onChange={(e) => setIzinForm({...izinForm, keterangan: e.target.value})}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button className="btn btn-success" type="submit">
                          {izinEditId ? "Update Izin" : "Simpan Izin"}
                        </button>
                        {izinEditId && (
                          <button
                            type="button"
                            className="btn btn-secondary ms-2"
                            onClick={() => {
                              setIzinEditId(null);
                              setIzinForm({ id_jadwal: "", tanggal: "", jenis: "", keterangan: "" });
                            }}
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Tabel Izin */}
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>Data Izin</div>
                    <small className="text-muted">{izinList.length} total data</small>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover table-bordered mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>No.</th>
                            <th>ID Izin</th>
                            <th>ID Jadwal</th>
                            <th>Tanggal</th>
                            <th>Jenis</th>
                            <th>Keterangan</th>
                            <th className="text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {izinList.map((i, idx) => (
                            <tr key={i.id_izin || idx}>
                              <td>{idx + 1}.</td>
                              <td>{i.id_izin}</td>
                              <td>{i.id_jadwal}</td>
                              <td>{i.tanggal}</td>
                              <td>{i.jenis}</td>
                              <td>{i.keterangan}</td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-primary me-1"
                                  onClick={() => {
                                    setIzinEditId(i.id_izin);
                                    setIzinForm({
                                      id_jadwal: i.id_jadwal,
                                      tanggal: i.tanggal,
                                      jenis: i.jenis,
                                      keterangan: i.keterangan
                                    });
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => removeIzin(i.id_izin)}
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                          {izinList.length === 0 && (
                            <tr>
                              <td colSpan="7" className="text-center py-3">
                                Tidak ada data
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ABSENSI TAB */}
            {activeTab === "absensi" && (
              <div className="content-tab active">
                
                {/* Form Absensi (Manual EDIT/HAPUS) */}
                <div className="card mb-4 shadow-sm border-info">
                    <div className="card-header bg-info text-white">
                        <i className="bi bi-person-badge me-2"></i> 
                        {absensiEditId ? "Edit Absensi Dosen" : "Data Absensi"} 
                    </div>
                  <div className="card-body">
                    
                    {absensiEditId ? (
                        /* Tampilan Form EDIT Absensi Manual */
                        <form onSubmit={submitAbsensi}>
                          <p className="fw-bold">Mode Edit Absensi ID: {absensiEditId}</p>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">ID Jadwal</label>
                                <input className="form-control" type="number" value={absensiForm.id_jadwal} onChange={(e) => setAbsensiForm({...absensiForm, id_jadwal: e.target.value})} required/>
                              </div>
                              <div className="mb-3">
                                <label className="form-label">UID Kartu</label>
                                <input className="form-control" placeholder="UID Kartu" value={absensiForm.uid_kartu} onChange={(e) => setAbsensiForm({...absensiForm, uid_kartu: e.target.value})} required/>
                              </div>
                              <div className="mb-3">
                                <label className="form-label">Status Kehadiran</label>
                                <select className="form-select" value={absensiForm.status_kehadiran} onChange={(e) => setAbsensiForm({...absensiForm, status_kehadiran: e.target.value})} required>
                                    <option value="">Pilih Status</option>
                                    <option value="Hadir">Hadir</option>
                                    <option value="Tidak Hadir">Tidak Hadir</option>
                                    <option value="Sakit">Sakit</option>
                                    <option value="Izin">Izin</option>
                                    <option value="Libur">Libur</option>
                                    <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                              </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label className="form-label">Waktu Masuk</label>
                                    <input type="datetime-local" className="form-control" value={absensiForm.waktu_masuk} onChange={(e) => setAbsensiForm({...absensiForm, waktu_masuk: e.target.value})} required/>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Waktu Keluar (Opsional)</label>
                                    <input type="datetime-local" className="form-control" value={absensiForm.waktu_keluar} onChange={(e) => setAbsensiForm({...absensiForm, waktu_keluar: e.target.value})}/>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Keterangan</label>
                                    <input className="form-control" placeholder="Keterangan" value={absensiForm.keterangan} onChange={(e) => setAbsensiForm({...absensiForm, keterangan: e.target.value})}/>
                                </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <button className="btn btn-warning me-2" type="submit">
                                <i className="bi bi-pencil-square me-2"></i> Update Absensi
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                setAbsensiEditId(null);
                                setAbsensiForm({ id_jadwal: "", uid_kartu: "", waktu_masuk: "", waktu_keluar: "", status_kehadiran: "", keterangan: "" });
                                }}
                            >
                                Batal
                            </button>
                          </div>
                        </form>
                    ) : (
                        /* Teks Info jika tidak dalam mode Edit */
                        <p className="text-muted mb-0">Gunakan tombol 'Edit' di tabel di bawah untuk memodifikasi catatan absensi. Catatan absensi untuk Izin dibuat secara otomatis di tab Izin.</p>
                    )}
                  </div>
                </div>

                {/* Tabel Absensi */}
                <div className="card mb-4 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <span className="me-2">Show</span>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 80 }}
                          value={entriesPerPage}
                          onChange={(e) => handleEntriesPerPageChange(e.target.value)}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="15">15</option>
                          <option value="20">20</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                        </select>
                        <span className="ms-2">entries</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <label htmlFor="absensi-search" className="me-2">Search:</label>
                        <input
                          id="absensi-search"
                          type="text"
                          className="form-control form-control-sm"
                          style={{ width: 150 }}
                          placeholder="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={handleSearch}
                        />
                        <button
                          className="btn btn-sm btn-primary ms-2"
                          onClick={() => loadAbsensi(searchTerm, null, 1, entriesPerPage)}
                        >
                          <i className="bi bi-search"></i>
                        </button>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered table-striped table-hover mb-0">
                        <thead className="table-secondary">
                          <tr>
                            <th>No.</th>
                            <th>ID Jadwal</th>
                            <th>Nama Dosen</th>
                            <th>Mata Kuliah</th>
                            <th>Tanggal</th>
                            <th>Jam Masuk</th>
                            <th>Jam Keluar</th>
                            <th>Status & Detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {absensiList.map((a, idx) => {
                            const statusLower = (a.status_kehadiran || "").toLowerCase();
                            // Status dianggap 'Buruk' jika Izin, Sakit, Libur, Dibatalkan, atau Tidak Hadir
                            const isBad = statusLower.includes("tidak") || statusLower.includes("sakit") || statusLower.includes("izin") || statusLower.includes("libur") || statusLower.includes("dibatalkan"); 
                            const badgeClass = isBad ? "badge bg-danger" : "badge bg-success";

                            const waktuMasuk = a.waktu_masuk ? new Date(a.waktu_masuk) : null;
                            const waktuKeluar = a.waktu_keluar ? new Date(a.waktu_keluar) : null;
                            
                            const namaDosen = a.nama_dosen || "-";
                            const namaMatkul = a.nama_matkul || "-";

                            return (
                              <tr key={a.id_absensi || idx}>
                                <td>{(absensiPage - 1) * entriesPerPage + idx + 1}.</td>
                                <td>{a.id_jadwal}</td>
                                <td>{namaDosen}</td>
                                <td>{namaMatkul}</td>
                                <td>{waktuMasuk ? waktuMasuk.toLocaleDateString('id-ID') : "-"}</td>
                                <td>{waktuMasuk ? waktuMasuk.toLocaleTimeString('id-ID') : "-"}</td>
                                <td>{waktuKeluar ? waktuKeluar.toLocaleTimeString('id-ID') : "BELUM KELUAR"}</td>
                                <td className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <span className={badgeClass}>{a.status_kehadiran || "Pending"}</span>
                                    <br/>
                                    <span className="status-detail">({a.keterangan || "-"})</span>
                                  </div>
                                  <div>
                                    <button
                                      className="btn btn-sm btn-info text-white ms-2"
                                      onClick={() => openDetail(a)}
                                    >
                                      <i className="bi bi-search"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-primary ms-2"
                                      onClick={() => handleEditAbsensi(a)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="btn btn-sm btn-danger ms-2"
                                      onClick={() => removeAbsensi(a.id_absensi)}
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {absensiList.length === 0 && (
                            <tr>
                              <td colSpan="8" className="text-center py-3">
                                Tidak ada data
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card-footer d-flex justify-content-between align-items-center">
                    <div id="absensi-showing-info" className="text-muted small">
                      Showing {Math.min((absensiPage - 1) * entriesPerPage + 1, absensiTotal)} to {Math.min(absensiPage * entriesPerPage, absensiTotal)} of {absensiTotal} entries
                    </div>
                    {renderPagination()}
                  </div>
                </div>

                {/* Detail Absensi Card */}
                {detailVisible && detailAbsensi && (
                  <div className="card mb-4 shadow-lg border-info" id="absensi-dosen-card">
                    <div className="card-header d-flex justify-content-between align-items-center bg-info text-white">
                      <div>
                        <i className="bi bi-person-check me-2"></i> Detail Absensi Jadwal {detailAbsensi.id_jadwal}
                      </div>
                      <button className="btn btn-sm btn-light" onClick={closeDetail}>
                        <i className="bi bi-x-lg me-1"></i>Tutup
                      </button>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title text-primary">{detailAbsensi.nama_dosen}</h5>
                      <p className="mb-1">Mata Kuliah: <span className="fw-bold">{detailAbsensi.nama_matkul}</span></p>

                      {detailAbsensi.waktu_masuk && (
                        <p className="mb-3">Tanggal: <span className="fw-bold">
                          {new Date(detailAbsensi.waktu_masuk).toLocaleDateString('id-ID')}
                        </span></p>
                      )}

                      <div className="alert alert-primary p-3" id="detail-status-alert">
                        <h4 className="alert-heading mb-1"><i className="bi bi-info-circle me-2"></i> Status Dosen:</h4>
                        <p className="mb-0 fs-5 fw-bold">{detailAbsensi.status_kehadiran}</p>
                      </div>

                      <div className="table-responsive mt-3">
                        <table className="table table-bordered table-sm mb-0">
                          <thead className="table-primary">
                            <tr>
                              <th>Waktu Absen Masuk</th>
                              <th>Waktu Absen Keluar</th>
                              <th>Keterangan Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>
                                {detailAbsensi.waktu_masuk ?
                                  new Date(detailAbsensi.waktu_masuk).toLocaleString('id-ID') : "-"
                                }
                              </td>
                              <td>
                                {detailAbsensi.waktu_keluar ?
                                  new Date(detailAbsensi.waktu_keluar).toLocaleString('id-ID') : "-"
                                }
                              </td>
                              <td>{detailAbsensi.keterangan || "-"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading and Messages */}
      {loading && (
        <div className="position-fixed top-0 end-0 m-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="position-fixed bottom-0 end-0 m-3 alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg("")}></button>
        </div>
      )}

      {successMsg && (
        <div className="position-fixed bottom-0 end-0 m-3 alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMsg}
          <button type="button" className="btn-close" onClick={() => setSuccessMsg("")}></button>
        </div>
      )}
    </div>
  );
}
