// script.js - intercept form submission, save inputs, and display them

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registration-form");
  const output = document.getElementById("output");

  // load and display any existing entries on page load
  displayEntries();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // collect values from the form
    const data = new FormData(form);
    const entry = {};
    const fileReads = [];

    data.forEach((val, key) => {
      if (val instanceof File) {
        if (val.name) {
          // read file as data URL for preview/storage
          const promise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              entry[key] = {
                name: val.name,
                type: val.type,
                size: val.size,
                dataURL: reader.result,
              };
              resolve();
            };
            reader.readAsDataURL(val);
          });
          fileReads.push(promise);
        } else {
          entry[key] = "";
        }
      } else {
        entry[key] = val;
      }
    });

    // wait for all file reads to complete
    await Promise.all(fileReads);

    // check for unique email
    const existing = JSON.parse(localStorage.getItem("entries") || "[]");
    const emailExists = existing.some(e => e.email === entry.email);
    if (emailExists) {
      alert("This email is already registered. Please use a different email.");
      return;
    }

    // save to localStorage
    saveEntry(entry);

    // update display
    displayEntries();
    form.reset();
  });

  function saveEntry(entry) {
    const existing = JSON.parse(localStorage.getItem("entries") || "[]");
    existing.push(entry);
    localStorage.setItem("entries", JSON.stringify(existing));
  }

  function displayEntries() {
    const existing = JSON.parse(localStorage.getItem("entries") || "[]");
    if (existing.length === 0) {
      output.innerHTML = "<p>No submissions yet.</p>";
      return;
    }

    // create a simple table of results
    let html = '<h2>Submitted Data</h2>';
    html += '<table border="1" cellpadding="5" style="margin:0 auto; background:#fff; color:#000;">';
    html += '<tr><th>Field</th><th>Value</th></tr>';

    existing.forEach((entry, index) => {
      html += `<tr><td colspan="2" style="background:#ccc">Submission #${index + 1}</td></tr>`;
      for (const key in entry) {
        const value = entry[key];
        // if value looks like a stored file object, display accordingly
        if (
          value &&
          typeof value === "object" &&
          "name" in value
        ) {
          html += `<tr><td>${key}</td><td>`;
          if (value.dataURL) {
            if (value.type && value.type.startsWith("image/")) {
              html += `<img src="${value.dataURL}" alt="${value.name}" style="max-width:100px; max-height:100px; display:block; margin-bottom:4px;"/>`;
            }
            html += `<div>${value.name}</div>`;
          } else {
            html += `<div>${value.name}</div>`;
          }
          html += `</td></tr>`;
        } else {
          html += `<tr><td>${key}</td><td>${value}</td></tr>`;
        }
      }
    });

    html += '</table>';
    output.innerHTML = html;
  }
});