async function fetchGameInfo() {
  const urlParts = window.location.pathname.split("/");
  const steamId = urlParts[2];

  if (!steamId) return;

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
    if (number >= 1e12) {
      return currency + (number / 1e12).toFixed(2) + " T";
    } else if (number >= 1e9) {
      return currency + (number / 1e9).toFixed(2) + " M";
    } else if (number >= 1e6) {
      return currency + (number / 1e6).toFixed(0) + " JT";
    } else {
      return currency + new Intl.NumberFormat("id-ID").format(number);
    }
  }

  const container = document.createElement("div");
  container.innerHTML = `
    <div class="block">
      <table class="game_language_options" cellpadding="0" style="width: 100%" cellspacing="0">
        <tbody id="gameInfoTable">
          <tr>
            <th style="width: 150px;text-align: left"><b>Gamalytic Info</b></th>
            <th style="text-align: right;">Details</th>
          </tr>
          <tr id="wishlistsRow"><td style="text-align: left;"><b>Wishlists</b></td><td style="text-align: right;"><span id="wishlists">...</span></td></tr>
          <tr id="topWishRow"><td style="text-align: left;"><b>Top Wish</b></td><td style="text-align: right;"><span id="topWish">...</span></td></tr>
          <tr id="predictedM1Row"><td style="text-align: left;"><b>Predicted Month 1 Sales</b></td><td style="text-align: right;"><span id="predictedM1">...</span></td></tr>
          <tr id="copiesSoldRow"><td style="text-align: left;"><b>Copies Sold</b></td><td style="text-align: right;"><span id="copiesSold">...</span></td></tr>
          <tr id="revenueRow"><td style="text-align: left;"><b>Revenue</b></td><td style="text-align: right;"><span id="revenue">...</span></td></tr>
          <tr id="netRevenueRow"><td style="text-align: left;"><b>Net Income (-30%)</b></td><td style="text-align: right;"><span id="netRevenue">...</span></td></tr>  
          <tr id="ownersRow"><td style="text-align: left;"><b>Owners</b></td><td style="text-align: right;"><span id="owners">...</span></td></tr>
          <tr id="releaseDateRow"><td style="text-align: left;"><b>Release Date</b></td><td style="text-align: right;"><span id="releaseDate">...</span></td></tr>
          <tr id="eaReleaseDateRow"><td style="text-align: left;"><b>Early Access Release</b></td><td style="text-align: right;"><span id="eaReleaseDate">...</span></td></tr>
          <tr id="firstReleaseDateRow"><td style="text-align: left;"><b>First Release Date</b></td><td style="text-align: right;"><span id="firstReleaseDate">...</span></td></tr>
          <tr id="earlyAccessExitDateRow"><td style="text-align: left;"><b>Early Access Exit</b></td><td style="text-align: right;"><span id="earlyAccessExitDate">...</span></td></tr>
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
  }

  try {
    const response = await fetch(`https://gamalytic.wahyunt.me/game/${steamId}?key=nusan789`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    const jsonResponse = await response.json();

    // PERBAIKAN DI SINI: Mapping ke jsonResponse.data
    const data = jsonResponse.data;

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
      // Jika game belum rilis atau data penjualan belum ada
      document.getElementById("wishlists").textContent = (data.wishlists === true) ? "Tracked" : formatNumber(data.wishlists);

      // Ambil Top Wish dari history terakhir jika tersedia
      if (data.history && data.history.length > 0) {
        const latest = data.history[data.history.length - 1];
        document.getElementById("topWish").textContent = latest.rank ? "#" + formatNumber(latest.rank) : "-";
      } else {
        document.getElementById("topWishRow").style.display = "none";
      }

      document.getElementById("predictedM1").textContent = "-";

      // Sembunyikan baris rilis
      const rowsToHide = ["copiesSoldRow", "revenueRow", "netRevenueRow", "ownersRow", "releaseDateRow", "eaReleaseDateRow", "firstReleaseDateRow", "earlyAccessExitDateRow"];
      rowsToHide.forEach(id => document.getElementById(id).style.display = "none");
    }

    document.getElementById("gameLink").href = realUrl;
  } catch (error) {
    console.error("Gagal mengambil data game:", error);
  }
}

fetchGameInfo();