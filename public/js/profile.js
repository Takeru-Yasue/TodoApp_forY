// profile.ejs 内の <script>、または public/js/profile.js
document.addEventListener("change", (e) => {
  const input = e.target;
  if (!(input instanceof HTMLInputElement)) return;
  const label = input.closest(".dept-checkbox");
  if (label) label.classList.toggle("checked", input.checked);
});