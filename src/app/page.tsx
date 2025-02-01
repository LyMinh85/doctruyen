import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-100">
      <div className="z-10 w-full max-w-md md:max-w-full md:w-fit p-8 rounded-2xl bg-white shadow-2xl text-center">
        <h1>Welcome to doctruyen</h1>
        <h2>There are currently 2 page: </h2>
        <ul>
          <SignedOut>
            <li>
              <a href="/auth/login">Login</a>
            </li>
            <li>
              <a href="/auth/sign-up">Sign Up</a>
            </li>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </ul>
      </div>
    </div>
  );
}
