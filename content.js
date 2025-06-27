async function fetchGameInfo() {
  const urlParts = window.location.pathname.split("/");
  const steamId = urlParts[2];

  if (!steamId) return;

  function formatDate(timestamp) {
    if (!timestamp) return "..."; // Placeholder kalau data belum ada
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatNumber(number) {
    return number ? number.toLocaleString("id-ID") : "...";
  }

  function formatNumberShort(number, currency = "") {
    if (!number) return "...";
    if (number >= 1e9) {
      return currency + (number / 1e9).toFixed(0) + " B";
    } else if (number >= 1e6) {
      return currency + (number / 1e6).toFixed(0) + " JT";
    } else {
      return currency + new Intl.NumberFormat("id-ID").format(number);
    }
  }

  // Buat elemen container
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="block">
      <table class="game_language_options" cellpadding="0" style="width: 100%" cellspacing="0">
        <tbody>
          <tr>
            <th style="width: 150px;text-align: left"><b>Gamalytic Info</b></th>
            <th style="text-align: right;">Details</th>
          </tr>
          <tr><td style="text-align: left;"><b>Copies Sold</b></td><td style="text-align: right;"><span id="copiesSold">...</span></td></tr>
          <tr><td style="text-align: left;"><b>Revenue</b></td><td style="text-align: right;"><span id="revenue">...</span></td></tr>
          <tr><td style="text-align: left;"><b>Net Income (-30%)</b></td><td style="text-align: right;"><span id="netRevenue">...</span></td></tr>  
          <tr><td style="text-align: left;"><b>Owners</b></td><td style="text-align: right;"><span id="owners">...</span></td></tr>
          <tr><td style="text-align: left;"><b>Release Date</b></td><td style="text-align: right;"><span id="releaseDate">...</span></td></tr>
          <tr><td style="text-align: left;"><b>Early Access Release</b></td><td style="text-align: right;"><span id="eaReleaseDate">...</span></td></tr>
          <tr><td style="text-align: left;"><b>First Release Date</b></td><td style="text-align: right;"><span id="firstReleaseDate">...</span></td></tr>
          <tr><td style="text-align: left;"><b>Early Access Exit</b></td><td style="text-align: right;"><span id="earlyAccessExitDate">...</span></td></tr>
          <tr style="border-bottom: 0px solid #ccc;">
            <td colspan="2" style="text-align: center; padding-top: 10px;">
              <a id="gameLink" href="#" target="_blank">View on Gamalytic</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const targetElement = document.querySelector(".rightcol.game_meta_data");
  if (targetElement) {
    targetElement.prepend(container);
  } else {
    console.warn("Target element tidak ditemukan.");
  }

  try {
    const response = await fetch(`https://api.gamalytic.com/game/${steamId}`);
    const data = await response.json();
    const realUrl = `https://gamalytic.com/game/${steamId}`;
    const netRevenue = data.revenue * 0.7;

    // Update placeholder dengan data asli
    document.getElementById("copiesSold").textContent = formatNumber(
      data.copiesSold
    );
    document.getElementById("revenue").textContent =
      formatNumberShort(data.revenue, "$") +
      " (" +
      formatNumberShort(data.revenue * 16000, "Rp ") +
      ")";
    document.getElementById("netRevenue").textContent =
      formatNumberShort(netRevenue, "$") +
      " (" +
      formatNumberShort(netRevenue * 16000, "Rp ") +
      ")";
    document.getElementById("owners").textContent = formatNumber(data.owners);
    document.getElementById("releaseDate").textContent = formatDate(
      data.releaseDate
    );
    document.getElementById("eaReleaseDate").textContent = formatDate(
      data.EAReleaseDate
    );
    document.getElementById("firstReleaseDate").textContent = formatDate(
      data.firstReleaseDate
    );
    document.getElementById("earlyAccessExitDate").textContent = formatDate(
      data.earlyAccessExitDate
    );
    document.getElementById("gameLink").href = realUrl;
  } catch (error) {
    console.error("Gagal mengambil data game:", error);
  }
}

// Jalankan saat halaman dimuat
fetchGameInfo();
