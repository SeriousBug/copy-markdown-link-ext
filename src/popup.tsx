import "./tailwind.css";
import { render } from "solid-js/web";
import Browser from "webextension-polyfill";

function Page() {
  return (
    <div class="bg-white text-black dark:bg-black dark:text-white p-6 w-[600px] flex flex-col items-center justify-center">
      <input
        class="border-black dark:border-white bg-transparent text-inherit p-1 mb-8 border rounded outline-none focus:shadow-lg focus:shadow-primary transition-all duration-300 w-full"
        type="text"
        id="copy-text"
      />
      <button
        class="border-none bg-primary-300 dark:bg-primary-700 text-inherit transition-all duration-100 w-24 px-2 py-4 rounded"
        id="copy-button"
      >
        Copy
      </button>
    </div>
  );
}

(async () => {
  render(() => <Page />, document.body);
  const [activeTab] = await Browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab || !activeTab.url) return;
  const input = document.querySelector<HTMLInputElement>("#copy-text");
  if (!input) return;
  input.value = `[${activeTab.title ?? ""}](${activeTab.url})`;
  input.select();
  const copyButton = document.querySelector<HTMLButtonElement>("#copy-button");
  if (!copyButton) return;

  const clickAnimationClasses = ["bg-blue-100", "dark:bg-blue-900"];
  let copied = false;
  // Copy to clipboard, and temporarily change the button text to show it worked
  copyButton.addEventListener("click", () => {
    if (copied) return;
    copied = true;
    navigator.clipboard.writeText(input.value);
    copyButton.textContent = "Copied!";
    setTimeout(() => {
      try {
        copyButton.textContent = "Copy";
      } finally {
        copied = false;
      }
    }, 1000);
  });
  // Click animation
  copyButton.addEventListener("click", () => {
    copyButton.classList.add(...clickAnimationClasses);
    setTimeout(() => {
      copyButton.classList.remove(...clickAnimationClasses);
    }, 100);
  });
})();
