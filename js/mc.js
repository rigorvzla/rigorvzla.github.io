// Utilidades de navegador para Moto Control.
window.mc = {
    getItem: function (clave) {
        try { return localStorage.getItem(clave); } catch (e) { return null; }
    },
    setItem: function (clave, valor) {
        try { localStorage.setItem(clave, valor); } catch (e) { /* almacenamiento no disponible */ }
    },
    removeItem: function (clave) {
        try { localStorage.removeItem(clave); } catch (e) { /* ignorar */ }
    },
    descargar: function (nombre, base64) {
        const binario = atob(base64);
        const datos = new Uint8Array(binario.length);
        for (let i = 0; i < binario.length; i++) { datos[i] = binario.charCodeAt(i); }
        const blob = new Blob([datos], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 4000);
    },
    confirmar: function (mensaje) {
        return window.confirm(mensaje);
    },
    enfocar: function (id) {
        const el = document.getElementById(id);
        if (el) { el.focus(); el.select && el.select(); }
    }
};
