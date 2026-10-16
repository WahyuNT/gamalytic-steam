async function fetchGameInfo() {
  const urlParts = window.location.pathname.split("/");
  const steamId = urlParts[2];

  if (!steamId) return;

  // Helper Functions
  function formatDate(timestamp) {
    if (!timestamp) return "...";
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatNumber(number) {
    return (number !== null && number !== undefined) ? number.toLocaleString("id-ID") : "...";
  }

  function formatNumberShort(number, currency = "") {
    if (!number) return "...";

    const isRupiah = currency.includes("Rp");

    if (number >= 1e12) {
      const unit = isRupiah ? " T" : " B";
      return currency + (number / 1e12).toFixed(2) + unit;
    } else if (number >= 1e9) {
      const unit = isRupiah ? " M" : " B";
      return currency + (number / 1e9).toFixed(2) + unit;
    } else if (number >= 1e6) {
      const unit = isRupiah ? " Jt" : " M";
      return currency + (number / 1e6).toFixed(2) + unit;
    } else if (number >= 1e3) {
      const unit = isRupiah ? " Rb" : " K";
      return currency + (number / 1e3).toFixed(0) + unit;
    } else {
      return currency + new Intl.NumberFormat("id-ID").format(number);
    }
  }

  // Buat UI Container
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="block">
      <table class="game_language_options" cellpadding="0" style="width: 100%" cellspacing="0">
        <tbody id="gameInfoTable">
          <tr>
            <th style="width: 150px;text-align: left"><b>Informasi Gamalytic</b></th>
            <th style="text-align: right;">Detail</th>
          </tr>
          <tr id="wishlistsRow"><td style="text-align: left;"><b>Wishlist</b></td><td style="text-align: right;"><span id="wishlists">...</span></td></tr>
          <tr id="topWishRow"><td style="text-align: left;"><b>Peringkat Wishlist</b></td><td style="text-align: right;"><span id="topWish">...</span></td></tr>
          <tr id="predictedM1Row"><td style="text-align: left;"><b>Est. Penjualan Bln 1</b></td><td style="text-align: right;"><span id="predictedM1">...</span></td></tr>
          <tr id="copiesSoldRow"><td style="text-align: left;"><b>Terjual</b></td><td style="text-align: right;"><span id="copiesSold">...</span></td></tr>
          <tr id="revenueRow"><td style="text-align: left;"><b>Pendapatan Kotor</b></td><td style="text-align: right;"><span id="revenue">...</span></td></tr>
          <tr id="netRevenueRow"><td style="text-align: left;"><b>Pendapatan Bersih (-30%)</b></td><td style="text-align: right;"><span id="netRevenue">...</span></td></tr>   
          <tr id="ownersRow"><td style="text-align: left;"><b>Pemilik (Owners)</b></td><td style="text-align: right;"><span id="owners">...</span></td></tr>
          <tr id="releaseDateRow"><td style="text-align: left;"><b>Tanggal Rilis</b></td><td style="text-align: right;"><span id="releaseDate">...</span></td></tr>
          <tr id="eaReleaseDateRow"><td style="text-align: left;"><b>Rilis Early Access</b></td><td style="text-align: right;"><span id="eaReleaseDate">...</span></td></tr>
          <tr id="firstReleaseDateRow"><td style="text-align: left;"><b>Rilis Pertama</b></td><td style="text-align: right;"><span id="firstReleaseDate">...</span></td></tr>
          <tr id="earlyAccessExitDateRow"><td style="text-align: left;"><b>Keluarnya Early Access</b></td><td style="text-align: right;"><span id="earlyAccessExitDate">...</span></td></tr>
          <tr style="border-bottom: 0px solid #ccc;">
            <td colspan="2" style="text-align: center; padding-top: 10px;">
              <a id="gameLink" href="#" target="_blank">Lihat di Gamalytic</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const targetElement = document.querySelector(".rightcol.game_meta_data");
  if (targetElement) {
    targetElement.prepend(container);
  }

  // Ambil data lewat Background Script untuk bypass CORS
  const apiUrl = `https://gamalytic.wahyunt.me/game/${steamId}?key=nusan789`;

  chrome.runtime.sendMessage({ action: "fetchGamalytic", url: apiUrl }, (response) => {
    if (chrome.runtime.lastError || !response || !response.success) {
      console.error("Gagal mengambil data game via background:", chrome.runtime.lastError || response?.error);
      return;
    }

    const jsonResponse = response.data;
    const data = jsonResponse.data || jsonResponse;

    if (!data) {
      console.error("Data tidak ditemukan di JSON");
      return;
    }

    const realUrl = `https://gamalytic.com/game/${steamId}`;
    const revenue = data.revenue || 0;
    const netRevenue = revenue * 0.7;
    const hasFullData = data.copiesSold && data.copiesSold > 0;

    if (hasFullData) {
      document.getElementById("wishlistsRow").style.display = "none";
      document.getElementById("topWishRow").style.display = "none";
      document.getElementById("predictedM1Row").style.display = "none";

      document.getElementById("copiesSold").textContent = formatNumber(data.copiesSold);
      document.getElementById("revenue").textContent =
        formatNumberShort(revenue, "$") + " (" + formatNumberShort(revenue * 16000, "Rp ") + ")";
      document.getElementById("netRevenue").textContent =
        formatNumberShort(netRevenue, "$") + " (" + formatNumberShort(netRevenue * 16000, "Rp ") + ")";

      document.getElementById("owners").textContent = formatNumber(data.owners || data.players);
      document.getElementById("releaseDate").textContent = formatDate(data.releaseDate);

      if (data.EAReleaseDate) {
        document.getElementById("eaReleaseDate").textContent = formatDate(data.EAReleaseDate);
      } else {
        document.getElementById("eaReleaseDateRow").style.display = "none";
      }

      document.getElementById("firstReleaseDate").textContent = formatDate(data.firstReleaseDate);

      if (data.earlyAccessExitDate) {
        document.getElementById("earlyAccessExitDate").textContent = formatDate(data.earlyAccessExitDate);
      } else {
        document.getElementById("earlyAccessExitDateRow").style.display = "none";
      }
    } else {
      document.getElementById("wishlists").textContent = (data.wishlists === true) ? "Terlacak" : formatNumber(data.wishlists);

      if (data.history && data.history.length > 0) {
        const latest = data.history[data.history.length - 1];
        document.getElementById("topWish").textContent = latest.rank ? "#" + formatNumber(latest.rank) : "-";
      } else {
        document.getElementById("topWishRow").style.display = "none";
      }

      document.getElementById("predictedM1").textContent = "-";

      const rowsToHide = ["copiesSoldRow", "revenueRow", "netRevenueRow", "ownersRow", "releaseDateRow", "eaReleaseDateRow", "firstReleaseDateRow", "earlyAccessExitDateRow"];
      rowsToHide.forEach(id => document.getElementById(id).style.display = "none");
    }

    document.getElementById("gameLink").href = realUrl;
  });
}

fetchGameInfo();
