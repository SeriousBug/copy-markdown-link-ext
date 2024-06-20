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
        class="appearance-none flex-shrink-0 h-7 w-12 border border-primary-300 dark:border-primary-700 rounded-5 before:content-[''] before:w-6 before:h-6 before:rounded-5 before:block before:opacity-70 checked:before:opacity-100 before:bg-primary checked:before:translate-x-5 before:transition-all before:duration-200 before:ease-in-out checked:bg-primary-800 dark:checked:bg-primary-200 transition-colors duration-200 ease-in-out"
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
type OptionEnum = Pick<
  Option,
  {
    [K in keyof Option]: Option[K] extends string ? K : never;
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

function Description(props: ParentProps<{ class?: string }>) {
  const safeChildren = children(() => props.children);

  return <p class={clsx(props.class, "opacity-80")}>{safeChildren()}</p>;
}

function Select({ label, ...props }: ParentProps<{ label: string }>) {
  const safeChildren = children(() => props.children);

  return (
    <fieldset class="flex flex-col gap-2">
      <legend>{label}</legend>
      <div class="ml-4 mt-2 flex flex-col gap-1">{safeChildren()}</div>
    </fieldset>
  );
}

function SelectChoice<I extends string>({
  group,
  id,
  children,
  checked,
  onChecked,
}: {
  group: string;
  id: I;
  children: string;
  checked?: boolean;
  onChecked?: (id: I) => void;
}) {
  return (
    <div class="flex flex-row gap-4">
      <input
        class="appearance-none border border-primary-300 dark:border-primary-700 w-6 h-6 flex-none rounded-full checked:bg-primary-500 transition-all duration-200 ease-in-out"
        name={group}
        type="radio"
        id={id}
        checked={checked}
        onChange={(e) => {
          e.target.checked && onChecked?.(id);
        }}
      />
      <label for={id}>{children}</label>
    </div>
  );
}

function OptionSelectChoice<K extends keyof OptionEnum>({
  group,
  children,
  choice,
}: {
  group: K;
  choice: Option[K];
  children: string;
}) {
  const onChecked = (value: Option[K]) => saveOption(group, value);
  const [defaultValue] = createResource(group, getOption);

  return (
    <Switch>
      <Match when={defaultValue.loading}>Loading...</Match>
      <Match when={defaultValue.error}>
        Error: {defaultValue.error.message}
      </Match>
      <Match when={defaultValue() !== undefined}>
        <SelectChoice
          group={group}
          id={choice}
          onChecked={onChecked}
          checked={choice === defaultValue()}
        >
          {children}
        </SelectChoice>
      </Match>
    </Switch>
  );
}

function Highlight({ children }: { children: string }) {
  return (
    <span class="text-highlight-300 dark:text-highlight-700">{children}</span>
  );
}

function Pre(props: ParentProps) {
  return (
    <pre class="inline break-words whitespace-pre-wrap">{props.children}</pre>
  );
}

function Page() {
  return (
    <div class="bg-white text-base text-black dark:bg-black dark:text-white p-6 flex flex-col items-center justify-center min-h-screen">
      <div class="flex flex-col items-stretch max-w-[48rem] m-4 gap-6">
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
            If more than one context menu item is applicable, all of them will
            be put under a submenu. This is a{" "}
            {import.meta.env.BROWSER_NAME ?? "browser"} feature that can't be
            disabled.
          </Description>
        </Section>

        <Section>
          <Heading>Images</Heading>
          <Select label="Should images be wrapped in a link?">
            <Description class="mb-2">
              Example:{" "}
              <Pre>
                <Highlight>[</Highlight>
                ![](https://example.com/image.png)
                <Highlight>](https://example.com/page)</Highlight>
              </Pre>
            </Description>
            <OptionSelectChoice
              group="image-link-target"
              choice="link-to-image"
            >
              Do not wrap images in a link
            </OptionSelectChoice>
            <OptionSelectChoice group="image-link-target" choice="link-to-page">
              Wrap images in a link to the page
            </OptionSelectChoice>
            <OptionSelectChoice group="image-link-target" choice="no-link">
              Wrap images in a link to the image file
            </OptionSelectChoice>
          </Select>
          <Select label="What to put as the alt text of the image?">
            <Description class="mb-2">
              Alt text is{" "}
              <Pre>
                ![
                <Highlight>this</Highlight>
                ](...)
              </Pre>{" "}
              part of the link.
            </Description>
            <OptionSelectChoice group="image-alt-target" choice="none">
              No alt text.
            </OptionSelectChoice>
            <OptionSelectChoice group="image-alt-target" choice="alt">
              The alt text of the actual image, if available. Otherwise blank.
            </OptionSelectChoice>
            <OptionSelectChoice
              group="image-alt-target"
              choice="alt-fallback-title"
            >
              The alt text of the actual image, if available. Otherwise the page
              title.
            </OptionSelectChoice>
            <OptionSelectChoice
              group="image-alt-target"
              choice="alt-fallback-filename"
            >
              The alt text of the actual image, if available. Otherwise the file
              name.
            </OptionSelectChoice>
            <SelectChoice group="images" id="title">
              The title of the page the image is on.
            </SelectChoice>
          </Select>
        </Section>

        <Section>
          <Heading>Privacy</Heading>
          <OptionCheckbox key="privacy-remove-tracking">
            Remove tracking parameters from URLs
          </OptionCheckbox>
        </Section>

        <Section>
          <Heading>Browser Action Button</Heading>
          <Description>
            The action button is the extension icon in the top navigation bar.
          </Description>
          <Select label="What should clicking the action button do?">
            <OptionSelectChoice group="action-button" choice="popup">
              Show a popup, allowing you to edit and copy the link.
            </OptionSelectChoice>
            <OptionSelectChoice group="action-button" choice="copy">
              Copy the markdown link to clipboard, without showing a popup.
            </OptionSelectChoice>
          </Select>
        </Section>

        <Description>Changes are saved automatically.</Description>
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
