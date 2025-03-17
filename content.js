async function fetchGameInfo() {
  // Ambil Steam ID dari URL
  const urlParts = window.location.pathname.split("/");
  const steamId = urlParts[2];

  if (!steamId) return;
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  try {
    // Ambil data dari API
    const response = await fetch(`https://api.gamalytic.com/game/${steamId}`);
    const realUrl = `https://gamalytic.com/game/${steamId}`;
    const data = await response.json();

    // Buat elemen baru buat nambahin teks di halaman
    const container = document.createElement("div");

    function formatNumber(number) {
      return number.toLocaleString("id-ID");
    }
    function formatNumberShort(number, currency = "") {
      if (number >= 1e9) {
        return currency + (number / 1e9).toFixed(0) + " B";
      } else if (number >= 1e6) {
        return currency + (number / 1e6).toFixed(0) + " M";
      } else {
        return currency + new Intl.NumberFormat("id-ID").format(number);
      }
    }

    container.innerHTML = `
    <div class="block">
         <table class="game_language_options" cellpadding="0" style="width: 100%" cellspacing="0">
    <tbody>
        <tr>
            <th style="width: 150px;"><b>Gamalytic</b></th>
            <th style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">Details</th>
        </tr>
        <tr>
            <td style="width: 150px; text-align: left" class="ellipsis"><b>Copies Sold</b></td>
            <td style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">${formatNumber(data.copiesSold)}</td>
        </tr>
        <tr>
            <td style="width: 150px; text-align: left" class="ellipsis"><b>Revenue</b></td>
            <td style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">${formatNumberShort(data.revenue, "$")} - ${formatNumberShort(
      data.revenue * 16000,
      "Rp "
    )}</td>
        </tr>
        <tr>
            <td style="width: 150px; text-align: left" class="ellipsis"><b>Owners</b></td>
            <td style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">${formatNumber(data.owners)}</td>
        </tr>
        <tr>
            <td style="width: 150px; text-align: left" class="ellipsis"><b>Release Date</b></td>
            <td style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">${formatDate(data.releaseDate)}</td>
        </tr>
        <tr>
            <td style="width: 150px; text-align: left" class="ellipsis"><b>Early Access Release</b></td>
            <td style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">${formatDate(data.EAReleaseDate)}</td>
        </tr>
        <tr>
            <td style="width: 150px; text-align: left" class="ellipsis"><b>First Release Date</b></td>
            <td style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">${formatDate(data.firstReleaseDate)}</td>
        </tr>
        <tr>
            <td style="width: 150px; text-align: left" class="ellipsis"><b>Early Access Exit</b></td>
            <td style="text-align: right;color: 'rgb(103, 193, 245);
 !important'">${formatDate(data.earlyAccessExitDate)}</td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: center; padding-top: 10px;">
                <a href="${realUrl}" target="_blank">View on Gamalytic</a>
            </td>
        </tr>
    </tbody>
</table>

    </div>
`;

    // Masukin elemen ini ke bawah elemen yang ditunjuk di gambar
    const targetElement = document.querySelector(".rightcol.game_meta_data");
    if (targetElement) {
      targetElement.prepend(container); // Masukin elemen ke paling atas
    } else {
      console.warn("Target element tidak ditemukan.");
    }
  } catch (error) {
    console.error("Gagal mengambil data game:", error);
  }
}

// Jalankan saat halaman dimuat
fetchGameInfo();
