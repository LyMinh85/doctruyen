import { Button } from "./ui/button";

export function OAuthButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="outline" className="w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">Continue with Google</span>
        Google
      </Button>
      <Button variant="outline" className="w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            d="M12 0C5.373 0 0 5.373 0 12c0 5.999 4.37 10.972 10.062 11.888v-8.405H7.094V12h2.968V9.41c0-2.937 1.75-4.563 4.424-4.563 1.281 0 2.562.228 2.562.228v2.812h-1.438c-1.42 0-1.875.88-1.875 1.781V12h3l-.5 3.483h-2.5v8.405C19.63 22.972 24 17.999 24 12c0-6.627-5.373-12-12-12"
            fill="currentColor"
          />
        </svg>
        <span className="sr-only">Continue with Facebook</span>
        Facebook
      </Button>
    </div>
  );
}
