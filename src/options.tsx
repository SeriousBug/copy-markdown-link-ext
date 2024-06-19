import "./tailwind.css";
import { render } from "solid-js/web";
import Browser from "webextension-polyfill";
import {
  children,
  ParentProps,
  createSignal,
  createResource,
  Switch,
  Match,
} from "solid-js";
import { Option, getOption, saveOption } from "./option-storage";

function Checkbox({
  id,
  onToggle,
  defaultValue,
  ...props
}: ParentProps<{
  id: string;
  defaultValue?: boolean;
  onToggle?: (isChecked: boolean) => void;
}>) {
  const safeChildren = children(() => props.children);
  const [checked, setChecked] = createSignal(defaultValue ?? false);
  console.log("defaultValue", defaultValue, checked());

  return (
    <div class="flex flex-row gap-4">
      <input
        class="appearance-none flex-shrink-0 h-7 w-12 border border-black dark:border-white rounded-5 before:content-[''] before:w-6 before:h-6 before:rounded-5 before:block before:opacity-70 checked:before:opacity-100 before:bg-primary checked:before:translate-x-5 before:transition-all before:duration-200 before:ease-in-out checked:bg-primary-800 dark:checked:bg-primary-200 transition-colors duration-200 ease-in-out"
        type="checkbox"
        id={id}
        name={id}
        checked={checked()}
        onClick={() =>
          setChecked((prev) => {
            onToggle?.(!prev);
            return !prev;
          })
        }
      />
      <label class="flex-shrink flex-grow" for={id}>
        {safeChildren()}
      </label>
    </div>
  );
}

type OptionBoolean = Pick<
  Option,
  {
    [K in keyof Option]: Option[K] extends boolean ? K : never;
  }[keyof Option]
>;

function OptionCheckbox({
  key,
  ...props
}: ParentProps<{
  key: keyof OptionBoolean;
}>) {
  const safeChildren = children(() => props.children);
  const onToggle = (value: boolean) => saveOption(key, value);
  const [defaultValue] = createResource(key, getOption);

  return (
    <Switch>
      <Match when={defaultValue.loading}>Loading...</Match>
      <Match when={defaultValue.error}>
        Error: {defaultValue.error.message}
      </Match>
      <Match when={defaultValue() !== undefined}>
        <Checkbox id={key} onToggle={onToggle} defaultValue={defaultValue()}>
          {safeChildren()}
        </Checkbox>
      </Match>
    </Switch>
  );
}

type ClassValue = string | undefined | null | boolean;

export function clsx(...args: (ClassValue | ClassValue[])[]) {
  return args.flat(1).filter(Boolean).join(" ");
}

function Heading({
  size = "lg",
  ...props
}: ParentProps<{ size?: "lg" | "xl" | "2xl" }>) {
  const safeChildren = children(() => props.children);

  return (
    <h2
      class={clsx(
        size === "lg" && "text-lg",
        size === "xl" && "text-xl",
        size === "2xl" && "text-2xl",
      )}
    >
      {safeChildren()}
    </h2>
  );
}

function Section(props: ParentProps) {
  const safeChildren = children(() => props.children);

  return (
    <section class="bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-10 p-6 flex flex-col gap-4 rounded">
      {safeChildren()}
    </section>
  );
}

function Description(props: ParentProps) {
  const safeChildren = children(() => props.children);

  return <p class="opacity-80">{safeChildren()}</p>;
}

function Page() {
  return (
    <div class="bg-white text-black dark:bg-black dark:text-white p-6 flex flex-col items-center justify-center min-h-screen">
      <div class="flex flex-col items-stretch max-w-[520px] m-4 gap-6">
        <Heading size="2xl">Copy Markdown Link Options</Heading>
        <Section>
          <Heading>Right Click Context Menu</Heading>
          <OptionCheckbox key="enable-link">
            Show copy link when links are right clicked
          </OptionCheckbox>
          <OptionCheckbox key="enable-image">
            Show copy image link when images are right clicked
          </OptionCheckbox>
          <OptionCheckbox key="enable-page">
            Show copy page when an empty spot on a page is right clicked
          </OptionCheckbox>
          <Description>
            If more than one of these options are enabled, the buttons will be
            collapsed under a single menu option if multiple options match what
            you are right clicking. For example if something is both an image
            and a link, you'll get both
          </Description>
        </Section>
        <Section>
          <h2>Image Processing</h2>
          <div>
            <label for="images">Should images be wrapped in a link?</label>
            <select id="images">
              <option value="alt">Do not wrap images in a link</option>
              <option value="alt-fallback-title">
                Images should link to the page they are on
              </option>
              <option value="alt-fallback-filename">
                Images should link to the image file
              </option>
            </select>
          </div>
          <div>
            <label for="images">The image alt text should use</label>
            <select id="images">
              <option value="alt">
                The alt text of the actual image, if available. Otherwise blank.
              </option>
              <option value="alt-fallback-title">
                The alt text of the actual image, if available. Otherwise the
                page title.
              </option>
              <option value="alt-fallback-filename">
                The alt text of the actual image, if available. Otherwise the
                file name.
              </option>
              <option value="title">
                The title of the page the image is on.
              </option>
            </select>
          </div>
        </Section>
        <Section>
          <h2>Page Processing</h2>
          <div>
            <label>Custom Format</label>
            <textarea></textarea>
          </div>
        </Section>
        <Section>
          <h2>Link Processing</h2>
        </Section>
        <Section>
          <Heading>Privacy</Heading>
          <OptionCheckbox key="privacy-remove-tracking">
            Remove tracking parameters from URLs
          </OptionCheckbox>
        </Section>
        <Section>
          <h2>Action Button</h2>
          <div>
            <label for="action-button">
              What to do when the browser action button is clicked
            </label>
            <select id="action-button">
              <option value="popup">
                Open the editable pop-up with current page link
              </option>
              <option value="copy">
                Copy the current page link to the clipboard
              </option>
            </select>
          </div>
        </Section>
      </div>
    </div>
  );
}

render(() => <Page />, document.body);

async () => {
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
};
