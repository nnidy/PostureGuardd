import { Chart } from "chart.js/auto";
// Get the canvas element
// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById("myChart");

    // Check if canvas exists
    if (!ctx) {
        console.error("Canvas element not found!");
        return;
    }

    new Chart(ctx, {
        type: "line",
        data: {
            labels: [
                "00:00",
                "01:00",
                "02:00",
                "03:00",
                "04:00",
                "05:00",
                "06:00",
                "07:00",
                "08:00",
                "09:00",
                "10:00",
                "11:00",
                "12:00",
            ],
            datasets: [
                {
                    label: "Postur Duduk Baik (%)",
                    data: [65, 59, 80, 81, 56, 55, 40, 75, 82, 90, 85, 78, 92],
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 2,
                    tension: 0.1,
                    fill: true,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: "Persentase Postur Duduk Baik per Jam",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: "Persentase (%)" },
                },
                x: {
                    title: { display: true, text: "Waktu" },
                },
            },
        },
    });
});
