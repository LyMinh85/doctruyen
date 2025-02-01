// Create a Providers component to wrap your application with all the components requiring 'use client', such as next-nprogress-bar or your different contexts...
"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
const gradientColor = "linear-gradient(180deg,#5a67d8,#04c8bb 161.33%)";

const ProgressBarProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color={gradientColor}
        options={{ showSpinner: true }}
        shallowRouting
      />
    </>
  );
};

export default ProgressBarProvider;
