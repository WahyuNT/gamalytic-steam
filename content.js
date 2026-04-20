function fetchGameInfo() {
  const urlParts = window.location.pathname.split("/");
  const steamId = urlParts[2];

  if (!steamId) return;

  // ================= UI HELPERS =================
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "...";
  }

  function hide(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  function formatDate(timestamp) {
    if (!timestamp) return "...";
    return new Date(timestamp).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatNumber(num) {
    return num ? num.toLocaleString("id-ID") : "...";
  }

  function formatNumberShort(num, currency = "") {
    if (!num) return "...";
    if (num >= 1e12) return currency + (num / 1e12).toFixed(2) + " T";
    if (num >= 1e9) return currency + (num / 1e9).toFixed(2) + " M";
    if (num >= 1e6) return currency + (num / 1e6).toFixed(0) + " M";
    return currency + new Intl.NumberFormat("id-ID").format(num);
  }

  // ================= UI =================
  const container = document.createElement("div");
  container.innerHTML = `
    <div class="block">
      <table class="game_language_options" style="width:100%">
        <tbody>
          <tr><th>Gamalytic Info</th><th style="text-align:right;">Details</th></tr>

          <tr id="wishlistsRow"><td>Wishlists</td><td id="wishlists">...</td></tr>
          <tr id="topWishRow"><td>Top Wish</td><td id="topWish">...</td></tr>
          <tr id="predictedM1Row"><td>Predicted M1</td><td id="predictedM1">...</td></tr>

          <tr id="copiesSoldRow"><td>Copies Sold</td><td id="copiesSold">...</td></tr>
          <tr id="revenueRow"><td>Revenue</td><td id="revenue">...</td></tr>
          <tr id="netRevenueRow"><td>Net Income</td><td id="netRevenue">...</td></tr>
          <tr id="ownersRow"><td>Owners</td><td id="owners">...</td></tr>

          <tr id="releaseDateRow"><td>Release</td><td id="releaseDate">...</td></tr>
          <tr id="eaReleaseDateRow"><td>Early Access</td><td id="eaReleaseDate">...</td></tr>
          <tr id="firstReleaseDateRow"><td>First Release</td><td id="firstReleaseDate">...</td></tr>
          <tr id="earlyAccessExitDateRow"><td>Exit EA</td><td id="earlyAccessExitDate">...</td></tr>

          <tr>
            <td colspan="2" style="text-align:center;">
              <a id="gameLink" target="_blank">View on Gamalytic</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const target = document.querySelector(".rightcol.game_meta_data");
  if (target) target.prepend(container);

  // ================= FETCH VIA BACKGROUND (NO CORS) =================
  chrome.runtime.sendMessage(
    { type: "GET_GAME", steamId },
    (res) => {
      if (!res?.success) {
        console.error("API error", res?.error);
        return;
      }

      const data = res.data;

      const revenue = Number(data.revenue || 0);
      const netRevenue = revenue * 0.7;

      const realUrl = `https://gamalytic.com/game/${steamId}`;

      const hasFullData = data.copiesSold && data.copiesSold > 0;

      if (hasFullData) {
        hide("wishlistsRow");
        hide("topWishRow");
        hide("predictedM1Row");

        setText("copiesSold", formatNumber(data.copiesSold));
        setText(
          "revenue",
          `${formatNumberShort(data.revenue, "$")} (${formatNumberShort(data.revenue * 16000, "Rp ")})`
        );
        setText(
          "netRevenue",
          `${formatNumberShort(netRevenue, "$")} (${formatNumberShort(netRevenue * 16000, "Rp ")})`
        );
        setText("owners", formatNumber(data.owners));
        setText("releaseDate", formatDate(data.releaseDate));

        if (data.EAReleaseDate) setText("eaReleaseDate", formatDate(data.EAReleaseDate));
        else hide("eaReleaseDateRow");

        setText("firstReleaseDate", formatDate(data.firstReleaseDate));

        if (data.earlyAccessExitDate) setText("earlyAccessExitDate", formatDate(data.earlyAccessExitDate));
        else hide("earlyAccessExitDateRow");
      } else {
        setText("wishlists", formatNumber(data.wishlists));

        if (data.topWish) setText("topWish", `#${formatNumber(data.topWish)}`);
        else hide("topWishRow");

        setText("predictedM1", data.predictions?.m1 ? formatNumber(data.predictions.m1) : "-");

        hide("copiesSoldRow");
        hide("revenueRow");
        hide("netRevenueRow");
        hide("ownersRow");
        hide("releaseDateRow");
        hide("eaReleaseDateRow");
        hide("firstReleaseDateRow");
        hide("earlyAccessExitDateRow");
      }

      const link = document.getElementById("gameLink");
      if (link) link.href = realUrl;
    }
  );
}

fetchGameInfo();