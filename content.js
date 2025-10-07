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
    return number ? number.toLocaleString("id-ID") : "...";
  }

  function formatNumberShort(number, currency = "") {
    if (!number) return "...";
    if (number >= 1e12) {
      return currency + (number / 1e12).toFixed(2) + " T";
    } else if (number >= 1e9) {
      return currency + (number / 1e9).toFixed(2) + " M";
    } else if (number >= 1e6) {
      return currency + (number / 1e6).toFixed(0) + " M";
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
  } else {
    console.warn("Target element tidak ditemukan.");
  }

  try {
    const response = await fetch(`https://api.gamalytic.com/game/${steamId}`);
    const data = await response.json();
    const realUrl = `https://gamalytic.com/game/${steamId}`;
    const netRevenue = data.revenue * 0.7;

    const hasFullData = data.copiesSold && data.copiesSold > 0;

    if (hasFullData) {
      document.getElementById("wishlistsRow").style.display = "none";
      document.getElementById("topWishRow").style.display = "none";
      document.getElementById("predictedM1Row").style.display = "none";

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

      if (data.EAReleaseDate) {
        document.getElementById("eaReleaseDate").textContent = formatDate(
          data.EAReleaseDate
        );
      } else {
        document.getElementById("eaReleaseDateRow").style.display = "none";
      }

      document.getElementById("firstReleaseDate").textContent = formatDate(
        data.firstReleaseDate
      );

      if (data.earlyAccessExitDate) {
        document.getElementById("earlyAccessExitDate").textContent = formatDate(
          data.earlyAccessExitDate
        );
      } else {
        document.getElementById("earlyAccessExitDateRow").style.display =
          "none";
      }
    } else {
      document.getElementById("wishlists").textContent = formatNumber(
        data.wishlists
      );

      if (data.topWish) {
        document.getElementById("topWish").textContent =
          "#" + formatNumber(data.topWish);
      } else {
        document.getElementById("topWishRow").style.display = "none";
      }

      document.getElementById("predictedM1").textContent =
        data.predictions && data.predictions.m1
          ? formatNumber(data.predictions.m1)
          : "-";

      document.getElementById("copiesSoldRow").style.display = "none";
      document.getElementById("revenueRow").style.display = "none";
      document.getElementById("netRevenueRow").style.display = "none";
      document.getElementById("ownersRow").style.display = "none";
      document.getElementById("releaseDateRow").style.display = "none";
      document.getElementById("eaReleaseDateRow").style.display = "none";
      document.getElementById("firstReleaseDateRow").style.display = "none";
      document.getElementById("earlyAccessExitDateRow").style.display = "none";
    }

    document.getElementById("gameLink").href = realUrl;
  } catch (error) {
    console.error("Gagal mengambil data game:", error);
  }
}

fetchGameInfo();
