// Deteksi halaman saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === "login") {
        setupLoginPage();
    } else if (page === "dashboard") {
        setupDashboardPage();
    } else if (page === "catatan") {
        setupCatatanPage();
    } else if (page === "laporan") {
        setupLaporanPage();
    } else if (page === "reminder") {
        setupReminderPage();
    }
});

// Fungsi umum untuk logout dan kembali ke halaman login
function setupDashboardPage() {
    console.log("Dashboard siap!");

    // Menambahkan event listener untuk tombol logout
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser'); // Menghapus data session pengguna
            window.location.href = "login.html"; // Redirect ke halaman login
        });
    }
}

// Fungsi untuk halaman Login
function setupLoginPage() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Mencegah form submit
            const username = document.getElementById('username').value;
            sessionStorage.setItem('currentUser', username); // Menyimpan username di sessionStorage
            alert("Login berhasil!");
            window.location.href = "dashboard.html"; // Redirect ke dashboard
        });
    }
}

// Fungsi untuk halaman Catatan
function setupCatatanPage() {
    const keluarButton = document.querySelector('.keluar-button');
    if (keluarButton) {
        keluarButton.addEventListener('click', redirectToDashboard);
    }

    const form = document.querySelector('#catatan-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Mencegah form submit

            const date = document.getElementById('date').value;
            const amount = document.getElementById('amount').value;
            const type = document.getElementById('type').value;

            // Format nominal menjadi format Rp
            const formattedAmount = formatRupiah(amount);

            // Menyimpan catatan baru ke sessionStorage
            const catatanBaru = { date, amount: formattedAmount, type };
            const catatanList = JSON.parse(sessionStorage.getItem('catatanList')) || [];
            catatanList.push(catatanBaru);
            sessionStorage.setItem('catatanList', JSON.stringify(catatanList));

            alert("Catatan berhasil disimpan!");
            form.reset();
            tampilkanCatatan(); // Menampilkan ulang daftar catatan
        });
    }

    // Menampilkan catatan yang disimpan
    tampilkanCatatan();
}

// Fungsi untuk menampilkan catatan dari sessionStorage
function tampilkanCatatan() {
    const catatanList = JSON.parse(sessionStorage.getItem('catatanList')) || [];
    const catatanListElement = document.getElementById('catatan-list');

    // Kosongkan list terlebih dahulu
    catatanListElement.innerHTML = '';

    // Menambahkan catatan yang disimpan ke daftar
    catatanList.forEach((catatan) => {
        const li = document.createElement('li');
        li.textContent = `${catatan.date} - ${catatan.amount} (${catatan.type})`;
        catatanListElement.appendChild(li);
    });
}

// Fungsi untuk memformat nominal menjadi format Rp
function formatRupiah(amount) {
    const numberString = amount.replace(/[^,\d]/g, ''); // Menghapus karakter selain angka
    const split = numberString.split(',');
    let remainder = split[0].length % 3;
    let rupiah = split[0].substr(0, remainder);
    const thousands = split[0].substr(remainder).match(/\d{3}/g);

    if (thousands) {
        const separator = remainder ? '.' : '';
        rupiah += separator + thousands.join('.');
    }

    rupiah = split[1] ? rupiah + ',' + split[1] : rupiah;
    return 'Rp. ' + rupiah;
}

function setupLaporanPage() {
    const filterSelect = document.getElementById('filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            alert(`Filter diubah ke: ${filterSelect.value}`);
        });
    }

    const username = sessionStorage.getItem('currentUser'); // Ambil username yang sedang login
    const catatanList = JSON.parse(sessionStorage.getItem('catatanList')) || [];

    if (catatanList.length === 0) {
        alert("Tidak ada catatan untuk ditampilkan di grafik!");
        return; // Jika tidak ada catatan, tidak perlu lanjutkan untuk menggambar grafik
    }

    // Siapkan data untuk grafik
    const pemasukanData = [0, 0, 0, 0];  // Inisialisasi data pemasukan
    const pengeluaranData = [0, 0, 0, 0]; // Inisialisasi data pengeluaran
    const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

    // Mengolah catatan yang ada untuk grafik
    catatanList.forEach(catatan => {
        const weekIndex = weeks.indexOf(`Minggu ${Math.ceil(new Date(catatan.date).getDate() / 7)}`);
        if (catatan.type === "pemasukan") {
            pemasukanData[weekIndex] += parseInt(catatan.amount.replace(/\D/g, ''));  // Menambahkan pemasukan
        } else if (catatan.type === "pengeluaran") {
            pengeluaranData[weekIndex] += parseInt(catatan.amount.replace(/\D/g, ''));  // Menambahkan pengeluaran
        }
    });

    // Data untuk grafik
    const dataKeuangan = {
        labels: weeks,
        datasets: [
            {
                label: "Pemasukan",
                data: pemasukanData,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "Pengeluaran",
                data: pengeluaranData,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Konfigurasi grafik
    const configKeuangan = {
        type: "bar",
        data: dataKeuangan,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    };

    // Render grafik di elemen canvas
    const ctx = document.getElementById("keuanganChart").getContext("2d");
    new Chart(ctx, configKeuangan);
}


// Fungsi umum untuk redirect ke dashboard
function redirectToDashboard() {
    window.location.href = "dashboard.html";
}

// Fungsi untuk logout
function logout() {
    // Redirect ke halaman login
    window.location.href = "index.html";
}