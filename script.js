function simulateFall() {
    document.getElementById("status").innerText = "FALL DETECTED";
    document.getElementById("status").className = "fall";

    document.getElementById("alert").innerText = "⚠️ Emergency! Fall detected!";

    // Random acceleration values
    document.getElementById("x").innerText = (Math.random() * 10).toFixed(2);
    document.getElementById("y").innerText = (Math.random() * 10).toFixed(2);
    document.getElementById("z").innerText = (Math.random() * 10).toFixed(2);
}

function resetStatus() {
    document.getElementById("status").innerText = "SAFE";
    document.getElementById("status").className = "safe";

    document.getElementById("alert").innerText = "No alerts";

    document.getElementById("x").innerText = "0";
    document.getElementById("y").innerText = "0";
    document.getElementById("z").innerText = "0";
}