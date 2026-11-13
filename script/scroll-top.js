const btnVoltarTopo = document.getElementById("btnVoltarTopo");

btnVoltarTopo.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Rolar de forma suave
  });
});