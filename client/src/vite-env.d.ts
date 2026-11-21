/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_FACEBOOK_URL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_YOUTUBE_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
