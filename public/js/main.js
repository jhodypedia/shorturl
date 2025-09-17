document.addEventListener("DOMContentLoaded", function() {
  // Socket.IO + Toastr
  if (typeof io !== 'undefined') {
    const socket = io();
    window._socket = socket;

    // toastr config
    if (typeof toastr !== 'undefined') {
      toastr.options = { positionClass: "toast-top-right", closeButton: true, timeOut: 4000, progressBar: true };
    }
    socket.on('new_click', data => { if (window.toastr) toastr.info(`Klik baru dari ${data.country} pada link ${data.link}`); });
    socket.on('new_user', data => { if (window.toastr) toastr.success(`User baru: ${data.name} (${data.email})`); });
    socket.on('update_counter', data => {
      if (data.type === 'users') { const el = document.getElementById('totalUsers'); if (el) el.innerText = data.value; }
      if (data.type === 'links') { const el = document.getElementById('totalLinks'); if (el) el.innerText = data.value; }
      if (data.type === 'clicks') { const el = document.getElementById('totalClicks'); if (el) el.innerText = data.value; }
    });
  }

  // DataTables init
  if (window.$ && $(".datatable").length) {
    $(".datatable").DataTable({
      responsive: true,
      pageLength: 10,
      dom: 'Bfrtip',
      buttons: [
        { extend: 'copy', className: 'btn btn-sm btn-secondary' },
        { extend: 'csv', className: 'btn btn-sm btn-success' },
        { extend: 'excel', className: 'btn btn-sm btn-primary' },
        { extend: 'pdf', className: 'btn btn-sm btn-danger' },
        { extend: 'print', className: 'btn btn-sm btn-info' }
      ]
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
  }
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

  // Sidebar toggle
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      if (window.innerWidth > 992) {
        sidebar.classList.toggle("collapsed");
        sidebar.classList.add("expanded");
        setTimeout(() => sidebar.classList.remove("expanded"), 400);
      } else {
        sidebar.classList.toggle("active");
      }
    });
  }
});
