// Theme toggle (auto follow prefers-color-scheme)
(function(){
  const root=document.documentElement;
  const saved=localStorage.getItem('theme');
  if(saved){ root.setAttribute('data-theme',saved); }
})();
document.addEventListener('click',(e)=>{
  if(e.target.matches('[data-theme-toggle]')){
    const root=document.documentElement;
    const next=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',next); localStorage.setItem('theme',next);
  }
});

// Mobile sidebar open/close (optional if you add buttons)
const sidebar=document.getElementById('sidebar');
document.addEventListener('click',(e)=>{
  if(e.target.id==='btnOpenSidebar') sidebar?.classList.add('show');
  if(e.target.id==='btnCloseSidebar') sidebar?.classList.remove('show');
});
