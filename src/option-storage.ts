import Browser from "webextension-polyfill";
import { z, ZodObject, ZodType } from "zod";

export type Option = {
  "enable-link": boolean;
  "enable-image": boolean;
  "enable-page": boolean;
  "image-link-target": "no-link" | "link-to-page" | "link-to-image";
  "image-alt-target": "alt" | "alt-fallback-title" | "alt-fallback-filename";
  "privacy-remove-tracking": boolean;
  "action-button": "popup" | "copy";
};
type ZodifiedOptions = {
  [K in keyof Option]: ZodType<Option[K]>;
};

const Option: ZodObject<ZodifiedOptions> = z.object({
  "enable-link": z.boolean(),
  "enable-image": z.boolean(),
  "enable-page": z.boolean(),
  "image-link-target": z.enum(["no-link", "link-to-page", "link-to-image"]),

  "image-alt-target": z.enum([
    "alt",
    "alt-fallback-title",
    "alt-fallback-filename",
  ]),
  "privacy-remove-tracking": z.boolean(),
  "action-button": z.enum(["popup", "copy"]),
});
const PartialOption = Option.partial();

export const defaultOption: Option = {
  "enable-link": true,
  "enable-image": true,
  "enable-page": true,
  "image-link-target": "link-to-page",
  "image-alt-target": "alt-fallback-title",
  "privacy-remove-tracking": true,
  "action-button": "popup",
};

export async function saveOption<Key extends keyof Option>(
  key: Key,
  value: Option[Key],
) {
  await Browser.storage.sync.set({ [key]: value });
}

export async function saveOptions(options: Partial<Option>) {
  await Browser.storage.sync.set(options);
}

export async function getOption<K extends keyof Option>(
  key: K,
): Promise<Option[K]> {
  const result = await Browser.storage.sync.get(key);
  const parsed = await PartialOption.parseAsync(result);
  // @ts-ignore
  return parsed[key] ?? defaultOption[key];
}

export async function getOptions(): Promise<Option> {
  const result = await Browser.storage.sync.get(defaultOption);
  return Option.parseAsync(result);
}
